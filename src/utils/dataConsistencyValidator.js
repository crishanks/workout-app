/**
 * Data Consistency Validator
 * 
 * Provides utilities to validate data consistency across components,
 * handle missing round context, and provide fallback behaviors.
 */

import { isDateInRound, getWeekNumberFromDate } from './roundDateUtils';

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 * @property {Object} metadata - Additional metadata about the validation
 */

/**
 * Logger for data consistency issues
 */
class DataConsistencyLogger {
  constructor() {
    this.logs = [];
    this.enabled = true;
  }

  log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    
    this.logs.push(entry);
    
    if (this.enabled) {
      const logMethod = level === 'error' ? console.error : 
                       level === 'warn' ? console.warn : 
                       console.log;
      logMethod(`[DataConsistency ${level.toUpperCase()}]`, message, data);
    }
  }

  error(message, data) {
    this.log('error', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  getLogs(level = null) {
    return level ? this.logs.filter(log => log.level === level) : this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const consistencyLogger = new DataConsistencyLogger();

/**
 * Validate that health data falls within round boundaries
 * @param {Array<Object>} healthData - Array of health data entries
 * @param {string} roundStartDate - Round start date
 * @param {string} roundEndDate - Round end date (optional)
 * @returns {ValidationResult}
 */
export function validateHealthDataInRound(healthData, roundStartDate, roundEndDate = null) {
  const errors = [];
  const warnings = [];
  const outsideRound = [];

  if (!roundStartDate) {
    errors.push('Missing round start date for health data validation');
    return {
      isValid: false,
      errors,
      warnings,
      metadata: { totalEntries: healthData?.length || 0 }
    };
  }

  if (!healthData || healthData.length === 0) {
    return {
      isValid: true,
      errors: [],
      warnings: ['No health data to validate'],
      metadata: { totalEntries: 0 }
    };
  }

  healthData.forEach((entry, index) => {
    if (!entry.date) {
      errors.push(`Health data entry at index ${index} missing date field`);
      return;
    }

    const inRound = isDateInRound(entry.date, roundStartDate, roundEndDate);
    
    if (!inRound) {
      outsideRound.push({
        index,
        date: entry.date,
        steps: entry.steps,
        weight: entry.weight
      });
      warnings.push(`Health data entry on ${entry.date} falls outside round boundaries`);
    }
  });

  if (outsideRound.length > 0) {
    consistencyLogger.warn(
      `Found ${outsideRound.length} health data entries outside round boundaries`,
      { roundStartDate, roundEndDate, outsideRound }
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      totalEntries: healthData.length,
      entriesOutsideRound: outsideRound.length,
      outsideRoundData: outsideRound
    }
  };
}

/**
 * Validate that workout data falls within round boundaries
 * @param {Array<Object>} workouts - Array of workout sessions
 * @param {string} roundStartDate - Round start date
 * @param {string} roundEndDate - Round end date (optional)
 * @returns {ValidationResult}
 */
export function validateWorkoutsInRound(workouts, roundStartDate, roundEndDate = null) {
  const errors = [];
  const warnings = [];
  const misaligned = [];

  if (!roundStartDate) {
    errors.push('Missing round start date for workout validation');
    return {
      isValid: false,
      errors,
      warnings,
      metadata: { totalWorkouts: workouts?.length || 0 }
    };
  }

  if (!workouts || workouts.length === 0) {
    return {
      isValid: true,
      errors: [],
      warnings: ['No workouts to validate'],
      metadata: { totalWorkouts: 0 }
    };
  }

  workouts.forEach((workout, index) => {
    if (!workout.date) {
      errors.push(`Workout at index ${index} missing date field`);
      return;
    }

    const inRound = isDateInRound(workout.date, roundStartDate, roundEndDate);
    
    if (!inRound) {
      misaligned.push({
        index,
        date: workout.date,
        round: workout.round,
        week: workout.week,
        day: workout.day
      });
      warnings.push(`Workout on ${workout.date} falls outside round boundaries`);
    }

    // Validate week number matches date
    if (workout.week) {
      const calculatedWeek = getWeekNumberFromDate(roundStartDate, workout.date);
      if (calculatedWeek && calculatedWeek !== workout.week) {
        warnings.push(
          `Workout on ${workout.date} has week ${workout.week} but should be week ${calculatedWeek}`
        );
        misaligned.push({
          index,
          date: workout.date,
          storedWeek: workout.week,
          calculatedWeek
        });
      }
    }
  });

  if (misaligned.length > 0) {
    consistencyLogger.warn(
      `Found ${misaligned.length} workouts with date/round misalignment`,
      { roundStartDate, roundEndDate, misaligned }
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      totalWorkouts: workouts.length,
      misalignedWorkouts: misaligned.length,
      misalignedData: misaligned
    }
  };
}

/**
 * Validate round context is available and complete
 * @param {Object} roundContext - Round context object
 * @returns {ValidationResult}
 */
export function validateRoundContext(roundContext) {
  const errors = [];
  const warnings = [];

  if (!roundContext) {
    errors.push('Round context is null or undefined');
    return {
      isValid: false,
      errors,
      warnings,
      metadata: {}
    };
  }

  const requiredFields = ['currentRound', 'currentWeek', 'roundStartDate'];
  const missingFields = requiredFields.filter(field => !roundContext[field]);

  if (missingFields.length > 0) {
    errors.push(`Round context missing required fields: ${missingFields.join(', ')}`);
  }

  if (roundContext.currentWeek && (roundContext.currentWeek < 1 || roundContext.currentWeek > 12)) {
    warnings.push(`Current week ${roundContext.currentWeek} is outside valid range (1-12)`);
  }

  if (roundContext.currentRound && roundContext.currentRound < 1) {
    warnings.push(`Current round ${roundContext.currentRound} is less than 1`);
  }

  if (!roundContext.isActive) {
    warnings.push('Round is not active');
  }

  if (errors.length > 0) {
    consistencyLogger.error('Invalid round context', { roundContext, errors });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      hasContext: !!roundContext,
      missingFields
    }
  };
}

/**
 * Get user-friendly error message for validation errors
 * @param {ValidationResult} validationResult - Result from validation function
 * @param {string} context - Context description (e.g., "health data", "workouts")
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(validationResult, context = 'data') {
  if (validationResult.isValid && validationResult.warnings.length === 0) {
    return null;
  }

  if (validationResult.errors.length > 0) {
    const primaryError = validationResult.errors[0];
    
    if (primaryError.includes('Missing round start date')) {
      return `Unable to load ${context}. Please start a training round to continue.`;
    }
    
    if (primaryError.includes('missing date field')) {
      return `Some ${context} entries are incomplete. Please check your data.`;
    }
    
    if (primaryError.includes('Round context')) {
      return 'Unable to load training round information. Please try refreshing the page.';
    }
    
    return `There was an issue loading your ${context}. Please try again.`;
  }

  if (validationResult.warnings.length > 0) {
    const outsideCount = validationResult.metadata?.entriesOutsideRound || 
                        validationResult.metadata?.misalignedWorkouts || 0;
    
    if (outsideCount > 0) {
      return `${outsideCount} ${context} ${outsideCount === 1 ? 'entry' : 'entries'} found outside current round. These will be shown separately.`;
    }
  }

  return null;
}

/**
 * Create fallback data for missing round context
 * @param {string} dataType - Type of data ('health', 'workout', 'stats')
 * @returns {Object} Fallback data structure
 */
export function createFallbackData(dataType) {
  const fallbacks = {
    health: {
      weeklySteps: [],
      weightData: [],
      currentWeekSteps: { total: 0, daily: [] },
      message: 'Start a training round to track your health progress'
    },
    workout: {
      sessions: [],
      totalWorkouts: 0,
      message: 'Start a training round to begin tracking workouts'
    },
    stats: {
      consistency: 0,
      totalWorkouts: 0,
      stepGoalsMet: 0,
      message: 'Complete workouts to see your statistics'
    },
    round: {
      currentRound: 0,
      currentWeek: 0,
      roundStartDate: null,
      isActive: false,
      message: 'No active training round'
    }
  };

  const fallback = fallbacks[dataType] || { message: 'No data available' };
  
  consistencyLogger.info(`Using fallback data for ${dataType}`, { fallback });
  
  return fallback;
}

/**
 * Filter data to only include entries within round boundaries
 * @param {Array<Object>} data - Array of data entries with date field
 * @param {string} roundStartDate - Round start date
 * @param {string} roundEndDate - Round end date (optional)
 * @returns {Object} Filtered data and excluded entries
 */
export function filterDataByRound(data, roundStartDate, roundEndDate = null) {
  if (!data || data.length === 0) {
    return { filtered: [], excluded: [] };
  }

  if (!roundStartDate) {
    consistencyLogger.warn('Cannot filter data without round start date', { dataCount: data.length });
    return { filtered: [], excluded: data };
  }

  const filtered = [];
  const excluded = [];

  data.forEach(entry => {
    if (!entry.date) {
      excluded.push({ ...entry, reason: 'Missing date field' });
      return;
    }

    if (isDateInRound(entry.date, roundStartDate, roundEndDate)) {
      filtered.push(entry);
    } else {
      excluded.push({ ...entry, reason: 'Outside round boundaries' });
    }
  });

  if (excluded.length > 0) {
    consistencyLogger.info(
      `Filtered ${excluded.length} entries outside round boundaries`,
      { roundStartDate, roundEndDate, excludedCount: excluded.length }
    );
  }

  return { filtered, excluded };
}

/**
 * Validate data consistency across multiple sources
 * @param {Object} options - Validation options
 * @param {Object} options.roundContext - Round context
 * @param {Array} options.healthData - Health data array
 * @param {Array} options.workouts - Workouts array
 * @returns {Object} Comprehensive validation result
 */
export function validateDataConsistency({ roundContext, healthData, workouts }) {
  const results = {
    overall: { isValid: true, errors: [], warnings: [] },
    roundContext: null,
    healthData: null,
    workouts: null
  };

  // Validate round context first
  results.roundContext = validateRoundContext(roundContext);
  if (!results.roundContext.isValid) {
    results.overall.isValid = false;
    results.overall.errors.push(...results.roundContext.errors);
    return results;
  }

  // Validate health data if provided
  if (healthData) {
    results.healthData = validateHealthDataInRound(
      healthData,
      roundContext.roundStartDate,
      roundContext.roundEndDate
    );
    if (!results.healthData.isValid) {
      results.overall.isValid = false;
      results.overall.errors.push(...results.healthData.errors);
    }
    results.overall.warnings.push(...results.healthData.warnings);
  }

  // Validate workouts if provided
  if (workouts) {
    results.workouts = validateWorkoutsInRound(
      workouts,
      roundContext.roundStartDate,
      roundContext.roundEndDate
    );
    if (!results.workouts.isValid) {
      results.overall.isValid = false;
      results.overall.errors.push(...results.workouts.errors);
    }
    results.overall.warnings.push(...results.workouts.warnings);
  }

  return results;
}

/**
 * Handle missing round context with appropriate fallback
 * @param {string} componentName - Name of component requesting data
 * @param {string} dataType - Type of data needed
 * @returns {Object} Fallback data and error message
 */
export function handleMissingRoundContext(componentName, dataType) {
  const message = `${componentName} cannot load ${dataType} without an active round`;
  
  consistencyLogger.error(message, { componentName, dataType });
  
  return {
    data: createFallbackData(dataType),
    error: getUserFriendlyErrorMessage(
      { isValid: false, errors: ['Missing round context'], warnings: [], metadata: {} },
      dataType
    ),
    shouldShowPrompt: true
  };
}

export default {
  validateHealthDataInRound,
  validateWorkoutsInRound,
  validateRoundContext,
  validateDataConsistency,
  getUserFriendlyErrorMessage,
  createFallbackData,
  filterDataByRound,
  handleMissingRoundContext,
  consistencyLogger
};
