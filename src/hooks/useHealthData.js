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

    try {
      setLoading(true);
      setError(null);

      // Calculate date range (last 12 weeks)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (12 * 7)); // 12 weeks ago

      // Query steps data
      const stepsData = await Health.queryAggregated({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataType: 'steps',
        interval: 'day'
      });

      // Query weight data
      const weightData = await Health.query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataType: 'weight'
      });

      // Transform data to match database schema
      const transformedData = {};

      // Process steps data (aggregated by day)
      if (stepsData && stepsData.length > 0) {
        stepsData.forEach(entry => {
          const date = new Date(entry.startDate).toISOString().split('T')[0];
          if (!transformedData[date]) {
            transformedData[date] = { date, steps: null, weight: null };
          }
          transformedData[date].steps = Math.round(entry.value);
        });
      }

      // Process weight data (may have multiple entries per day, we'll take the latest)
      if (weightData && weightData.length > 0) {
        const weightByDate = {};
        weightData.forEach(entry => {
          const date = new Date(entry.startDate).toISOString().split('T')[0];
          const timestamp = new Date(entry.startDate).getTime();
          
          if (!weightByDate[date] || timestamp > weightByDate[date].timestamp) {
            weightByDate[date] = {
              value: entry.value,
              timestamp: timestamp
            };
          }
        });

        // Add weight data to transformed data
        Object.keys(weightByDate).forEach(date => {
          if (!transformedData[date]) {
            transformedData[date] = { date, steps: null, weight: null };
          }
          transformedData[date].weight = parseFloat(weightByDate[date].value.toFixed(2));
        });
      }

      // Convert to array
      const healthDataArray = Object.values(transformedData);

      // Save to Supabase
      await saveHealthDataToSupabase(healthDataArray);

      // Update local state
      setHealthData(healthDataArray);
      setLastSyncTime(new Date().toISOString());

      return true;
    } catch (err) {
      console.error('Error syncing from Apple Health:', err);
      setError('Failed to sync from Apple Health: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isIOS, hasPermissions, requestPermissions]);

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
        throw upsertError;
      }
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      // Retry logic: store failed data for retry
      const failedData = {
        data: dataArray,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('health-data-retry', JSON.stringify(failedData));
      throw new Error('Failed to save health data: ' + err.message);
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

      const { data, error: fetchError } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setHealthData(data || []);
      
      // Try to retry any failed saves
      await retryFailedSaves();
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, retryFailedSaves]);

  // Load data on initialization
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Add manual entry for non-iOS platforms
  const addManualEntry = useCallback(async (date, steps, weight) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input data
      if (!date) {
        throw new Error('Date is required');
      }

      // Validate steps (if provided)
      if (steps !== null && steps !== undefined) {
        const stepsNum = parseInt(steps, 10);
        if (isNaN(stepsNum) || stepsNum < 0 || stepsNum > 200000) {
          throw new Error('Steps must be a valid number between 0 and 200,000');
        }
      }

      // Validate weight (if provided)
      if (weight !== null && weight !== undefined) {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum < 50 || weightNum > 1000) {
          throw new Error('Weight must be a valid number between 50 and 1000 lbs');
        }
      }

      // At least one value must be provided
      if ((steps === null || steps === undefined) && (weight === null || weight === undefined)) {
        throw new Error('At least one of steps or weight must be provided');
      }

      // Prepare data for save
      const entry = {
        date: date,
        steps: steps !== null && steps !== undefined ? parseInt(steps, 10) : null,
        weight: weight !== null && weight !== undefined ? parseFloat(parseFloat(weight).toFixed(2)) : null
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
