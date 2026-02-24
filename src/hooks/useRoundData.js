import { useMemo } from 'react';
import { useRoundManager } from './useRoundManager';
import {
  getRoundWeekBoundaries,
  getRoundDateRange,
  getWeekNumberFromDate,
  isDateInRound,
  getAllRoundWeeks
} from '../utils/roundDateUtils';

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
      return {
        currentRound: null,
        currentWeek: null,
        roundStartDate: null,
        roundEndDate: null,
        isActive: false,
        loading
      };
    }

    const currentWeek = roundManager.getCurrentWeekInRound();
    const { endDate } = getRoundDateRange(roundData.startDate);

    return {
      currentRound: roundData.round,
      currentWeek,
      roundStartDate: roundData.startDate,
      roundEndDate: roundData.endDate || endDate.toISOString(),
      isActive: roundData.isActive,
      loading
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
      roundManager.startRound(roundNumber);
    },

    /**
     * End the current round
     */
    endRound: () => {
      roundManager.endRound();
    },

    /**
     * Update the start date of the current round
     * @param {string} newDate - New start date (ISO string)
     */
    updateRoundStartDate: (newDate) => {
      roundManager.updateRoundStartDate(newDate);
    },

    /**
     * Restart the current round
     */
    restartCurrentRound: () => {
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
    }
  }), [roundManager]);

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

