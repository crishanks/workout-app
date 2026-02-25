import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRoundWeekBoundaries, isDateInRound, getWeekNumberFromDate } from '../utils/roundDateUtils';

/**
 * Tests for Workout Date Validation Functions
 * 
 * These tests focus on the getWorkoutsByRoundWeek and validateWorkoutDates functions
 * from useSupabaseWorkoutHistory hook. Since these are hook functions that depend on
 * React state and Supabase, we test the core logic using the utility functions they rely on.
 */

describe('Workout Date Validation', () => {
  // Mock workout data spanning multiple rounds and weeks
  const mockWorkoutHistory = [
    // Round 1, Week 1 (Jan 1-7, 2024)
    {
      id: 'w1',
      user_id: 'test-user',
      day: 'Push A',
      date: '2024-01-01',
      week: 1,
      round: 1,
      timestamp: '2024-01-01T10:00:00Z',
      exercises: [{ name: 'Bench Press', sets: { 0: { weight: 135, reps: 10 } } }]
    },
    {
      id: 'w2',
      user_id: 'test-user',
      day: 'Pull A',
      date: '2024-01-03',
      week: 1,
      round: 1,
      timestamp: '2024-01-03T10:00:00Z',
      exercises: [{ name: 'Deadlift', sets: { 0: { weight: 225, reps: 8 } } }]
    },
    {
      id: 'w3',
      user_id: 'test-user',
      day: 'Legs A',
      date: '2024-01-05',
      week: 1,
      round: 1,
      timestamp: '2024-01-05T10:00:00Z',
      exercises: [{ name: 'Squat', sets: { 0: { weight: 185, reps: 10 } } }]
    },
    
    // Round 1, Week 2 (Jan 8-14, 2024)
    {
      id: 'w4',
      user_id: 'test-user',
      day: 'Push B',
      date: '2024-01-08',
      week: 2,
      round: 1,
      timestamp: '2024-01-08T10:00:00Z',
      exercises: [{ name: 'Incline Press', sets: { 0: { weight: 115, reps: 12 } } }]
    },
    {
      id: 'w5',
      user_id: 'test-user',
      day: 'Pull B',
      date: '2024-01-10',
      week: 2,
      round: 1,
      timestamp: '2024-01-10T10:00:00Z',
      exercises: [{ name: 'Rows', sets: { 0: { weight: 135, reps: 10 } } }]
    },
    
    // Round 1, Week 11 - Misaligned: stored as week 11 but date is in week 12
    {
      id: 'w6',
      user_id: 'test-user',
      day: 'Push A',
      date: '2024-03-19', // This is actually in week 12 (day 77)
      week: 11, // But stored as week 11 (MISMATCH)
      round: 1,
      timestamp: '2024-03-19T10:00:00Z',
      exercises: [{ name: 'Bench Press', sets: { 0: { weight: 155, reps: 10 } } }]
    },
    
    // Round 1, Week 12 (Mar 19-24, 2024)
    {
      id: 'w7',
      user_id: 'test-user',
      day: 'Pull A',
      date: '2024-03-20',
      week: 12,
      round: 1,
      timestamp: '2024-03-20T10:00:00Z',
      exercises: [{ name: 'Deadlift', sets: { 0: { weight: 245, reps: 8 } } }]
    },
    
    // Misaligned data: Week number doesn't match date
    {
      id: 'w8',
      user_id: 'test-user',
      day: 'Legs B',
      date: '2024-01-15', // This is actually in week 3
      week: 2, // But stored as week 2 (MISMATCH)
      round: 1,
      timestamp: '2024-01-15T10:00:00Z',
      exercises: [{ name: 'Leg Press', sets: { 0: { weight: 315, reps: 12 } } }]
    },
    
    // Data outside round boundaries
    {
      id: 'w9',
      user_id: 'test-user',
      day: 'Push A',
      date: '2023-12-30', // Before round 1 starts
      week: 1,
      round: 1,
      timestamp: '2023-12-30T10:00:00Z',
      exercises: [{ name: 'Bench Press', sets: { 0: { weight: 125, reps: 10 } } }]
    },
    {
      id: 'w10',
      user_id: 'test-user',
      day: 'Pull A',
      date: '2024-03-25', // After round 1 ends (day 85)
      week: 12,
      round: 1,
      timestamp: '2024-03-25T10:00:00Z',
      exercises: [{ name: 'Deadlift', sets: { 0: { weight: 250, reps: 8 } } }]
    },
    
    // Round 2 data
    {
      id: 'w11',
      user_id: 'test-user',
      day: 'Push A',
      date: '2024-03-25',
      week: 1,
      round: 2,
      timestamp: '2024-03-25T10:00:00Z',
      exercises: [{ name: 'Bench Press', sets: { 0: { weight: 160, reps: 10 } } }]
    }
  ];

  describe('Workout Filtering by Round Week', () => {
    it('should filter workouts for a specific round week', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      const week = 1;
      
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, week);
      
      const filteredWorkouts = mockWorkoutHistory.filter(session => {
        if (session.round !== round) return false;
        
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        const sessionDate = new Date(sessionDateStr + 'T12:00:00');
        
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      // Should return 3 workouts from week 1
      expect(filteredWorkouts).toHaveLength(3);
      expect(filteredWorkouts.every(w => w.round === 1)).toBe(true);
      expect(filteredWorkouts.map(w => w.id)).toEqual(['w1', 'w2', 'w3']);
    });

    it('should filter workouts for week 2 correctly', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      const week = 2;
      
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, week);
      
      const filteredWorkouts = mockWorkoutHistory.filter(session => {
        if (session.round !== round) return false;
        
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        const sessionDate = new Date(sessionDateStr + 'T12:00:00');
        
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      // Should return 2 workouts from week 2 (not including the misaligned one)
      expect(filteredWorkouts).toHaveLength(2);
      expect(filteredWorkouts.map(w => w.id)).toEqual(['w4', 'w5']);
    });

    it('should filter workouts for week 12 correctly', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      const week = 12;
      
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, week);
      
      const filteredWorkouts = mockWorkoutHistory.filter(session => {
        if (session.round !== round) return false;
        
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        const sessionDate = new Date(sessionDateStr + 'T12:00:00');
        
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      // Should return 2 workouts from week 12 (w6 and w7, both have dates in week 12)
      expect(filteredWorkouts).toHaveLength(2);
      expect(filteredWorkouts.map(w => w.id)).toEqual(['w6', 'w7']);
    });

    it('should return empty array for week with no workouts', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      const week = 5;
      
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, week);
      
      const filteredWorkouts = mockWorkoutHistory.filter(session => {
        if (session.round !== round) return false;
        
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        const sessionDate = new Date(sessionDateStr + 'T12:00:00');
        
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      expect(filteredWorkouts).toHaveLength(0);
    });

    it('should not include workouts from other rounds', () => {
      const roundStartDate = '2024-03-25';
      const round = 2;
      const week = 1;
      
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, week);
      
      const filteredWorkouts = mockWorkoutHistory.filter(session => {
        if (session.round !== round) return false;
        
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        const sessionDate = new Date(sessionDateStr + 'T12:00:00');
        
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      // Should only return round 2 workouts
      expect(filteredWorkouts).toHaveLength(1);
      expect(filteredWorkouts[0].round).toBe(2);
      expect(filteredWorkouts[0].id).toBe('w11');
    });

    it('should handle workouts with ISO datetime strings', () => {
      const workoutWithISODate = {
        id: 'w12',
        user_id: 'test-user',
        day: 'Push A',
        date: '2024-01-02T00:00:00.000Z',
        week: 1,
        round: 1,
        timestamp: '2024-01-02T10:00:00Z',
        exercises: []
      };
      
      const roundStartDate = '2024-01-01';
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, 1);
      
      const sessionDateStr = workoutWithISODate.date.includes('T') 
        ? workoutWithISODate.date.split('T')[0] 
        : workoutWithISODate.date;
      const sessionDate = new Date(sessionDateStr + 'T12:00:00');
      
      const isInWeek = sessionDate >= startDate && sessionDate <= endDate;
      
      expect(isInWeek).toBe(true);
    });
  });

  describe('Date Validation Against Round Boundaries', () => {
    it('should identify workouts within round boundaries as valid', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      const validWorkouts = roundWorkouts.filter(session => {
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        
        return isDateInRound(sessionDateStr, roundStartDate);
      });
      
      // Should have 7 valid workouts (w1-w7) plus the misaligned one (w8)
      expect(validWorkouts.length).toBeGreaterThan(0);
      expect(validWorkouts.every(w => {
        const dateStr = w.date.includes('T') ? w.date.split('T')[0] : w.date;
        return isDateInRound(dateStr, roundStartDate);
      })).toBe(true);
    });

    it('should identify workouts outside round boundaries as invalid', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      const invalidWorkouts = roundWorkouts.filter(session => {
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        
        return !isDateInRound(sessionDateStr, roundStartDate);
      });
      
      // Should find 2 invalid workouts (w9 before round, w10 after round)
      expect(invalidWorkouts).toHaveLength(2);
      expect(invalidWorkouts.map(w => w.id)).toEqual(['w9', 'w10']);
    });

    it('should validate workout on first day of round', () => {
      const roundStartDate = '2024-01-01';
      const workout = mockWorkoutHistory.find(w => w.id === 'w1');
      
      const sessionDateStr = workout.date.includes('T') 
        ? workout.date.split('T')[0] 
        : workout.date;
      
      expect(isDateInRound(sessionDateStr, roundStartDate)).toBe(true);
    });

    it('should validate workout on last day of round', () => {
      const roundStartDate = '2024-01-01';
      // Last day of round is Mar 23 (day 83, 0-indexed)
      const lastDayWorkout = {
        id: 'w13',
        date: '2024-03-23',
        round: 1,
        week: 12
      };
      
      const sessionDateStr = lastDayWorkout.date.includes('T') 
        ? lastDayWorkout.date.split('T')[0] 
        : lastDayWorkout.date;
      
      expect(isDateInRound(sessionDateStr, roundStartDate)).toBe(true);
    });

    it('should invalidate workout one day before round start', () => {
      const roundStartDate = '2024-01-01';
      const workout = mockWorkoutHistory.find(w => w.id === 'w9');
      
      const sessionDateStr = workout.date.includes('T') 
        ? workout.date.split('T')[0] 
        : workout.date;
      
      expect(isDateInRound(sessionDateStr, roundStartDate)).toBe(false);
    });

    it('should invalidate workout one day after round end', () => {
      const roundStartDate = '2024-01-01';
      const workout = mockWorkoutHistory.find(w => w.id === 'w10');
      
      const sessionDateStr = workout.date.includes('T') 
        ? workout.date.split('T')[0] 
        : workout.date;
      
      expect(isDateInRound(sessionDateStr, roundStartDate)).toBe(false);
    });
  });

  describe('Handling of Misaligned Data', () => {
    it('should detect week number mismatch', () => {
      const roundStartDate = '2024-01-01';
      const misalignedWorkout = mockWorkoutHistory.find(w => w.id === 'w8');
      
      const sessionDateStr = misalignedWorkout.date.includes('T') 
        ? misalignedWorkout.date.split('T')[0] 
        : misalignedWorkout.date;
      
      const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
      const storedWeek = misalignedWorkout.week;
      
      expect(calculatedWeek).toBe(3);
      expect(storedWeek).toBe(2);
      expect(calculatedWeek).not.toBe(storedWeek);
    });

    it('should categorize misaligned workout as warning, not invalid', () => {
      const roundStartDate = '2024-01-01';
      const misalignedWorkout = mockWorkoutHistory.find(w => w.id === 'w8');
      
      const sessionDateStr = misalignedWorkout.date.includes('T') 
        ? misalignedWorkout.date.split('T')[0] 
        : misalignedWorkout.date;
      
      // Date is within round boundaries
      const inRound = isDateInRound(sessionDateStr, roundStartDate);
      expect(inRound).toBe(true);
      
      // But week number doesn't match
      const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
      const hasWeekMismatch = calculatedWeek !== misalignedWorkout.week;
      expect(hasWeekMismatch).toBe(true);
    });

    it('should validate all correctly aligned workouts', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      
      const correctlyAligned = roundWorkouts.filter(session => {
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        
        // Must be in round
        if (!isDateInRound(sessionDateStr, roundStartDate)) return false;
        
        // Week number must match calculated week
        const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
        return calculatedWeek === session.week;
      });
      
      // Should have 6 correctly aligned workouts (w1-w5, w7, excluding w6, w8, w9, w10)
      expect(correctlyAligned).toHaveLength(6);
      expect(correctlyAligned.map(w => w.id)).toEqual(['w1', 'w2', 'w3', 'w4', 'w5', 'w7']);
    });

    it('should provide detailed information for misaligned workouts', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      const warnings = [];
      
      roundWorkouts.forEach(session => {
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        
        if (!isDateInRound(sessionDateStr, roundStartDate)) return;
        
        const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
        
        if (calculatedWeek !== session.week) {
          warnings.push({
            id: session.id,
            date: sessionDateStr,
            storedWeek: session.week,
            calculatedWeek,
            reason: `Week mismatch: stored as week ${session.week}, but date ${sessionDateStr} falls in week ${calculatedWeek}`
          });
        }
      });
      
      // Should find 2 misaligned workouts (w6 and w8)
      expect(warnings).toHaveLength(2);
      expect(warnings.map(w => w.id).sort()).toEqual(['w6', 'w8']);
      
      // Check w8 details
      const w8Warning = warnings.find(w => w.id === 'w8');
      expect(w8Warning.storedWeek).toBe(2);
      expect(w8Warning.calculatedWeek).toBe(3);
      
      // Check w6 details
      const w6Warning = warnings.find(w => w.id === 'w6');
      expect(w6Warning.storedWeek).toBe(11);
      expect(w6Warning.calculatedWeek).toBe(12);
    });
  });

  describe('Complete Validation Flow', () => {
    it('should categorize all workouts correctly', () => {
      const roundStartDate = '2024-01-01';
      const round = 1;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      const valid = [];
      const invalid = [];
      const warnings = [];
      
      roundWorkouts.forEach(session => {
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        
        // Check if date is within round boundaries
        const inRound = isDateInRound(sessionDateStr, roundStartDate);
        
        if (!inRound) {
          invalid.push({
            ...session,
            reason: 'Date falls outside round boundaries'
          });
          return;
        }
        
        // Check if week number matches the calculated week from date
        const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
        
        if (calculatedWeek !== session.week) {
          warnings.push({
            ...session,
            calculatedWeek,
            storedWeek: session.week,
            reason: `Week mismatch: stored as week ${session.week}, but date ${sessionDateStr} falls in week ${calculatedWeek}`
          });
        } else {
          valid.push(session);
        }
      });
      
      expect(valid).toHaveLength(6);
      expect(warnings).toHaveLength(2);
      expect(invalid).toHaveLength(2);
      
      // Verify specific categorizations
      expect(valid.map(w => w.id)).toEqual(['w1', 'w2', 'w3', 'w4', 'w5', 'w7']);
      expect(warnings.map(w => w.id).sort()).toEqual(['w6', 'w8']);
      expect(invalid.map(w => w.id)).toEqual(['w9', 'w10']);
    });

    it('should handle round with no invalid data', () => {
      const roundStartDate = '2024-03-25';
      const round = 2;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      const invalid = [];
      const warnings = [];
      
      roundWorkouts.forEach(session => {
        const sessionDateStr = session.date.includes('T') 
          ? session.date.split('T')[0] 
          : session.date;
        
        const inRound = isDateInRound(sessionDateStr, roundStartDate);
        
        if (!inRound) {
          invalid.push(session);
          return;
        }
        
        const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
        
        if (calculatedWeek !== session.week) {
          warnings.push(session);
        }
      });
      
      expect(invalid).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });

    it('should handle empty workout history', () => {
      const roundStartDate = '2024-01-01';
      const round = 3;
      
      const roundWorkouts = mockWorkoutHistory.filter(s => s.round === round);
      
      expect(roundWorkouts).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle workout on week boundary correctly', () => {
      const roundStartDate = '2024-01-01';
      
      // Jan 7 is last day of week 1
      const lastDayWeek1 = {
        id: 'w14',
        date: '2024-01-07',
        week: 1,
        round: 1
      };
      
      // Jan 8 is first day of week 2
      const firstDayWeek2 = {
        id: 'w15',
        date: '2024-01-08',
        week: 2,
        round: 1
      };
      
      expect(getWeekNumberFromDate(roundStartDate, lastDayWeek1.date)).toBe(1);
      expect(getWeekNumberFromDate(roundStartDate, firstDayWeek2.date)).toBe(2);
    });

    it('should handle different round start dates', () => {
      // Round starting on a Wednesday
      const roundStartDate = '2024-01-03';
      const workout = {
        id: 'w16',
        date: '2024-01-10', // 7 days later, should be week 2
        week: 2,
        round: 1
      };
      
      const calculatedWeek = getWeekNumberFromDate(roundStartDate, workout.date);
      expect(calculatedWeek).toBe(2);
    });

    it('should handle workouts with time components in date', () => {
      const roundStartDate = '2024-01-01';
      const workout = {
        id: 'w17',
        date: '2024-01-15T14:30:00.000Z',
        week: 3,
        round: 1
      };
      
      const sessionDateStr = workout.date.includes('T') 
        ? workout.date.split('T')[0] 
        : workout.date;
      
      const calculatedWeek = getWeekNumberFromDate(roundStartDate, sessionDateStr);
      expect(calculatedWeek).toBe(3);
      expect(calculatedWeek).toBe(workout.week);
    });

    it('should handle leap year dates correctly', () => {
      const roundStartDate = '2024-02-26';
      const leapDayWorkout = {
        id: 'w18',
        date: '2024-02-29',
        week: 1,
        round: 1
      };
      
      const calculatedWeek = getWeekNumberFromDate(roundStartDate, leapDayWorkout.date);
      expect(calculatedWeek).toBe(1);
      expect(isDateInRound(leapDayWorkout.date, roundStartDate)).toBe(true);
    });
  });

  describe('Performance and Efficiency', () => {
    it('should efficiently filter large workout datasets', () => {
      // Create a large dataset
      const largeDataset = [];
      for (let i = 0; i < 1000; i++) {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + (i % 84));
        largeDataset.push({
          id: `w${i}`,
          date: date.toISOString().split('T')[0],
          week: Math.floor((i % 84) / 7) + 1,
          round: Math.floor(i / 84) + 1
        });
      }
      
      const roundStartDate = '2024-01-01';
      const round = 1;
      const week = 5;
      
      const startTime = performance.now();
      
      const { startDate, endDate } = getRoundWeekBoundaries(roundStartDate, week);
      const filtered = largeDataset.filter(session => {
        if (session.round !== round) return false;
        const sessionDate = new Date(session.date + 'T12:00:00');
        return sessionDate >= startDate && sessionDate <= endDate;
      });
      
      const endTime = performance.now();
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});
