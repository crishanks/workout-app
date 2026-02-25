import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateRoundDataIsolation,
  archiveRoundData,
  handleRoundStartDateChange,
  validateDataIntegrityAcrossRounds
} from './roundTransitionHandler';

describe('Round Transition Handler', () => {
  describe('validateRoundDataIsolation', () => {
    it('should validate that rounds do not overlap', () => {
      const historicalRound = {
        round: 1,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-03-25T23:59:59.999Z',
        isActive: false
      };

      const newRound = {
        round: 2,
        startDate: '2024-03-26T00:00:00.000Z',
        endDate: null,
        isActive: true
      };

      const result = validateRoundDataIsolation(historicalRound, newRound, [], []);

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should detect date overlap between rounds', () => {
      const historicalRound = {
        round: 1,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-03-25T23:59:59.999Z',
        isActive: false
      };

      const newRound = {
        round: 2,
        startDate: '2024-03-20T00:00:00.000Z', // Overlaps with historical round
        endDate: null,
        isActive: true
      };

      const result = validateRoundDataIsolation(historicalRound, newRound, [], []);

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('date_overlap');
    });

    it('should detect workouts crossing round boundaries', () => {
      const historicalRound = {
        round: 1,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-03-25T23:59:59.999Z',
        isActive: false
      };

      const newRound = {
        round: 2,
        startDate: '2024-03-26T00:00:00.000Z',
        endDate: null,
        isActive: true
      };

      const workouts = [
        {
          id: '1',
          round: 1,
          date: '2024-03-30T00:00:00.000Z', // Should be in round 2
          day: 'Monday'
        }
      ];

      const result = validateRoundDataIsolation(historicalRound, newRound, workouts, []);

      expect(result.isValid).toBe(false);
      expect(result.conflicts.some(c => c.type === 'workout_boundary_violation')).toBe(true);
    });
  });

  describe('archiveRoundData', () => {
    it('should archive round data with workouts and health data', () => {
      const roundData = {
        round: 1,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-03-25T23:59:59.999Z',
        isActive: false
      };

      const workouts = [
        {
          id: '1',
          round: 1,
          date: '2024-01-15T00:00:00.000Z',
          day: 'Monday'
        },
        {
          id: '2',
          round: 1,
          date: '2024-02-10T00:00:00.000Z',
          day: 'Tuesday'
        }
      ];

      const healthData = [
        {
          id: '1',
          date: '2024-01-15',
          steps: 10000,
          weight: 180
        },
        {
          id: '2',
          date: '2024-02-10',
          steps: 12000,
          weight: 178
        }
      ];

      const result = archiveRoundData(roundData, workouts, healthData);

      expect(result.success).toBe(true);
      expect(result.archive).toBeDefined();
      expect(result.archive.round).toBe(1);
      expect(result.archive.workouts.total).toBe(2);
      expect(result.archive.healthData.total).toBe(2);
    });

    it('should handle missing round data', () => {
      const result = archiveRoundData(null, [], []);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('handleRoundStartDateChange', () => {
    it('should recalculate boundaries when start date changes', () => {
      const oldStartDate = '2024-01-01T00:00:00.000Z';
      const newStartDate = '2024-01-08T00:00:00.000Z'; // One week later

      const workouts = [
        {
          id: '1',
          date: '2024-01-05T00:00:00.000Z',
          round: 1,
          week: 1
        },
        {
          id: '2',
          date: '2024-01-15T00:00:00.000Z',
          round: 1,
          week: 2
        }
      ];

      const result = handleRoundStartDateChange(oldStartDate, newStartDate, workouts, []);

      expect(result.success).toBe(true);
      expect(result.oldBoundaries).toBeDefined();
      expect(result.newBoundaries).toBeDefined();
      expect(result.affectedData).toBeDefined();
    });

    it('should identify workouts that fall outside new boundaries', () => {
      const oldStartDate = '2024-01-01T00:00:00.000Z';
      const newStartDate = '2024-01-15T00:00:00.000Z'; // Two weeks later

      const workouts = [
        {
          id: '1',
          date: '2024-01-05T00:00:00.000Z', // Will be outside new boundaries
          round: 1,
          week: 1
        },
        {
          id: '2',
          date: '2024-02-01T00:00:00.000Z', // Will be inside new boundaries
          round: 1,
          week: 2
        }
      ];

      const result = handleRoundStartDateChange(oldStartDate, newStartDate, workouts, []);

      expect(result.success).toBe(true);
      expect(result.affectedData.workouts.nowExcluded).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle missing start dates', () => {
      const result = handleRoundStartDateChange(null, '2024-01-01T00:00:00.000Z', [], []);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateDataIntegrityAcrossRounds', () => {
    it('should validate data integrity with no issues', () => {
      const rounds = [
        {
          round: 1,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-03-25T23:59:59.999Z',
          isActive: false
        },
        {
          round: 2,
          startDate: '2024-03-26T00:00:00.000Z',
          endDate: null,
          isActive: true
        }
      ];

      const workouts = [
        {
          id: '1',
          round: 1,
          date: '2024-01-15T00:00:00.000Z',
          day: 'Monday'
        },
        {
          id: '2',
          round: 2,
          date: '2024-04-01T00:00:00.000Z',
          day: 'Tuesday'
        }
      ];

      const result = validateDataIntegrityAcrossRounds(rounds, workouts, []);

      expect(result.isValid).toBe(true);
      expect(result.summary.totalRounds).toBe(2);
      expect(result.summary.totalWorkouts).toBe(2);
    });

    it('should detect overlapping rounds', () => {
      const rounds = [
        {
          round: 1,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-03-25T23:59:59.999Z',
          isActive: false
        },
        {
          round: 2,
          startDate: '2024-03-20T00:00:00.000Z', // Overlaps with round 1
          endDate: null,
          isActive: true
        }
      ];

      const result = validateDataIntegrityAcrossRounds(rounds, [], []);

      expect(result.isValid).toBe(false);
      expect(result.summary.overlappingRounds).toBeGreaterThan(0);
      expect(result.issues.some(i => i.type === 'overlapping_rounds')).toBe(true);
    });

    it('should detect orphaned workouts', () => {
      const rounds = [
        {
          round: 1,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-03-25T23:59:59.999Z',
          isActive: false
        }
      ];

      const workouts = [
        {
          id: '1',
          round: 1,
          date: '2024-01-15T00:00:00.000Z',
          day: 'Monday'
        },
        {
          id: '2',
          round: 1,
          date: '2024-05-01T00:00:00.000Z', // Outside any round
          day: 'Tuesday'
        }
      ];

      const result = validateDataIntegrityAcrossRounds(rounds, workouts, []);

      expect(result.summary.orphanedWorkouts).toBeGreaterThan(0);
      expect(result.issues.some(i => i.type === 'orphaned_workout')).toBe(true);
    });

    it('should detect workout round number mismatches', () => {
      const rounds = [
        {
          round: 1,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-03-25T23:59:59.999Z',
          isActive: false
        }
      ];

      const workouts = [
        {
          id: '1',
          round: 2, // Wrong round number
          date: '2024-01-15T00:00:00.000Z',
          day: 'Monday'
        }
      ];

      const result = validateDataIntegrityAcrossRounds(rounds, workouts, []);

      expect(result.issues.some(i => i.type === 'workout_round_mismatch')).toBe(true);
    });

    it('should handle empty data gracefully', () => {
      const result = validateDataIntegrityAcrossRounds([], [], []);

      expect(result.isValid).toBe(true);
      expect(result.summary.totalRounds).toBe(0);
    });
  });
});
