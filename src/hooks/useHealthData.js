import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Health } from '@capgo/capacitor-health';
import { supabase } from '../lib/supabase';
import { getBrowserFingerprint } from '../utils/browserFingerprint';

export const useHealthData = () => {
  // State management
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Platform detection
  const isIOS = Capacitor.getPlatform() === 'ios';

  // Get user ID
  const userId = getBrowserFingerprint();

  // Request Apple Health permissions
  const requestPermissions = useCallback(async () => {
    if (!isIOS) {
      setError('Apple Health is only available on iOS devices');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Request permissions for steps and weight
      const result = await Health.requestAuthorization({
        read: ['steps', 'weight'],
        write: []
      });

      if (result.granted) {
        setHasPermissions(true);
        return true;
      } else {
        setHasPermissions(false);
        setError('Apple Health permissions were denied. Please enable them in Settings to sync your health data.');
        return false;
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Failed to request Apple Health permissions: ' + err.message);
      setHasPermissions(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isIOS]);

  // Check if permissions are already granted
  useEffect(() => {
    const checkPermissions = async () => {
      if (!isIOS) return;

      try {
        // Try to check if we already have permissions
        const result = await Health.checkPermissions({
          read: ['steps', 'weight']
        });

        if (result.granted) {
          setHasPermissions(true);
        }
      } catch (err) {
        // If checking fails, we'll assume no permissions
        console.log('Could not check permissions:', err);
      }
    };

    checkPermissions();
  }, [isIOS]);

  // Sync data from Apple Health
  const syncFromAppleHealth = useCallback(async () => {
    if (!isIOS) {
      setError('Apple Health is only available on iOS devices');
      return false;
    }

    if (!hasPermissions) {
      const granted = await requestPermissions();
      if (!granted) return false;
    }

    // Debounce: Check if we synced recently (within last 5 minutes)
    if (lastSyncTime) {
      const timeSinceLastSync = Date.now() - new Date(lastSyncTime).getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceLastSync < fiveMinutes) {
        const minutesRemaining = Math.ceil((fiveMinutes - timeSinceLastSync) / 60000);
        setError(`Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before syncing again`);
        return false;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate date range (last 12 weeks)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago

      // Query steps data with error handling
      let stepsData = [];
      try {
        stepsData = await Health.queryAggregated({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dataType: 'steps',
          interval: 'day'
        });
      } catch (stepsError) {
        console.error('Error querying steps data:', stepsError);
        // Continue with weight data even if steps fail
        setError('Warning: Could not sync steps data. Weight data will still be synced.');
      }

      // Query weight data with error handling
      let weightData = [];
      try {
        weightData = await Health.query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dataType: 'weight'
        });
      } catch (weightError) {
        console.error('Error querying weight data:', weightError);
        // If both failed, throw error
        if (stepsData.length === 0) {
          throw new Error('Could not sync any health data. Please check your Apple Health permissions and try again.');
        }
        setError('Warning: Could not sync weight data. Steps data will still be synced.');
      }

      // Transform data to match database schema
      const transformedData = {};

      // Process steps data (aggregated by day)
      if (stepsData && stepsData.length > 0) {
        stepsData.forEach(entry => {
          const date = new Date(entry.startDate).toISOString().split('T')[0];
          const steps = Math.round(entry.value);
          
          // Validate steps data before adding
          const validation = validateHealthData(steps, null);
          if (validation.isValid) {
            if (!transformedData[date]) {
              transformedData[date] = { date, steps: null, weight: null };
            }
            transformedData[date].steps = steps;
          } else {
            console.warn(`Invalid steps data for ${date}: ${steps}`, validation.errors);
          }
        });
      }

      // Process weight data (may have multiple entries per day, we'll take the latest)
      if (weightData && weightData.length > 0) {
        const weightByDate = {};
        weightData.forEach(entry => {
          const date = new Date(entry.startDate).toISOString().split('T')[0];
          const timestamp = new Date(entry.startDate).getTime();
          const weight = parseFloat(entry.value.toFixed(2));
          
          // Validate weight data before adding
          const validation = validateHealthData(null, weight);
          if (validation.isValid) {
            if (!weightByDate[date] || timestamp > weightByDate[date].timestamp) {
              weightByDate[date] = {
                value: weight,
                timestamp: timestamp
              };
            }
          } else {
            console.warn(`Invalid weight data for ${date}: ${weight}`, validation.errors);
          }
        });

        // Add weight data to transformed data
        Object.keys(weightByDate).forEach(date => {
          if (!transformedData[date]) {
            transformedData[date] = { date, steps: null, weight: null };
          }
          transformedData[date].weight = weightByDate[date].value;
        });
      }

      // Convert to array
      const healthDataArray = Object.values(transformedData);

      if (healthDataArray.length === 0) {
        setError('No health data found. Make sure you have steps or weight data in Apple Health.');
        return false;
      }

      // Save to Supabase with network error handling
      try {
        await saveHealthDataToSupabase(healthDataArray);
      } catch (saveError) {
        // Data was retrieved but couldn't be saved
        throw new Error('Health data retrieved but could not be saved. Please check your internet connection and try again.');
      }

      // Update local state
      await fetchHealthData();
      setLastSyncTime(new Date().toISOString());

      return true;
    } catch (err) {
      console.error('Error syncing from Apple Health:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to sync health data. ';
      
      if (err.message.includes('network') || err.message.includes('internet')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message.includes('permission')) {
        errorMessage += 'Please check your Apple Health permissions in Settings.';
      } else if (err.message.includes('saved')) {
        errorMessage = err.message;
      } else {
        errorMessage += err.message || 'Please try again later.';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isIOS, hasPermissions, requestPermissions, lastSyncTime]);

  // Save health data to Supabase with upsert logic
  const saveHealthDataToSupabase = async (dataArray) => {
    if (!dataArray || dataArray.length === 0) return;

    try {
      // Prepare data for upsert
      const recordsToUpsert = dataArray.map(entry => ({
        user_id: userId,
        date: entry.date,
        steps: entry.steps,
        weight: entry.weight,
        updated_at: new Date().toISOString()
      }));

      // Upsert data (insert or update on conflict)
      const { error: upsertError } = await supabase
        .from('health_data')
        .upsert(recordsToUpsert, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });

      if (upsertError) {
        // Check for specific Supabase errors
        if (upsertError.code === 'PGRST116') {
          throw new Error('Database table not found. Please contact support.');
        } else if (upsertError.code === '23505') {
          throw new Error('Duplicate data detected. Please try syncing again.');
        } else if (upsertError.message.includes('JWT')) {
          throw new Error('Authentication error. Please restart the app and try again.');
        } else if (upsertError.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(`Database error: ${upsertError.message}`);
        }
      }
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      
      // Store failed data for retry
      const failedData = {
        data: dataArray,
        timestamp: new Date().toISOString(),
        error: err.message
      };
      localStorage.setItem('health-data-retry', JSON.stringify(failedData));
      
      // Re-throw with user-friendly message
      if (err.message.includes('Network') || err.message.includes('network')) {
        throw new Error('Could not save data due to network issues. Data will be retried automatically.');
      } else {
        throw err;
      }
    }
  };

  // Retry failed saves
  const retryFailedSaves = useCallback(async () => {
    const failedDataStr = localStorage.getItem('health-data-retry');
    if (!failedDataStr) return;

    try {
      const failedData = JSON.parse(failedDataStr);
      await saveHealthDataToSupabase(failedData.data);
      localStorage.removeItem('health-data-retry');
    } catch (err) {
      console.error('Retry failed:', err);
    }
  }, [userId]);

  // Fetch health data from Supabase
  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range (last 12 weeks only for performance)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDateStr) // Only fetch last 12 weeks
        .order('date', { ascending: false });

      if (fetchError) {
        // Handle specific Supabase errors
        if (fetchError.code === 'PGRST116') {
          throw new Error('Database table not found. Please contact support.');
        } else if (fetchError.message.includes('JWT')) {
          throw new Error('Authentication error. Please restart the app.');
        } else if (fetchError.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(`Failed to load health data: ${fetchError.message}`);
        }
      }

      setHealthData(data || []);
      
      // Try to retry any failed saves
      await retryFailedSaves();
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError(err.message || 'Failed to load health data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, retryFailedSaves]);

  // Load data on initialization
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Validate health data values
  const validateHealthData = (steps, weight) => {
    const errors = [];

    // Validate steps if provided
    if (steps !== null && steps !== undefined) {
      const stepsNum = typeof steps === 'string' ? parseInt(steps, 10) : steps;
      
      if (isNaN(stepsNum)) {
        errors.push('Steps must be a valid number');
      } else if (stepsNum < 0) {
        errors.push('Steps cannot be negative');
      } else if (stepsNum > 200000) {
        errors.push('Steps value seems unreasonably high (max: 200,000)');
      }
    }

    // Validate weight if provided
    if (weight !== null && weight !== undefined) {
      const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
      
      if (isNaN(weightNum)) {
        errors.push('Weight must be a valid number');
      } else if (weightNum < 50) {
        errors.push('Weight value seems unreasonably low (min: 50 lbs)');
      } else if (weightNum > 1000) {
        errors.push('Weight value seems unreasonably high (max: 1000 lbs)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Add manual entry for non-iOS platforms
  const addManualEntry = useCallback(async (date, steps, weight) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input data
      if (!date) {
        throw new Error('Date is required');
      }

      // Validate date is not in the future
      const entryDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (entryDate > today) {
        throw new Error('Cannot add data for future dates');
      }

      // Validate date is not too old (more than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (entryDate < oneYearAgo) {
        throw new Error('Cannot add data older than 1 year');
      }

      // At least one value must be provided
      if ((steps === null || steps === undefined || steps === '') && 
          (weight === null || weight === undefined || weight === '')) {
        throw new Error('At least one of steps or weight must be provided');
      }

      // Validate the data values
      const validation = validateHealthData(steps, weight);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }

      // Prepare data for save
      const entry = {
        date: date,
        steps: (steps !== null && steps !== undefined && steps !== '') ? parseInt(steps, 10) : null,
        weight: (weight !== null && weight !== undefined && weight !== '') ? parseFloat(parseFloat(weight).toFixed(2)) : null
      };

      // Save to Supabase
      await saveHealthDataToSupabase([entry]);

      // Refresh data
      await fetchHealthData();

      return true;
    } catch (err) {
      console.error('Error adding manual entry:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchHealthData]);

  // Get weekly steps totals
  const getWeeklySteps = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const weekData = healthData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    const totalSteps = weekData.reduce((sum, entry) => {
      return sum + (entry.steps || 0);
    }, 0);

    const goalMet = totalSteps >= 60000;
    const percentageOfGoal = (totalSteps / 60000) * 100;

    return {
      totalSteps,
      goalMet,
      percentageOfGoal: Math.round(percentageOfGoal),
      dailySteps: weekData.map(entry => ({
        date: entry.date,
        steps: entry.steps || 0
      }))
    };
  }, [healthData]);

  // Get weight progress history
  const getWeightProgress = useCallback(() => {
    const weightEntries = healthData
      .filter(entry => entry.weight !== null && entry.weight !== undefined)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (weightEntries.length === 0) {
      return {
        entries: [],
        currentWeight: null,
        startWeight: null,
        totalChange: 0,
        trend: 'stable'
      };
    }

    const startWeight = weightEntries[0].weight;
    const currentWeight = weightEntries[weightEntries.length - 1].weight;
    const totalChange = parseFloat((currentWeight - startWeight).toFixed(2));

    let trend = 'stable';
    if (totalChange > 0.5) trend = 'increasing';
    else if (totalChange < -0.5) trend = 'decreasing';

    return {
      entries: weightEntries.map(entry => ({
        date: entry.date,
        weight: entry.weight
      })),
      currentWeight,
      startWeight,
      totalChange,
      trend
    };
  }, [healthData]);

  // Get weekly average weight
  const getWeeklyAverageWeight = useCallback((startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const weekData = healthData.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end && entry.weight !== null && entry.weight !== undefined;
    });

    if (weekData.length === 0) {
      return null;
    }

    const totalWeight = weekData.reduce((sum, entry) => sum + entry.weight, 0);
    const average = totalWeight / weekData.length;

    return {
      average: parseFloat(average.toFixed(1)),
      entryCount: weekData.length
    };
  }, [healthData]);

  // Get weekly health metrics (combined weight and steps)
  const getWeeklyHealthMetrics = useCallback((startDate, endDate, previousWeekStartDate = null, previousWeekEndDate = null) => {
    const stepsData = getWeeklySteps(startDate, endDate);
    const weightData = getWeeklyAverageWeight(startDate, endDate);

    let weightChange = null;
    if (weightData && previousWeekStartDate && previousWeekEndDate) {
      const previousWeightData = getWeeklyAverageWeight(previousWeekStartDate, previousWeekEndDate);
      if (previousWeightData) {
        weightChange = parseFloat((weightData.average - previousWeightData.average).toFixed(1));
      }
    }

    return {
      weight: weightData ? {
        average: weightData.average,
        change: weightChange,
        entryCount: weightData.entryCount
      } : null,
      steps: {
        total: stepsData.totalSteps,
        goalMet: stepsData.goalMet,
        percentageOfGoal: stepsData.percentageOfGoal
      }
    };
  }, [getWeeklySteps, getWeeklyAverageWeight]);

  return {
    healthData,
    loading,
    error,
    hasPermissions,
    isIOS,
    lastSyncTime,
    requestPermissions,
    syncFromAppleHealth,
    addManualEntry,
    getWeeklySteps,
    getWeightProgress,
    getWeeklyAverageWeight,
    getWeeklyHealthMetrics,
  };
};
