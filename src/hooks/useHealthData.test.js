import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getRoundWeekBoundaries, 
  getRoundDateRange,
  getAllRoundWeeks 
} from '../utils/roundDateUtils';

/**
 * Integration Tests for Round-Aware Health Data Queries
 * 
 * NOTE: These tests focus on the round date utility integration with health data concepts.
 * Full hook testing is blocked by a circular dependency issue in useHealthData.js where
 * getRoundHealthMetrics depends on getWeeklyAverageWeight before it's defined.
 * 
 * This issue should be fixed in the useHealthData hook by reordering function definitions
 * or restructuring the dependency arrays.
 */

describe('Round-Aware Health Data Integration Tests', () => {
  // Sample health data spanning multiple rounds
  const mockHealthData = [
    // Round 1: Week 1 (Jan 1-7, 2024)
    { id: '1', user_id: 'test-user-id', date: '2024-01-01', steps: 8000, weight: 180.0 },
    { id: '2', user_id: 'test-user-id', date: '2024-01-02', steps: 9000, weight: null },
    { id: '3', user_id: 'test-user-id', date: '2024-01-03', steps: 7500, weight: null },
    { id: '4', user_id: 'test-user-id', date: '2024-01-04', steps: 10000, weight: 179.5 },
    { id: '5', user_id: 'test-user-id', date: '2024-01-05', steps: 8500, weight: null },
    { id: '6', user_id: 'test-user-id', date: '2024-01-06', steps: 9500, weight: null },
    { id: '7', user_id: 'test-user-id', date: '2024-01-07', steps: 11000, weight: 179.0 },
    
    // Round 1: Week 2 (Jan 8-14, 2024)
    { id: '8', user_id: 'test-user-id', date: '2024-01-08', steps: 7000, weight: null },
    { id: '9', user_id: 'test-user-id', date: '2024-01-09', steps: 8000, weight: 178.5 },
    { id: '10', user_id: 'test-user-id', date: '2024-01-10', steps: 9000, weight: null },
    { id: '11', user_id: 'test-user-id', date: '2024-01-11', steps: 8500, weight: null },
    { id: '12', user_id: 'test-user-id', date: '2024-01-12', steps: 10000, weight: 178.0 },
    { id: '13', user_id: 'test-user-id', date: '2024-01-13', steps: 9500, weight: null },
    { id: '14', user_id: 'test-user-id', date: '2024-01-14', steps: 8000, weight: 177.5 },
    
    // Round 1: Week 12 (Mar 18-24, 2024)
    { id: '15', user_id: 'test-user-id', date: '2024-03-18', steps: 12000, weight: 175.0 },
    { id: '16', user_id: 'test-user-id', date: '2024-03-19', steps: 11000, weight: null },
    { id: '17', user_id: 'test-user-id', date: '2024-03-20', steps: 10000, weight: 174.5 },
    { id: '18', user_id: 'test-user-id', date: '2024-03-21', steps: 9500, weight: null },
    { id: '19', user_id: 'test-user-id', date: '2024-03-22', steps: 11500, weight: 174.0 },
    { id: '20', user_id: 'test-user-id', date: '2024-03-23', steps: 10500, weight: null },
    
    // Data outside round boundaries (before round start)
    { id: '21', user_id: 'test-user-id', date: '2023-12-30', steps: 5000, weight: 182.0 },
    { id: '22', user_id: 'test-user-id', date: '2023-12-31', steps: 6000, weight: 181.5 },
    
    // Data outside round boundaries (after round end)
    { id: '23', user_id: 'test-user-id', date: '2024-03-25', steps: 7000, weight: 173.5 },
    { id: '24', user_id: 'test-user-id', date: '2024-03-26', steps: 8000, weight: 173.0 },
  ];

  describe('Data Filtering by Round Boundaries', () => {
    it('should filter data to only include entries within round date range', () => {
      const roundStartDate = '2024-01-01';
      const { startDate, endDate } = getRoundDateRange(roundStartDate);

      const filteredData = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Should include data from Jan 1 to Mar 23 (84 days)
      expect(filteredData.length).toBeGreaterThan(0);
      
      // Verify no data before round start
      const hasDataBeforeRound = filteredData.some(
        entry => new Date(entry.date) < new Date('2024-01-01')
      );
      expect(hasDataBeforeRound).toBe(false);
      
      // Verify no data after round end (Mar 24 onwards)
      const hasDataAfterRound = filteredData.some(
        entry => new Date(entry.date) > new Date('2024-03-23')
      );
      expect(hasDataAfterRound).toBe(false);
    });

    it('should correctly identify weight data within round boundaries', () => {
      const roundStartDate = '2024-01-01';
      const { startDate, endDate } = getRoundDateRange(roundStartDate);

      const weightData = mockHealthData
        .filter(entry => entry.weight !== null)
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // First weight entry should be from Jan 1 (180.0), not Dec 30 (182.0)
      expect(weightData[0].date).toBe('2024-01-01');
      expect(weightData[0].weight).toBe(180.0);
      
      // Should not include pre-round data
      const hasPreRoundWeight = weightData.some(
        entry => entry.date === '2023-12-30' || entry.date === '2023-12-31'
      );
      expect(hasPreRoundWeight).toBe(false);
    });

    it('should handle custom round end date for filtering', () => {
      const roundStartDate = '2024-01-01';
      const customEndDate = new Date('2024-01-14');
      customEndDate.setHours(23, 59, 59, 999);

      const filteredData = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(roundStartDate) && entryDate <= customEndDate;
      });

      // Should only include data up to Jan 14
      const hasDataAfterCustomEnd = filteredData.some(
        entry => new Date(entry.date) > new Date('2024-01-14')
      );
      expect(hasDataAfterCustomEnd).toBe(false);
      
      // Should include Jan 14 data
      const hasJan14Data = filteredData.some(entry => entry.date === '2024-01-14');
      expect(hasJan14Data).toBe(true);
    });

    it('should exclude data before round start date', () => {
      const roundStartDate = '2024-01-01';
      const { startDate } = getRoundDateRange(roundStartDate);

      const preRoundData = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate < startDate;
      });

      // Should find the pre-round data
      expect(preRoundData.length).toBe(2);
      expect(preRoundData[0].date).toBe('2023-12-30');
      expect(preRoundData[1].date).toBe('2023-12-31');
    });

    it('should exclude data after round end date', () => {
      const roundStartDate = '2024-01-01';
      const { endDate } = getRoundDateRange(roundStartDate);

      const postRoundData = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate > endDate;
      });

      // Should find the post-round data
      expect(postRoundData.length).toBe(2);
      expect(postRoundData[0].date).toBe('2024-03-25');
      expect(postRoundData[1].date).toBe('2024-03-26');
    });
  });

  describe('Week Aggregation Using Round Weeks', () => {
    it('should aggregate steps by round week boundaries', () => {
      const roundStartDate = '2024-01-01';
      
      // Week 1 should be Jan 1-7
      const week1Boundaries = getRoundWeekBoundaries(roundStartDate, 1);
      const week1Data = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= week1Boundaries.startDate && entryDate <= week1Boundaries.endDate;
      });
      
      const week1Steps = week1Data.reduce((sum, entry) => sum + (entry.steps || 0), 0);
      expect(week1Steps).toBe(63500); // Sum of all steps in week 1
      
      // Week 2 should be Jan 8-14
      const week2Boundaries = getRoundWeekBoundaries(roundStartDate, 2);
      const week2Data = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= week2Boundaries.startDate && entryDate <= week2Boundaries.endDate;
      });
      
      const week2Steps = week2Data.reduce((sum, entry) => sum + (entry.steps || 0), 0);
      expect(week2Steps).toBe(60000); // Sum of all steps in week 2
    });

    it('should correctly identify week boundaries regardless of round start day', () => {
      // Start round on a Wednesday
      const roundStartDate = '2024-01-03';
      
      // Week 1 should be Jan 3-9 (Wed-Tue)
      const week1Boundaries = getRoundWeekBoundaries(roundStartDate, 1);
      
      expect(week1Boundaries.startDate.toISOString().split('T')[0]).toBe('2024-01-03');
      expect(week1Boundaries.endDate.toISOString().split('T')[0]).toBe('2024-01-09');
      
      // Filter data for this week
      const week1Data = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= week1Boundaries.startDate && entryDate <= week1Boundaries.endDate;
      });
      
      // Should include Jan 3-7 from our mock data
      const hasJan3 = week1Data.some(entry => entry.date === '2024-01-03');
      expect(hasJan3).toBe(true);
    });

    it('should return all 12 weeks of boundaries for a round', () => {
      const roundStartDate = '2024-01-01';
      const allWeeks = getAllRoundWeeks(roundStartDate);

      // Should return exactly 12 weeks
      expect(allWeeks).toHaveLength(12);
      
      // Each week should have correct structure
      allWeeks.forEach((weekData, index) => {
        expect(weekData.week).toBe(index + 1);
        expect(weekData.startDate).toBeInstanceOf(Date);
        expect(weekData.endDate).toBeInstanceOf(Date);
        expect(weekData.endDate > weekData.startDate).toBe(true);
      });
      
      // Week 1 should start on Jan 1
      expect(allWeeks[0].startDate.toISOString().split('T')[0]).toBe('2024-01-01');
      
      // Week 12 should end on Mar 24 (day 84, end of day)
      expect(allWeeks[11].endDate.toISOString().split('T')[0]).toBe('2024-03-24');
    });

    it('should calculate week-over-week aggregations correctly', () => {
      const roundStartDate = '2024-01-01';
      const allWeeks = getAllRoundWeeks(roundStartDate);

      // Calculate steps for each week
      const weeklySteps = allWeeks.map(({ week, startDate, endDate }) => {
        const weekData = mockHealthData.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
        
        const totalSteps = weekData.reduce((sum, entry) => sum + (entry.steps || 0), 0);
        
        return {
          week,
          totalSteps,
          dataPoints: weekData.length
        };
      });

      // Week 1 should have 7 data points and 63500 steps
      expect(weeklySteps[0].week).toBe(1);
      expect(weeklySteps[0].totalSteps).toBe(63500);
      expect(weeklySteps[0].dataPoints).toBe(7);
      
      // Week 2 should have 7 data points and 60000 steps
      expect(weeklySteps[1].week).toBe(2);
      expect(weeklySteps[1].totalSteps).toBe(60000);
      expect(weeklySteps[1].dataPoints).toBe(7);
      
      // Week 12 should have 6 data points (partial week in our mock data)
      expect(weeklySteps[11].week).toBe(12);
      expect(weeklySteps[11].totalSteps).toBe(64500);
      expect(weeklySteps[11].dataPoints).toBe(6);
    });

    it('should handle incomplete weeks correctly', () => {
      const roundStartDate = '2024-01-01';
      const week12Boundaries = getRoundWeekBoundaries(roundStartDate, 12);
      
      const week12Data = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= week12Boundaries.startDate && entryDate <= week12Boundaries.endDate;
      });

      // Week 12 has data but not all 7 days
      expect(week12Data.length).toBeGreaterThan(0);
      expect(week12Data.length).toBeLessThan(7);
      
      // Should still calculate correctly with available data
      const totalSteps = week12Data.reduce((sum, entry) => sum + (entry.steps || 0), 0);
      expect(totalSteps).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases with Data Outside Round Boundaries', () => {
    it('should handle round with no health data gracefully', () => {
      // Round that has no data
      const roundStartDate = '2025-01-01';
      const { startDate, endDate } = getRoundDateRange(roundStartDate);

      const filteredData = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      expect(filteredData).toEqual([]);
    });

    it('should handle partial week data at round boundaries', () => {
      const roundStartDate = '2024-01-01';
      const week12Boundaries = getRoundWeekBoundaries(roundStartDate, 12);
      
      const week12Data = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= week12Boundaries.startDate && entryDate <= week12Boundaries.endDate;
      });

      // Should still process correctly with available data
      expect(week12Data.length).toBeGreaterThan(0);
      expect(week12Data.length).toBeLessThanOrEqual(7);
      
      // All data should be within week 12 boundaries
      week12Data.forEach(entry => {
        const entryDate = new Date(entry.date);
        expect(entryDate >= week12Boundaries.startDate).toBe(true);
        expect(entryDate <= week12Boundaries.endDate).toBe(true);
      });
    });

    it('should correctly separate data by round when multiple rounds exist', () => {
      const round1Start = '2024-01-01';
      const round1Range = getRoundDateRange(round1Start);
      
      const round1Data = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= round1Range.startDate && entryDate <= round1Range.endDate;
      });

      // Round 1 should have 20 entries (7 + 7 + 6 within boundaries)
      expect(round1Data.length).toBe(20);
      
      // All entries should be within Jan 1 - Mar 23
      round1Data.forEach(entry => {
        const entryDate = new Date(entry.date);
        expect(entryDate >= new Date('2024-01-01')).toBe(true);
        expect(entryDate <= new Date('2024-03-23')).toBe(true);
      });
    });
  });

  describe('Round Boundary Consistency', () => {
    it('should maintain consistent date boundaries across utility functions', () => {
      const roundStartDate = '2024-01-01';
      
      // Get round range
      const roundRange = getRoundDateRange(roundStartDate);
      
      // Get all weeks
      const allWeeks = getAllRoundWeeks(roundStartDate);
      
      // First week start should match round start
      expect(allWeeks[0].startDate.toISOString().split('T')[0]).toBe(roundStartDate);
      expect(allWeeks[0].startDate.getTime()).toBe(roundRange.startDate.getTime());
      
      // Last week end should match round end
      expect(allWeeks[11].endDate.toISOString().split('T')[0]).toBe(
        roundRange.endDate.toISOString().split('T')[0]
      );
    });

    it('should use same date boundaries for filtering across different queries', () => {
      const roundStartDate = '2024-01-01';
      const { startDate, endDate } = getRoundDateRange(roundStartDate);

      // Filter by round range
      const dataByRoundRange = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Filter by aggregating all weeks
      const allWeeks = getAllRoundWeeks(roundStartDate);
      const dataByWeeks = mockHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return allWeeks.some(week => 
          entryDate >= week.startDate && entryDate <= week.endDate
        );
      });

      // Both methods should return the same data
      expect(dataByRoundRange.length).toBe(dataByWeeks.length);
      expect(dataByRoundRange.map(d => d.id).sort()).toEqual(
        dataByWeeks.map(d => d.id).sort()
      );
    });

    it('should handle weight data filtering consistently', () => {
      const roundStartDate = '2024-01-01';
      const { startDate, endDate } = getRoundDateRange(roundStartDate);

      const weightData = mockHealthData
        .filter(entry => entry.weight !== null)
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Should have consistent start and end weights
      expect(weightData.length).toBeGreaterThan(0);
      expect(weightData[0].weight).toBe(180.0); // First weight in round
      expect(weightData[weightData.length - 1].weight).toBe(174.0); // Last weight in round
      
      // Calculate weight change
      const weightChange = weightData[weightData.length - 1].weight - weightData[0].weight;
      expect(weightChange).toBe(-6.0); // Lost 6 lbs during round
    });
  });

  describe('Week Number Validation', () => {
    it('should handle invalid week numbers gracefully', () => {
      const roundStartDate = '2024-01-01';
      
      // Week 0 should throw
      expect(() => getRoundWeekBoundaries(roundStartDate, 0)).toThrow();
      
      // Week 13 should throw
      expect(() => getRoundWeekBoundaries(roundStartDate, 13)).toThrow();
      
      // Negative week should throw
      expect(() => getRoundWeekBoundaries(roundStartDate, -1)).toThrow();
    });

    it('should handle all valid week numbers (1-12)', () => {
      const roundStartDate = '2024-01-01';
      
      for (let week = 1; week <= 12; week++) {
        const boundaries = getRoundWeekBoundaries(roundStartDate, week);
        
        expect(boundaries.startDate).toBeInstanceOf(Date);
        expect(boundaries.endDate).toBeInstanceOf(Date);
        expect(boundaries.endDate > boundaries.startDate).toBe(true);
      }
    });
  });
});
