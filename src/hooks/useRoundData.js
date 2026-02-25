import { useMemo, useCallback } from 'react';
import { useRoundManager } from './useRoundManager';
import {
  getRoundWeekBoundaries,
  getRoundDateRange,
  getWeekNumberFromDate,
  isDateInRound,
  getAllRoundWeeks
} from '../utils/roundDateUtils';
import {
  validateRoundContext,
  handleMissingRoundContext,
  consistencyLogger
} from '../utils/dataConsistencyValidator';
import {
  archiveRoundData,
  handleRoundStartDateChange,
  validateRoundDataIsolation
} from '../utils/roundTransitionHandler';

/**
 * Central hook for round-aware data access
 * Combines round manager with date utilities to provide a unified interface
 * for all round-related operations and date calculations
 * 
 * @example
 * const {
 *   currentRound,
 *   currentWeek,
 *   roundStartDate,
 *   isActive,
 *   loading,
 *   getCurrentWeekBoundaries,
 *   getWeekBoundaries,
 *   startRound,
 *   endRound
 * } = useRoundData();
 * 
 * // Get current week boundaries
 * const boundaries = getCurrentWeekBoundaries();
 * 
 * // Get specific week boundaries
 * const week5 = getWeekBoundaries(5);
 * 
 * // Check if date is in current round
 * const isInRound = isDateInCurrentRound('2024-01-15');
 * 
 * @returns {Object} Round context and utility methods
 */
