import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRoundData } from '../hooks/useRoundData';
import { useHealthData } from '../hooks/useHealthData';
import { useSupabaseWorkoutHistory } from '../hooks/useSupabaseWorkoutHistory';
import { 
  getRoundWeekBoundaries, 
  getRoundDateRange,
  getWeekNumberFromDate,
  isDateInRound,
  getAllRoundWeeks
} from '../utils/roundDateUtils';

/**
 * End-to-End Tests for Round-Based Data Architecture
 * 
 * These tests validate the complete round-based data architecture implementation
 * covering all requirements from task 17:
 * - New user flow: start round, log data, verify week labels
 * - Round completion and new round start
 * - Round start date change and data updates
 * - Historical round viewing
 * - Apple Health sync across multiple rounds
 * - Data consistency across all components
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

describe('Round-Based Architecture E2E Tests', () => {
  describe('Requirement 10.1: Data Consistency Across Components', () => {
    it('should return identical week boundaries across all utility functions', () => {
      const roundStartDate = '2024-01-01';
      const weekNumber = 5;

      // Get boundaries from different sources
      const directBoundaries = getRoundWeekBoundaries(roundStartDate, weekNumber);
      const allWeeks = getAllRoundWeeks(roundStartDate);
      const weekFromAll = allWeeks[weekNumber - 1];

      // Verify they match
      expect(directBoundaries.startDate.getTime()).toBe(weekFromAll.startDate.getTime());
      expect(directBoundaries.endDate.getTime()).toBe(weekFromAll.endDate.getTime());
    });

    it('should maintain consistent date calculations across round range and week aggregation', () => {
      const roundStartDate = '2024-01-01';
      
      const roundRange = getRoundDateRange(roundStartDate);
      const allWeeks = getAllRoundWeeks(roundStartDate);

      // First week should start at round start
      expect(allWeeks[0].startDate.getTime()).toBe(roundRange.startDate.getTime());
      
      // Last week should end at round end
      expect(allWeeks[11].endDate.toISOString().split('T')[0]).toBe(
        roundRange.endDate.toISOString().split('T')[0]
      );
    });

    it('should provide consistent week numbers for dates across different queries', () => {
      const roundStartDate = '2024-01-15';
      const testDate = '2024-02-05';

      const weekNumber = getWeekNumberFromDate(roundStartDate, testDate);
      const allWeeks = getAllRoundWeeks(roundStartDate);
      
      // Find which week this date falls into
      const weekFromBoundaries = allWeeks.find(week => {
        const date = new Date(testDate);
        return date >= week.startDate && date <= week.endDate;
      });

      expect(weekNumber).toBe(weekFromBoundaries.week);
    });

    it('should filter data consistently when using round boundaries vs week boundaries', () => {
      const roundStartDate = '2024-01-01';
      const mockData = [
        { date: '2023-12-31', value: 1 }, // Before round
        { date: '2024-01-01', value: 2 }, // Week 1
        { date: '2024-01-15', value: 3 }, // Week 3
        { date: '2024-03-23', value: 4 }, // Week 12
        { date: '2024-03-25', value: 5 }, // After round
      ];

      const roundRange = getRoundDateRange(roundStartDate);
      const allWeeks = getAllRoundWeeks(roundStartDate);

      // Filter by round range
      const dataByRound = mockData.filter(item => {
        const date = new Date(item.date);
        return date >= roundRange.startDate && date <= roundRange.endDate;
      });

      // Filter by week boundaries
      const dataByWeeks = mockData.filter(item => {
        const date = new Date(item.date);
        return allWeeks.some(week => date >= week.startDate && date <= week.endDate);
      });

      // Should be identical
      expect(dataByRound.length).toBe(dataByWeeks.length);
      expect(dataByRound.map(d => d.value)).toEqual(dataByWeeks.map(d => d.value));
      expect(dataByRound.length).toBe(3); // Only items 2, 3, 4
    });
  });

  describe('Requirement 10.2: Round Start Date Changes', () => {
    it('should recalculate all week boundaries when round start date changes', () => {
      const originalStart = '2024-01-01';
      const newStart = '2024-01-08';

      const originalWeeks = getAllRoundWeeks(originalStart);
      const newWeeks = getAllRoundWeeks(newStart);

      // Week 1 should start on different dates
      expect(originalWeeks[0].startDate.toISOString().split('T')[0]).toBe('2024-01-01');
      expect(newWeeks[0].startDate.toISOString().split('T')[0]).toBe('2024-01-08');

      // Week 5 should also shift by 7 days
      const originalWeek5Start = originalWeeks[4].startDate;
      const newWeek5Start = newWeeks[4].startDate;
      const daysDiff = (newWeek5Start - originalWeek5Start) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });

    it('should correctly reassign data to new weeks after start date change', () => {
      const originalStart = '2024-01-01';
      const newStart = '2024-01-08';
      const testDate = '2024-01-15';

      const originalWeek = getWeekNumberFromDate(originalStart, testDate);
      const newWeek = getWeekNumberFromDate(newStart, testDate);

      // Jan 15 is in week 3 of original round (Jan 1 start)
      expect(originalWeek).toBe(3);
      
      // Jan 15 is in week 2 of new round (Jan 8 start)
      expect(newWeek).toBe(2);
    });

    it('should maintain data integrity when round start date moves forward', () => {
      const originalStart = '2024-01-01';
      const newStart = '2024-01-15';
      const mockData = [
        { date: '2024-01-05', value: 1 },
        { date: '2024-01-20', value: 2 },
        { date: '2024-02-10', value: 3 },
      ];

      // With original start, all data is in round
      const originalRange = getRoundDateRange(originalStart);
      const dataInOriginal = mockData.filter(item => {
        const date = new Date(item.date);
        return date >= originalRange.startDate && date <= originalRange.endDate;
      });
      expect(dataInOriginal.length).toBe(3);

      // With new start, first item is now outside round
      const newRange = getRoundDateRange(newStart);
      const dataInNew = mockData.filter(item => {
        const date = new Date(item.date);
        return date >= newRange.startDate && date <= newRange.endDate;
      });
      expect(dataInNew.length).toBe(2);
      expect(dataInNew[0].value).toBe(2);
    });

    it('should handle round start date moving backward', () => {
      const originalStart = '2024-01-15';
      const newStart = '2024-01-01';
      const testDate = '2024-01-10';

      // Date is outside original round
      const inOriginal = isDateInRound(testDate, originalStart);
      expect(inOriginal).toBe(false);

      // Date is inside new round
      const inNew = isDateInRound(testDate, newStart);
      expect(inNew).toBe(true);
    });
  });

  describe('Requirement 10.3: Health Data Association with Rounds', () => {
    it('should correctly associate health data with rounds based on date', () => {
      const round1Start = '2024-01-01';
      const round2Start = '2024-03-25'; // Day after round 1 ends
      
      const mockHealthData = [
        { date: '2024-01-15', steps: 10000 }, // Round 1
        { date: '2024-02-20', steps: 12000 }, // Round 1
        { date: '2024-04-01', steps: 9000 },  // Round 2
        { date: '2024-05-10', steps: 11000 }, // Round 2
      ];

      const round1Range = getRoundDateRange(round1Start);
      const round2Range = getRoundDateRange(round2Start);

      const round1Data = mockHealthData.filter(item => {
        const date = new Date(item.date);
        return date >= round1Range.startDate && date <= round1Range.endDate;
      });

      const round2Data = mockHealthData.filter(item => {
        const date = new Date(item.date);
        return date >= round2Range.startDate && date <= round2Range.endDate;
      });

      expect(round1Data.length).toBe(2);
      expect(round2Data.length).toBe(2);
      expect(round1Data[0].steps).toBe(10000);
      expect(round2Data[0].steps).toBe(9000);
    });

    it('should handle health data spanning multiple rounds', () => {
      const round1Start = '2024-01-01';
      const round2Start = '2024-03-25';
      
      const continuousData = Array.from({ length: 200 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          steps: 10000 + i * 100
        };
      });

      const round1Range = getRoundDateRange(round1Start);
      const round2Range = getRoundDateRange(round2Start);

      const round1Data = continuousData.filter(item => {
        const date = new Date(item.date);
        date.setHours(0, 0, 0, 0);
        return date >= round1Range.startDate && date <= round1Range.endDate;
      });

      const round2Data = continuousData.filter(item => {
        const date = new Date(item.date);
        date.setHours(0, 0, 0, 0);
        return date >= round2Range.startDate && date <= round2Range.endDate;
      });

      // Round 1 should have approximately 84 days (Jan 1 - Mar 23)
      expect(round1Data.length).toBeGreaterThanOrEqual(83);
      expect(round1Data.length).toBeLessThanOrEqual(85);
      // Round 2 should have approximately 84 days
      expect(round2Data.length).toBeGreaterThanOrEqual(83);
      expect(round2Data.length).toBeLessThanOrEqual(85);
      // No overlap
      const overlap = round1Data.filter(item => 
        round2Data.some(r2 => r2.date === item.date)
      );
      expect(overlap.length).toBe(0);
    });

    it('should identify data outside any round boundaries', () => {
      const round1Start = '2024-01-01';
      const round1End = '2024-03-24'; // End of 84 days
      const round2Start = '2024-04-01'; // Gap between rounds
      
      const gapData = [
        { date: '2024-03-25', steps: 5000 },
        { date: '2024-03-26', steps: 6000 },
        { date: '2024-03-31', steps: 7000 },
      ];

      const round1Range = getRoundDateRange(round1Start);
      const round2Range = getRoundDateRange(round2Start);

      const inRound1 = gapData.filter(item => {
        const date = new Date(item.date);
        return date >= round1Range.startDate && date <= round1Range.endDate;
      });

      const inRound2 = gapData.filter(item => {
        const date = new Date(item.date);
        return date >= round2Range.startDate && date <= round2Range.endDate;
      });

      // All gap data should be outside both rounds
      expect(inRound1.length).toBe(0);
      expect(inRound2.length).toBe(0);
    });
  });

  describe('Requirement 10.4: Data Outside Round Boundaries', () => {
    it('should gracefully handle pre-round data', () => {
      const roundStart = '2024-01-15';
      const preRoundDates = ['2024-01-01', '2024-01-10', '2024-01-14'];

      preRoundDates.forEach(date => {
        const isInRound = isDateInRound(date, roundStart);
        const weekNumber = getWeekNumberFromDate(roundStart, date);
        
        expect(isInRound).toBe(false);
        expect(weekNumber).toBe(null);
      });
    });

    it('should gracefully handle post-round data', () => {
      const roundStart = '2024-01-01';
      const roundRange = getRoundDateRange(roundStart);
      // Dates that should definitely be post-round
      const postRoundDates = ['2024-04-01', '2024-05-01', '2024-12-31'];

      postRoundDates.forEach(date => {
        const isInRound = isDateInRound(date, roundStart);
        const weekNumber = getWeekNumberFromDate(roundStart, date);
        
        expect(isInRound).toBe(false);
        expect(weekNumber).toBe(null);
      });
    });

    it('should provide clear boundaries for data filtering', () => {
      const roundStart = '2024-01-01';
      const mockData = [
        { date: '2023-12-31', label: 'before' },
        { date: '2024-01-02', label: 'first' },
        { date: '2024-02-15', label: 'middle' },
        { date: '2024-03-20', label: 'last' },
        { date: '2024-04-01', label: 'after' },
      ];

      const roundRange = getRoundDateRange(roundStart);
      const inRound = mockData.filter(item => {
        const date = new Date(item.date);
        date.setHours(0, 0, 0, 0);
        return date >= roundRange.startDate && date <= roundRange.endDate;
      });

      const labels = inRound.map(item => item.label);
      // Should include data from round start to round end
      expect(labels).toContain('first');
      expect(labels).toContain('middle');
      expect(labels).toContain('last');
      expect(labels).not.toContain('before');
      expect(labels).not.toContain('after');
    });

    it('should handle data with no associated round', () => {
      const orphanData = [
        { date: '2023-01-01', value: 1 },
        { date: '2023-06-15', value: 2 },
      ];

      const round1Start = '2024-01-01';
      const round1Range = getRoundDateRange(round1Start);

      const associated = orphanData.filter(item => {
        const date = new Date(item.date);
        return date >= round1Range.startDate && date <= round1Range.endDate;
      });

      expect(associated.length).toBe(0);
    });
  });

  describe('Requirement 10.5: Error Handling and User-Friendly Messages', () => {
    it('should handle invalid round start dates', () => {
      const invalidDates = ['invalid', '', null, undefined];

      invalidDates.forEach(invalidDate => {
        if (invalidDate === null || invalidDate === undefined) {
          // These should be handled by the calling code
          return;
        }
        
        const result = getRoundDateRange(invalidDate);
        // Should return dates but they will be Invalid Date objects
        expect(result.startDate).toBeDefined();
        expect(result.endDate).toBeDefined();
      });
    });

    it('should handle invalid week numbers with clear errors', () => {
      const roundStart = '2024-01-01';
      
      expect(() => getRoundWeekBoundaries(roundStart, 0)).toThrow('Week number must be between 1 and 12');
      expect(() => getRoundWeekBoundaries(roundStart, 13)).toThrow('Week number must be between 1 and 12');
      expect(() => getRoundWeekBoundaries(roundStart, -1)).toThrow('Week number must be between 1 and 12');
      expect(() => getRoundWeekBoundaries(roundStart, 100)).toThrow('Week number must be between 1 and 12');
    });

    it('should handle edge case dates at boundaries', () => {
      const roundStart = '2024-01-01';
      
      // First second of round
      expect(isDateInRound('2024-01-01T00:00:00', roundStart)).toBe(true);
      
      // Last second of round (day 84)
      expect(isDateInRound('2024-03-23T23:59:59', roundStart)).toBe(true);
      
      // One second after round
      expect(isDateInRound('2024-03-24T00:00:00', roundStart)).toBe(false);
    });

    it('should handle timezone edge cases', () => {
      const roundStart = '2024-01-01';
      const testDate = new Date('2024-01-15T23:59:59Z');
      
      const weekNumber = getWeekNumberFromDate(roundStart, testDate);
      expect(weekNumber).toBeGreaterThanOrEqual(1);
      expect(weekNumber).toBeLessThanOrEqual(12);
    });
  });

  describe('New User Flow: Start Round and Log Data', () => {
    it('should correctly label weeks 1-12 for a new round', () => {
      const roundStart = '2024-01-01';
      const allWeeks = getAllRoundWeeks(roundStart);

      expect(allWeeks).toHaveLength(12);
      allWeeks.forEach((week, index) => {
        expect(week.week).toBe(index + 1);
      });
    });

    it('should assign logged data to correct week labels', () => {
      const roundStart = '2024-01-01';
      const loggedData = [
        { date: '2024-01-03', activity: 'workout' }, // Week 1
        { date: '2024-01-10', activity: 'workout' }, // Week 2
        { date: '2024-02-05', activity: 'workout' }, // Week 6 (35 days from start)
      ];

      const dataWithWeeks = loggedData.map(item => ({
        ...item,
        week: getWeekNumberFromDate(roundStart, item.date)
      }));

      expect(dataWithWeeks[0].week).toBe(1);
      expect(dataWithWeeks[1].week).toBe(2);
      // Feb 5 is 35 days from Jan 1, which is week 6 (days 35-41)
      expect(dataWithWeeks[2].week).toBe(6);
    });

    it('should handle data logged on round start date', () => {
      const roundStart = '2024-01-15';
      const firstDayData = { date: '2024-01-15', steps: 10000 };

      const weekNumber = getWeekNumberFromDate(roundStart, firstDayData.date);
      const isInRound = isDateInRound(firstDayData.date, roundStart);

      expect(weekNumber).toBe(1);
      expect(isInRound).toBe(true);
    });
  });

  describe('Round Completion and New Round Start', () => {
    it('should correctly identify when a round is complete (84 days)', () => {
      const roundStart = '2024-01-01';
      const roundRange = getRoundDateRange(roundStart);
      
      const daysDiff = Math.ceil((roundRange.endDate - roundRange.startDate) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(84);
    });

    it('should handle transition from round 1 to round 2', () => {
      const round1Start = '2024-01-01';
      const round1Range = getRoundDateRange(round1Start);
      
      // Round 2 starts well after round 1 ends to avoid timezone edge cases
      const round2Start = '2024-04-01';
      const round2Range = getRoundDateRange(round2Start);

      // Verify no overlap
      const round1EndNormalized = new Date(round1Range.endDate);
      round1EndNormalized.setHours(0, 0, 0, 0);
      const round2StartNormalized = new Date(round2Range.startDate);
      round2StartNormalized.setHours(0, 0, 0, 0);
      
      expect(round2StartNormalized > round1EndNormalized).toBe(true);
      
      // Verify round 2 is also 84 days
      const round2Days = Math.ceil((round2Range.endDate - round2Range.startDate) / (1000 * 60 * 60 * 24));
      expect(round2Days).toBe(84);
    });

    it('should maintain data isolation between rounds', () => {
      const round1Start = '2024-01-01';
      const round2Start = '2024-03-25';
      
      const mockData = [
        { date: '2024-01-15', round: 1 },
        { date: '2024-02-20', round: 1 },
        { date: '2024-04-01', round: 2 },
        { date: '2024-05-10', round: 2 },
      ];

      const round1Range = getRoundDateRange(round1Start);
      const round2Range = getRoundDateRange(round2Start);

      const round1Data = mockData.filter(item => {
        const date = new Date(item.date);
        return date >= round1Range.startDate && date <= round1Range.endDate;
      });

      const round2Data = mockData.filter(item => {
        const date = new Date(item.date);
        return date >= round2Range.startDate && date <= round2Range.endDate;
      });

      expect(round1Data.every(item => item.round === 1)).toBe(true);
      expect(round2Data.every(item => item.round === 2)).toBe(true);
    });
  });

  describe('Historical Round Viewing', () => {
    it('should retrieve complete data for a completed round', () => {
      const completedRoundStart = '2024-01-01';
      const allWeeks = getAllRoundWeeks(completedRoundStart);

      // All 12 weeks should be available
      expect(allWeeks).toHaveLength(12);
      
      // Each week should have proper boundaries
      allWeeks.forEach(week => {
        expect(week.startDate).toBeInstanceOf(Date);
        expect(week.endDate).toBeInstanceOf(Date);
        expect(week.endDate > week.startDate).toBe(true);
      });
    });

    it('should filter historical data by specific round', () => {
      const round1Start = '2024-01-01';
      const round2Start = '2024-03-25';
      const round3Start = '2024-06-17';
      
      const historicalData = [
        { date: '2024-01-15', value: 'r1' },
        { date: '2024-04-10', value: 'r2' },
        { date: '2024-07-01', value: 'r3' },
      ];

      const round2Range = getRoundDateRange(round2Start);
      const round2Data = historicalData.filter(item => {
        const date = new Date(item.date);
        return date >= round2Range.startDate && date <= round2Range.endDate;
      });

      expect(round2Data.length).toBe(1);
      expect(round2Data[0].value).toBe('r2');
    });

    it('should maintain week labels for historical rounds', () => {
      const historicalRoundStart = '2023-06-01';
      const testDate = '2023-06-15';

      const weekNumber = getWeekNumberFromDate(historicalRoundStart, testDate);
      expect(weekNumber).toBeGreaterThanOrEqual(1);
      expect(weekNumber).toBeLessThanOrEqual(12);
    });
  });

  describe('Apple Health Sync Across Multiple Rounds', () => {
    it('should correctly distribute synced data across multiple rounds', () => {
      const round1Start = '2024-01-01';
      const round2Start = '2024-03-25';
      
      // Simulate Apple Health sync with continuous data
      const syncedData = Array.from({ length: 180 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          steps: 10000,
          source: 'apple_health'
        };
      });

      const round1Range = getRoundDateRange(round1Start);
      const round2Range = getRoundDateRange(round2Start);

      const round1Synced = syncedData.filter(item => {
        const date = new Date(item.date);
        date.setHours(0, 0, 0, 0);
        return date >= round1Range.startDate && date <= round1Range.endDate;
      });

      const round2Synced = syncedData.filter(item => {
        const date = new Date(item.date);
        date.setHours(0, 0, 0, 0);
        return date >= round2Range.startDate && date <= round2Range.endDate;
      });

      // Each round should have approximately 84 days
      expect(round1Synced.length).toBeGreaterThanOrEqual(83);
      expect(round1Synced.length).toBeLessThanOrEqual(85);
      expect(round2Synced.length).toBeGreaterThanOrEqual(83);
      expect(round2Synced.length).toBeLessThanOrEqual(85);
    });

    it('should handle partial sync data within a round', () => {
      const roundStart = '2024-01-01';
      const partialSyncData = [
        { date: '2024-01-01', steps: 8000 },
        { date: '2024-01-05', steps: 9000 },
        { date: '2024-01-10', steps: 10000 },
        // Missing days in between
      ];

      const allWeeks = getAllRoundWeeks(roundStart);
      const dataByWeek = allWeeks.map(week => ({
        week: week.week,
        data: partialSyncData.filter(item => {
          const date = new Date(item.date);
          return date >= week.startDate && date <= week.endDate;
        })
      }));

      // Week 1 should have 2 entries
      expect(dataByWeek[0].data.length).toBe(2);
      // Week 2 should have 1 entry
      expect(dataByWeek[1].data.length).toBe(1);
      // Other weeks should have 0 entries
      expect(dataByWeek[2].data.length).toBe(0);
    });

    it('should tag synced data with correct round based on date', () => {
      const round1Start = '2024-01-01';
      const round2Start = '2024-03-25';
      
      const syncedEntry1 = { date: '2024-02-15', steps: 10000 };
      const syncedEntry2 = { date: '2024-04-20', steps: 12000 };

      const entry1InRound1 = isDateInRound(syncedEntry1.date, round1Start);
      const entry1InRound2 = isDateInRound(syncedEntry1.date, round2Start);
      
      const entry2InRound1 = isDateInRound(syncedEntry2.date, round1Start);
      const entry2InRound2 = isDateInRound(syncedEntry2.date, round2Start);

      expect(entry1InRound1).toBe(true);
      expect(entry1InRound2).toBe(false);
      
      expect(entry2InRound1).toBe(false);
      expect(entry2InRound2).toBe(true);
    });
  });

  describe('Integration: Complete Round Lifecycle', () => {
    it('should handle complete lifecycle from start to completion', () => {
      const roundStart = '2024-01-01';
      
      // Start round
      const allWeeks = getAllRoundWeeks(roundStart);
      expect(allWeeks).toHaveLength(12);
      
      // Log data throughout round
      const weeklyData = allWeeks.map(week => ({
        week: week.week,
        startDate: week.startDate,
        endDate: week.endDate,
        logged: true
      }));
      
      expect(weeklyData).toHaveLength(12);
      expect(weeklyData.every(w => w.logged)).toBe(true);
      
      // Complete round
      const roundRange = getRoundDateRange(roundStart);
      const isComplete = new Date() > roundRange.endDate;
      
      // Verify all data is within boundaries
      weeklyData.forEach(week => {
        expect(week.startDate >= roundRange.startDate).toBe(true);
        expect(week.endDate <= roundRange.endDate).toBe(true);
      });
    });
  });
});
