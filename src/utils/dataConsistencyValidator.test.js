import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateHealthDataInRound,
  validateWorkoutsInRound,
  validateRoundContext,
  validateDataConsistency,
  getUserFriendlyErrorMessage,
  createFallbackData,
  filterDataByRound,
  handleMissingRoundContext,
  consistencyLogger
} from './dataConsistencyValidator';

describe('dataConsistencyValidator', () => {
  beforeEach(() => {
    consistencyLogger.clearLogs();
    consistencyLogger.enabled = false; // Disable console output during tests
  });

  describe('validateHealthDataInRound', () => {
    const roundStartDate = '2024-01-01';
    const roundEndDate = '2024-03-24'; // 12 weeks later

    it('should validate health data within round boundaries', () => {
      const healthData = [
        { date: '2024-01-05', steps: 10000, weight: 180 },
        { date: '2024-02-15', steps: 12000, weight: 178 },
        { date: '2024-03-20', steps: 11000, weight: 176 }
      ];

      const result = validateHealthDataInRound(healthData, roundStartDate, roundEndDate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.totalEntries).toBe(3);
      expect(result.metadata.entriesOutsideRound).toBe(0);
    });

    it('should detect health data outside round boundaries', () => {
      const healthData = [
        { date: '2023-12-25', steps: 10000, weight: 180 }, // Before round
        { date: '2024-01-15', steps: 12000, weight: 178 }, // In round
        { date: '2024-04-01', steps: 11000, weight: 176 }  // After round
      ];

      const result = validateHealthDataInRound(healthData, roundStartDate, roundEndDate);

      expect(result.isValid).toBe(true); // Still valid, just warnings
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.metadata.entriesOutsideRound).toBe(2);
    });

    it('should return error when round start date is missing', () => {
      const healthData = [{ date: '2024-01-05', steps: 10000 }];

      const result = validateHealthDataInRound(healthData, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing round start date for health data validation');
    });

    it('should detect missing date fields', () => {
      const healthData = [
        { steps: 10000, weight: 180 }, // Missing date
        { date: '2024-01-15', steps: 12000 }
      ];

      const result = validateHealthDataInRound(healthData, roundStartDate);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty health data', () => {
      const result = validateHealthDataInRound([], roundStartDate);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No health data to validate');
      expect(result.metadata.totalEntries).toBe(0);
    });
  });

  describe('validateWorkoutsInRound', () => {
    const roundStartDate = '2024-01-01';
    const roundEndDate = '2024-03-24';

    it('should validate workouts within round boundaries', () => {
      const workouts = [
        { date: '2024-01-02', round: 1, week: 1, day: 'A' },
        { date: '2024-01-15', round: 1, week: 3, day: 'B' },
        { date: '2024-02-20', round: 1, week: 8, day: 'C' }
      ];

      const result = validateWorkoutsInRound(workouts, roundStartDate, roundEndDate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.totalWorkouts).toBe(3);
    });

    it('should detect workouts outside round boundaries', () => {
      const workouts = [
        { date: '2023-12-25', round: 1, week: 1, day: 'A' }, // Before round
        { date: '2024-01-15', round: 1, week: 3, day: 'B' }, // In round
        { date: '2024-04-01', round: 1, week: 12, day: 'C' } // After round
      ];

      const result = validateWorkoutsInRound(workouts, roundStartDate, roundEndDate);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.metadata.misalignedWorkouts).toBeGreaterThan(0);
    });

    it('should detect week number mismatches', () => {
      const workouts = [
        { date: '2024-01-02', round: 1, week: 5, day: 'A' } // Should be week 1
      ];

      const result = validateWorkoutsInRound(workouts, roundStartDate);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.metadata.misalignedWorkouts).toBeGreaterThan(0);
    });

    it('should return error when round start date is missing', () => {
      const workouts = [{ date: '2024-01-02', round: 1, week: 1 }];

      const result = validateWorkoutsInRound(workouts, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing round start date for workout validation');
    });

    it('should handle empty workouts array', () => {
      const result = validateWorkoutsInRound([], roundStartDate);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('No workouts to validate');
    });
  });

  describe('validateRoundContext', () => {
    it('should validate complete round context', () => {
      const roundContext = {
        currentRound: 2,
        currentWeek: 5,
        roundStartDate: '2024-01-01',
        isActive: true
      };

      const result = validateRoundContext(roundContext);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect null round context', () => {
      const result = validateRoundContext(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Round context is null or undefined');
    });

    it('should detect missing required fields', () => {
      const roundContext = {
        currentRound: 2
        // Missing currentWeek and roundStartDate
      };

      const result = validateRoundContext(roundContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.metadata.missingFields).toContain('currentWeek');
      expect(result.metadata.missingFields).toContain('roundStartDate');
    });

    it('should warn about invalid week numbers', () => {
      const roundContext = {
        currentRound: 2,
        currentWeek: 15, // Invalid, should be 1-12
        roundStartDate: '2024-01-01',
        isActive: true
      };

      const result = validateRoundContext(roundContext);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn about inactive rounds', () => {
      const roundContext = {
        currentRound: 2,
        currentWeek: 5,
        roundStartDate: '2024-01-01',
        isActive: false
      };

      const result = validateRoundContext(roundContext);

      expect(result.warnings).toContain('Round is not active');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return null for valid results with no warnings', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
        metadata: {}
      };

      const message = getUserFriendlyErrorMessage(result, 'health data');

      expect(message).toBeNull();
    });

    it('should return friendly message for missing round start date', () => {
      const result = {
        isValid: false,
        errors: ['Missing round start date for health data validation'],
        warnings: [],
        metadata: {}
      };

      const message = getUserFriendlyErrorMessage(result, 'health data');

      expect(message).toContain('start a training round');
    });

    it('should return friendly message for data outside round', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: ['Some entries outside round'],
        metadata: { entriesOutsideRound: 5 }
      };

      const message = getUserFriendlyErrorMessage(result, 'health data');

      expect(message).toContain('5');
      expect(message).toContain('entries');
    });

    it('should return friendly message for round context errors', () => {
      const result = {
        isValid: false,
        errors: ['Round context is null'],
        warnings: [],
        metadata: {}
      };

      const message = getUserFriendlyErrorMessage(result, 'data');

      expect(message).toContain('training round information');
    });
  });

  describe('createFallbackData', () => {
    it('should create fallback for health data', () => {
      const fallback = createFallbackData('health');

      expect(fallback).toHaveProperty('weeklySteps');
      expect(fallback).toHaveProperty('weightData');
      expect(fallback).toHaveProperty('message');
      expect(fallback.weeklySteps).toEqual([]);
    });

    it('should create fallback for workout data', () => {
      const fallback = createFallbackData('workout');

      expect(fallback).toHaveProperty('sessions');
      expect(fallback).toHaveProperty('totalWorkouts');
      expect(fallback.totalWorkouts).toBe(0);
    });

    it('should create fallback for stats data', () => {
      const fallback = createFallbackData('stats');

      expect(fallback).toHaveProperty('consistency');
      expect(fallback).toHaveProperty('totalWorkouts');
      expect(fallback.consistency).toBe(0);
    });

    it('should create fallback for round data', () => {
      const fallback = createFallbackData('round');

      expect(fallback).toHaveProperty('currentRound');
      expect(fallback).toHaveProperty('isActive');
      expect(fallback.isActive).toBe(false);
    });

    it('should create generic fallback for unknown type', () => {
      const fallback = createFallbackData('unknown');

      expect(fallback).toHaveProperty('message');
    });
  });

  describe('filterDataByRound', () => {
    const roundStartDate = '2024-01-01';
    const roundEndDate = '2024-03-24';

    it('should filter data within round boundaries', () => {
      const data = [
        { date: '2023-12-25', value: 1 }, // Before
        { date: '2024-01-15', value: 2 }, // In
        { date: '2024-02-20', value: 3 }, // In
        { date: '2024-04-01', value: 4 }  // After
      ];

      const { filtered, excluded } = filterDataByRound(data, roundStartDate, roundEndDate);

      expect(filtered).toHaveLength(2);
      expect(excluded).toHaveLength(2);
      expect(filtered[0].value).toBe(2);
      expect(filtered[1].value).toBe(3);
    });

    it('should handle missing round start date', () => {
      const data = [{ date: '2024-01-15', value: 1 }];

      const { filtered, excluded } = filterDataByRound(data, null);

      expect(filtered).toHaveLength(0);
      expect(excluded).toHaveLength(1);
    });

    it('should handle empty data array', () => {
      const { filtered, excluded } = filterDataByRound([], roundStartDate);

      expect(filtered).toHaveLength(0);
      expect(excluded).toHaveLength(0);
    });

    it('should exclude entries with missing dates', () => {
      const data = [
        { date: '2024-01-15', value: 1 },
        { value: 2 } // Missing date
      ];

      const { filtered, excluded } = filterDataByRound(data, roundStartDate, roundEndDate);

      expect(filtered).toHaveLength(1);
      expect(excluded).toHaveLength(1);
      expect(excluded[0].reason).toBe('Missing date field');
    });
  });

  describe('validateDataConsistency', () => {
    it('should validate all data sources together', () => {
      const roundContext = {
        currentRound: 1,
        currentWeek: 5,
        roundStartDate: '2024-01-01',
        roundEndDate: '2024-03-24',
        isActive: true
      };

      const healthData = [
        { date: '2024-01-15', steps: 10000 }
      ];

      const workouts = [
        { date: '2024-01-16', round: 1, week: 3, day: 'A' }
      ];

      const results = validateDataConsistency({ roundContext, healthData, workouts });

      expect(results.overall.isValid).toBe(true);
      expect(results.roundContext.isValid).toBe(true);
      expect(results.healthData.isValid).toBe(true);
      expect(results.workouts.isValid).toBe(true);
    });

    it('should fail if round context is invalid', () => {
      const results = validateDataConsistency({
        roundContext: null,
        healthData: [],
        workouts: []
      });

      expect(results.overall.isValid).toBe(false);
      expect(results.roundContext.isValid).toBe(false);
    });

    it('should aggregate warnings from all sources', () => {
      const roundContext = {
        currentRound: 1,
        currentWeek: 5,
        roundStartDate: '2024-01-01',
        isActive: true
      };

      const healthData = [
        { date: '2023-12-25', steps: 10000 } // Outside round
      ];

      const workouts = [
        { date: '2024-04-01', round: 1, week: 12, day: 'A' } // Outside round
      ];

      const results = validateDataConsistency({ roundContext, healthData, workouts });

      expect(results.overall.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('handleMissingRoundContext', () => {
    it('should return fallback data and error message', () => {
      const result = handleMissingRoundContext('HealthProgress', 'health');

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('shouldShowPrompt');
      expect(result.shouldShowPrompt).toBe(true);
      expect(result.error).toBeTruthy();
    });

    it('should log error', () => {
      consistencyLogger.enabled = false;
      handleMissingRoundContext('TestComponent', 'workout');

      const logs = consistencyLogger.getLogs('error');
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('consistencyLogger', () => {
    it('should log messages with different levels', () => {
      consistencyLogger.enabled = false;
      
      consistencyLogger.error('Test error', { data: 1 });
      consistencyLogger.warn('Test warning', { data: 2 });
      consistencyLogger.info('Test info', { data: 3 });

      const errorLogs = consistencyLogger.getLogs('error');
      const warnLogs = consistencyLogger.getLogs('warn');
      const infoLogs = consistencyLogger.getLogs('info');

      expect(errorLogs).toHaveLength(1);
      expect(warnLogs).toHaveLength(1);
      expect(infoLogs).toHaveLength(1);
    });

    it('should clear logs', () => {
      consistencyLogger.enabled = false;
      consistencyLogger.info('Test');
      
      expect(consistencyLogger.getLogs()).toHaveLength(1);
      
      consistencyLogger.clearLogs();
      
      expect(consistencyLogger.getLogs()).toHaveLength(0);
    });
  });
});
