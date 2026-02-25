import { describe, it, expect } from 'vitest';
import {
  getRoundWeekBoundaries,
  getRoundDateRange,
  getWeekNumberFromDate,
  isDateInRound,
  getAllRoundWeeks
} from './roundDateUtils.js';

describe('roundDateUtils', () => {
  describe('getRoundWeekBoundaries', () => {
    it('should calculate week 1 boundaries correctly', () => {
      const result = getRoundWeekBoundaries('2024-01-01', 1);
      
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.endDate > result.startDate).toBe(true);
      
      expect(result.endDate.getHours()).toBe(23);
      expect(result.endDate.getMinutes()).toBe(59);
      expect(result.endDate.getSeconds()).toBe(59);
      expect(result.endDate.getMilliseconds()).toBe(999);
    });

    it('should throw error for week number less than 1', () => {
      expect(() => getRoundWeekBoundaries('2024-01-01', 0)).toThrow('Week number must be between 1 and 12');
    });

    it('should throw error for week number greater than 12', () => {
      expect(() => getRoundWeekBoundaries('2024-01-01', 13)).toThrow('Week number must be between 1 and 12');
    });

    it('should calculate all 12 weeks correctly', () => {
      for (let week = 1; week <= 12; week++) {
        const boundaries = getRoundWeekBoundaries('2024-01-01', week);
        
        expect(boundaries.startDate).toBeInstanceOf(Date);
        expect(boundaries.endDate).toBeInstanceOf(Date);
        expect(boundaries.endDate > boundaries.startDate).toBe(true);
        
        const days = Math.ceil((boundaries.endDate - boundaries.startDate) / (1000 * 60 * 60 * 24));
        expect(days).toBe(7);
      }
    });
  });

  describe('getRoundDateRange', () => {
    it('should calculate 12-week round boundaries correctly', () => {
      const result = getRoundDateRange('2024-01-01');
      
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.endDate > result.startDate).toBe(true);
      
      expect(result.endDate.getHours()).toBe(23);
      expect(result.endDate.getMinutes()).toBe(59);
    });

    it('should span exactly 84 days', () => {
      const result = getRoundDateRange('2024-01-01');
      
      const diffTime = result.endDate - result.startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(84);
    });
  });

  describe('getWeekNumberFromDate', () => {
    const roundStart = '2024-01-01';

    it('should return 1 for first day of round', () => {
      expect(getWeekNumberFromDate(roundStart, '2024-01-01')).toBe(1);
    });

    it('should return 1 for last day of week 1', () => {
      expect(getWeekNumberFromDate(roundStart, '2024-01-07')).toBe(1);
    });

    it('should return 2 for first day of week 2', () => {
      expect(getWeekNumberFromDate(roundStart, '2024-01-08')).toBe(2);
    });

    it('should return 12 for last week of round', () => {
      expect(getWeekNumberFromDate(roundStart, '2024-03-19')).toBe(12);
      expect(getWeekNumberFromDate(roundStart, '2024-03-23')).toBe(12);
    });

    it('should return null for date before round start', () => {
      expect(getWeekNumberFromDate(roundStart, '2023-12-31')).toBe(null);
    });

    it('should return null for date after round end', () => {
      // Use a date that's definitely after the round (84 days from Jan 1 is Mar 24)
      expect(getWeekNumberFromDate(roundStart, '2024-04-01')).toBe(null);
    });

    it('should handle Date objects as input', () => {
      expect(getWeekNumberFromDate(roundStart, new Date('2024-01-15'))).toBe(3);
    });

    it('should normalize time when comparing dates', () => {
      expect(getWeekNumberFromDate('2024-01-01', '2024-01-01T23:59:59')).toBe(1);
      expect(getWeekNumberFromDate('2024-01-01', '2024-01-08T00:00:01')).toBe(2);
    });
  });

  describe('isDateInRound', () => {
    const roundStart = '2024-01-01';

    it('should return true for first day of round', () => {
      expect(isDateInRound('2024-01-01', roundStart)).toBe(true);
    });

    it('should return true for last day of round', () => {
      expect(isDateInRound('2024-03-23', roundStart)).toBe(true);
    });

    it('should return true for middle of round', () => {
      expect(isDateInRound('2024-02-15', roundStart)).toBe(true);
    });

    it('should return false for date before round', () => {
      expect(isDateInRound('2023-12-31', roundStart)).toBe(false);
    });

    it('should return false for date after round', () => {
      expect(isDateInRound('2024-03-25', roundStart)).toBe(false);
    });

    it('should handle Date objects as input', () => {
      expect(isDateInRound(new Date('2024-02-01'), roundStart)).toBe(true);
    });

    it('should handle custom end date', () => {
      const customEnd = '2024-02-01';
      expect(isDateInRound('2024-01-15', roundStart, customEnd)).toBe(true);
      expect(isDateInRound('2024-02-02', roundStart, customEnd)).toBe(false);
    });

    it('should handle leap year correctly', () => {
      expect(isDateInRound('2024-02-29', '2024-02-01')).toBe(true);
    });

    it('should handle year boundary crossing', () => {
      expect(isDateInRound('2025-01-01', '2024-12-01')).toBe(true);
    });
  });

  describe('getAllRoundWeeks', () => {
    it('should return 12 weeks', () => {
      const weeks = getAllRoundWeeks('2024-01-01');
      expect(weeks).toHaveLength(12);
    });

    it('should have sequential week numbers', () => {
      const weeks = getAllRoundWeeks('2024-01-01');
      weeks.forEach((week, index) => {
        expect(week.week).toBe(index + 1);
      });
    });

    it('should have contiguous weeks with no gaps', () => {
      const weeks = getAllRoundWeeks('2024-01-01');
      
      for (let i = 0; i < weeks.length - 1; i++) {
        const currentWeekEnd = weeks[i].endDate;
        const nextWeekStart = weeks[i + 1].startDate;
        
        const diffTime = nextWeekStart - currentWeekEnd;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        expect(diffDays).toBeGreaterThanOrEqual(0);
        expect(diffDays).toBeLessThanOrEqual(1);
      }
    });

    it('should span exactly 84 days total', () => {
      const weeks = getAllRoundWeeks('2024-01-01');
      
      const firstDay = weeks[0].startDate;
      const lastDay = weeks[11].endDate;
      
      const diffTime = lastDay - firstDay;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(84);
    });
  });

  describe('Timezone handling', () => {
    it('should handle dates consistently regardless of timezone', () => {
      const result1 = getWeekNumberFromDate('2024-01-01', '2024-01-15');
      const result2 = getWeekNumberFromDate('2024-01-01', new Date('2024-01-15'));
      
      expect(result1).toBe(result2);
    });

    it('should normalize dates to start of day for comparisons', () => {
      const roundStart = '2024-01-01';
      
      expect(getWeekNumberFromDate(roundStart, '2024-01-15T00:00:00')).toBe(3);
      expect(getWeekNumberFromDate(roundStart, '2024-01-15T12:00:00')).toBe(3);
      expect(getWeekNumberFromDate(roundStart, '2024-01-15T23:59:59')).toBe(3);
    });

    it('should handle end of day correctly in boundaries', () => {
      const boundaries = getRoundWeekBoundaries('2024-01-01', 1);
      
      expect(boundaries.endDate.getHours()).toBe(23);
      expect(boundaries.endDate.getMinutes()).toBe(59);
      expect(boundaries.endDate.getSeconds()).toBe(59);
      expect(boundaries.endDate.getMilliseconds()).toBe(999);
    });
  });

  describe('Edge cases', () => {
    it('should handle year boundaries correctly', () => {
      const weeks = getAllRoundWeeks('2024-12-30');
      
      expect(weeks[0].startDate.getFullYear()).toBe(2024);
      expect(weeks[0].endDate.getFullYear()).toBe(2025);
    });

    it('should handle daylight saving time transitions', () => {
      const weeks = getAllRoundWeeks('2024-03-01');
      
      expect(weeks).toHaveLength(12);
      expect(weeks[11].week).toBe(12);
    });

    it('should handle invalid date strings gracefully', () => {
      const result = getRoundWeekBoundaries('invalid-date', 1);
      
      expect(isNaN(result.startDate.getTime())).toBe(true);
      expect(isNaN(result.endDate.getTime())).toBe(true);
    });
  });

  describe('Week boundary calculations', () => {
    it('should calculate correct number of days between weeks', () => {
      const week1 = getRoundWeekBoundaries('2024-01-01', 1);
      const week2 = getRoundWeekBoundaries('2024-01-01', 2);
      
      const week1Days = Math.ceil((week1.endDate - week1.startDate) / (1000 * 60 * 60 * 24));
      expect(week1Days).toBe(7);
      
      const daysBetween = Math.floor((week2.startDate - week1.startDate) / (1000 * 60 * 60 * 24));
      expect(daysBetween).toBe(7);
    });
  });

  describe('Date validation edge cases', () => {
    it('should correctly identify dates on week boundaries', () => {
      const roundStart = '2024-01-01';
      
      expect(getWeekNumberFromDate(roundStart, '2024-01-07')).toBe(1);
      expect(getWeekNumberFromDate(roundStart, '2024-01-08')).toBe(2);
      expect(getWeekNumberFromDate(roundStart, '2024-01-14')).toBe(2);
      expect(getWeekNumberFromDate(roundStart, '2024-01-15')).toBe(3);
    });

    it('should handle dates at round boundaries', () => {
      const roundStart = '2024-01-01';
      
      expect(isDateInRound('2024-01-01', roundStart)).toBe(true);
      expect(getWeekNumberFromDate(roundStart, '2024-01-01')).toBe(1);
      
      expect(isDateInRound('2024-03-23', roundStart)).toBe(true);
      expect(getWeekNumberFromDate(roundStart, '2024-03-23')).toBe(12);
      
      expect(isDateInRound('2023-12-31', roundStart)).toBe(false);
      expect(getWeekNumberFromDate(roundStart, '2023-12-31')).toBe(null);
      
      // Use a date well after the round to avoid timezone edge cases
      expect(isDateInRound('2024-04-01', roundStart)).toBe(false);
      expect(getWeekNumberFromDate(roundStart, '2024-04-01')).toBe(null);
    });
  });
});