export function useRoundData() {
  const roundManager = useRoundManager();
  const { roundData, loading } = roundManager;

  // Memoize round context to prevent unnecessary recalculations
  const roundContext = useMemo(() => {
    if (!roundData || !roundData.startDate) {
      consistencyLogger.warn('No active round data available');
      return {
        currentRound: null,
        currentWeek: null,
        roundStartDate: null,
        roundEndDate: null,
        isActive: false,
        loading,
        isValid: false,
        validationErrors: ['No active round']
      };
    }

    const currentWeek = roundManager.getCurrentWeekInRound();
    const { endDate } = getRoundDateRange(roundData.startDate);

    const context = {
      currentRound: roundData.round,
      currentWeek,
      roundStartDate: roundData.startDate,
      roundEndDate: roundData.endDate || endDate.toISOString(),
      isActive: roundData.isActive,
      loading
    };

    // Validate the round context
    const validation = validateRoundContext(context);
    
    if (!validation.isValid) {
      consistencyLogger.error('Invalid round context', {
        context,
        errors: validation.errors
      });
    }

    if (validation.warnings.length > 0) {
      consistencyLogger.warn('Round context warnings', {
        warnings: validation.warnings
      });
    }

    return {
      ...context,
      isValid: validation.isValid,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings
    };
  }, [roundData, loading, roundManager]);

  // Memoize date utility methods bound to current round
  const dateUtilities = useMemo(() => {
    const { roundStartDate, roundEndDate } = roundContext;

    return {
      /**
       * Get date boundaries for the current week
       * @returns {{ startDate: Date, endDate: Date }|null}
       */
      getCurrentWeekBoundaries: () => {
        if (!roundStartDate || !roundContext.currentWeek) return null;
        return getRoundWeekBoundaries(roundStartDate, roundContext.currentWeek);
      },

      /**
       * Get date boundaries for a specific week in the current round
       * @param {number} weekNumber - Week number (1-12)
       * @returns {{ startDate: Date, endDate: Date }|null}
       */
      getWeekBoundaries: (weekNumber) => {
        if (!roundStartDate) return null;
        try {
          return getRoundWeekBoundaries(roundStartDate, weekNumber);
        } catch (error) {
          console.error('Error getting week boundaries:', error);
          return null;
        }
      },

      /**
       * Get date boundaries for the entire current round
       * @returns {{ startDate: Date, endDate: Date }|null}
       */
      getRoundBoundaries: () => {
        if (!roundStartDate) return null;
        return getRoundDateRange(roundStartDate);
      },

      /**
       * Check if a date falls within the current round
       * @param {string|Date} date - Date to check
       * @returns {boolean}
       */
      isDateInCurrentRound: (date) => {
        if (!roundStartDate) return false;
        return isDateInRound(date, roundStartDate, roundEndDate);
      },

      /**
       * Get the week number for a specific date within the current round
       * @param {string|Date} date - Date to check
       * @returns {number|null} Week number (1-12) or null if outside round
       */
      getWeekNumberForDate: (date) => {
        if (!roundStartDate) return null;
        return getWeekNumberFromDate(roundStartDate, date);
      },

      /**
       * Get all 12 week boundaries for the current round
       * @returns {Array<{ week: number, startDate: Date, endDate: Date }>|null}
       */
      getAllWeeks: () => {
        if (!roundStartDate) return null;
        return getAllRoundWeeks(roundStartDate);
      }
    };
  }, [roundContext]);

  // Memoize round management methods
  const roundManagement = useMemo(() => ({
    /**
     * Start a new round
     * @param {number} roundNumber - Round number to start
     */
    startRound: (roundNumber) => {
      consistencyLogger.info('Starting new round', { roundNumber, previousRound: roundContext.currentRound });
      roundManager.startRound(roundNumber);
    },

    /**
     * End the current round and archive data
     */
    endRound: () => {
      consistencyLogger.info('Ending round', { round: roundContext.currentRound });
      roundManager.endRound();
    },

    /**
     * Update the start date of the current round
     * @param {string} newDate - New start date (ISO string)
     */
    updateRoundStartDate: (newDate) => {
      const oldDate = roundContext.roundStartDate;
      consistencyLogger.info('Updating round start date', { 
        round: roundContext.currentRound,
        oldDate, 
        newDate 
      });
      roundManager.updateRoundStartDate(newDate);
    },

    /**
     * Restart the current round
     */
    restartCurrentRound: () => {
      consistencyLogger.info('Restarting round', { round: roundContext.currentRound });
      roundManager.restartCurrentRound();
    },

    /**
     * Check if the current round is complete
     * @returns {boolean}
     */
    isRoundComplete: () => {
      return roundManager.isRoundComplete();
    },

    /**
     * Check if there is an active round
     * @returns {boolean}
     */
    hasActiveRound: () => {
      return roundManager.hasActiveRound();
    },

    /**
     * Check if the current round can be restarted
     * @returns {boolean}
     */
    canRestart: () => {
      return roundManager.canRestart();
    },

    /**
     * Handle missing round context for a component
     * @param {string} componentName - Name of the component
     * @param {string} dataType - Type of data needed
     * @returns {Object} Fallback data and error information
     */
    handleMissingContext: (componentName, dataType) => {
      return handleMissingRoundContext(componentName, dataType);
    },

    /**
     * Archive current round data
     * @param {Array} workouts - Workouts to archive
     * @param {Array} healthData - Health data to archive
     * @returns {Object} Archive result
     */
    archiveCurrentRound: (workouts, healthData) => {
      if (!roundData) {
        consistencyLogger.error('Cannot archive - no round data');
        return { success: false, error: 'No round data' };
      }
      return archiveRoundData(roundData, workouts, healthData);
    },

    /**
     * Validate round data isolation between rounds
     * @param {Object} historicalRound - Previous round
     * @param {Object} newRound - New round
     * @param {Array} workouts - All workouts
     * @param {Array} healthData - All health data
     * @returns {Object} Validation result
     */
    validateDataIsolation: (historicalRound, newRound, workouts, healthData) => {
      return validateRoundDataIsolation(historicalRound, newRound, workouts, healthData);
    },

    /**
     * Handle round start date change with recalculation
     * @param {string} newDate - New start date
     * @param {Array} workouts - All workouts
     * @param {Array} healthData - All health data
     * @returns {Object} Recalculation result
     */
    handleStartDateChange: (newDate, workouts, healthData) => {
      const oldDate = roundContext.roundStartDate;
      if (!oldDate) {
        consistencyLogger.error('Cannot handle start date change - no current start date');
        return { success: false, error: 'No current start date' };
      }
      return handleRoundStartDateChange(oldDate, newDate, workouts, healthData);
    }
  }), [roundManager, roundContext, roundData]);

  // Return unified interface
  return {
    // Round context
    ...roundContext,

    // Date utilities
    ...dateUtilities,

    // Round management
    ...roundManagement
  };
}

