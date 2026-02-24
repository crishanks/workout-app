import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRoundData } from './useRoundData';
import { useRoundManager } from './useRoundManager';

// Mock the useRoundManager hook
vi.mock('./useRoundManager');

// Mock the roundDateUtils module
vi.mock('../utils/roundDateUtils', () => ({
  getRoundWeekBoundaries: vi.fn((startDate, weekNumber) => {
    const start = new Date(startDate);
    start.setDate(start.getDate() + (weekNumber - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }),
  getRoundDateRange: vi.fn((startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 83);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }),
  getWeekNumberFromDate: vi.fn((startDate, date) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((checkDate - start) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0 || daysDiff >= 84) return null;
    return Math.floor(daysDiff / 7) + 1;
  }),
  isDateInRound: vi.fn((date, startDate, endDate) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate) {
      end.setDate(end.getDate() + 83);
    }
    end.setHours(23, 59, 59, 999);
    return checkDate >= start && checkDate <= end;
  }),
  getAllRoundWeeks: vi.fn((startDate) => {
    const weeks = [];
    for (let i = 1; i <= 12; i++) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + (i - 1) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      weeks.push({ week: i, startDate: start, endDate: end });
    }
    return weeks;
  })
}));

describe('useRoundData', () => {
  const mockRoundManager = {
    roundData: null,
    loading: false,
    startRound: vi.fn(),
    restartCurrentRound: vi.fn(),
    endRound: vi.fn(),
    getCurrentWeekInRound: vi.fn(),
    isRoundComplete: vi.fn(),
    hasActiveRound: vi.fn(),
    getCurrentRound: vi.fn(),
    canRestart: vi.fn(),
    updateRoundStartDate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRoundManager.mockReturnValue(mockRoundManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Round Context Provision', () => {
    it('should return null values when no round data exists', () => {
      mockRoundManager.roundData = null;
      mockRoundManager.loading = false;

      const { result } = renderHook(() => useRoundData());

      expect(result.current.currentRound).toBe(null);
      expect(result.current.currentWeek).toBe(null);
      expect(result.current.roundStartDate).toBe(null);
      expect(result.current.roundEndDate).toBe(null);
      expect(result.current.isActive).toBe(false);
      expect(result.current.loading).toBe(false);
    });

    it('should return loading state when data is loading', () => {
      mockRoundManager.roundData = null;
      mockRoundManager.loading = true;

      const { result } = renderHook(() => useRoundData());

      expect(result.current.loading).toBe(true);
    });

    it('should provide round context when round data exists', () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 2,
        startDate,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(5);

      const { result } = renderHook(() => useRoundData());

      expect(result.current.currentRound).toBe(2);
      expect(result.current.currentWeek).toBe(5);
      expect(result.current.roundStartDate).toBe(startDate);
      expect(result.current.isActive).toBe(true);
      expect(result.current.roundEndDate).toBeDefined();
    });

    it('should use endDate from roundData if available', () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-03-24T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 1,
        startDate,
        endDate,
        isActive: false
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(null);

      const { result } = renderHook(() => useRoundData());

      expect(result.current.roundEndDate).toBe(endDate);
    });

    it('should calculate endDate when not provided in roundData', () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 1,
        startDate,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(3);

      const { result } = renderHook(() => useRoundData());

      expect(result.current.roundEndDate).toBeDefined();
      expect(result.current.roundEndDate).not.toBe(null);
    });
  });

  describe('Date Utility Binding', () => {
    beforeEach(() => {
      const startDate = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 2,
        startDate,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(5);
    });

    it('should provide getCurrentWeekBoundaries method', () => {
      const { result } = renderHook(() => useRoundData());

      const boundaries = result.current.getCurrentWeekBoundaries();

      expect(boundaries).toBeDefined();
      expect(boundaries.startDate).toBeInstanceOf(Date);
      expect(boundaries.endDate).toBeInstanceOf(Date);
    });

    it('should return null from getCurrentWeekBoundaries when no round data', () => {
      mockRoundManager.roundData = null;

      const { result } = renderHook(() => useRoundData());

      const boundaries = result.current.getCurrentWeekBoundaries();

      expect(boundaries).toBe(null);
    });

    it('should provide getWeekBoundaries method for specific weeks', () => {
      const { result } = renderHook(() => useRoundData());

      const week3Boundaries = result.current.getWeekBoundaries(3);

      expect(week3Boundaries).toBeDefined();
      expect(week3Boundaries.startDate).toBeInstanceOf(Date);
      expect(week3Boundaries.endDate).toBeInstanceOf(Date);
    });

    it('should return null from getWeekBoundaries when no round data', () => {
      mockRoundManager.roundData = null;

      const { result } = renderHook(() => useRoundData());

      const boundaries = result.current.getWeekBoundaries(3);

      expect(boundaries).toBe(null);
    });

    it('should handle errors in getWeekBoundaries gracefully', async () => {
      const roundDateUtils = await import('../utils/roundDateUtils');
      const originalImpl = roundDateUtils.getRoundWeekBoundaries;
      
      roundDateUtils.getRoundWeekBoundaries.mockImplementationOnce(() => {
        throw new Error('Invalid week number');
      });

      const { result } = renderHook(() => useRoundData());

      const boundaries = result.current.getWeekBoundaries(13);

      expect(boundaries).toBe(null);
      
      // Restore original implementation
      roundDateUtils.getRoundWeekBoundaries.mockImplementation(originalImpl);
    });

    it('should provide getRoundBoundaries method', () => {
      const { result } = renderHook(() => useRoundData());

      const boundaries = result.current.getRoundBoundaries();

      expect(boundaries).toBeDefined();
      expect(boundaries.startDate).toBeInstanceOf(Date);
      expect(boundaries.endDate).toBeInstanceOf(Date);
    });

    it('should return null from getRoundBoundaries when no round data', () => {
      mockRoundManager.roundData = null;

      const { result } = renderHook(() => useRoundData());

      const boundaries = result.current.getRoundBoundaries();

      expect(boundaries).toBe(null);
    });

    it('should provide isDateInCurrentRound method', () => {
      const { result } = renderHook(() => useRoundData());

      const isInRound = result.current.isDateInCurrentRound('2024-01-15');

      expect(typeof isInRound).toBe('boolean');
    });

    it('should return false from isDateInCurrentRound when no round data', () => {
      mockRoundManager.roundData = null;

      const { result } = renderHook(() => useRoundData());

      const isInRound = result.current.isDateInCurrentRound('2024-01-15');

      expect(isInRound).toBe(false);
    });

    it('should provide getWeekNumberForDate method', () => {
      const { result } = renderHook(() => useRoundData());

      const weekNumber = result.current.getWeekNumberForDate('2024-01-15');

      expect(weekNumber).toBeDefined();
      expect(typeof weekNumber).toBe('number');
    });

    it('should return null from getWeekNumberForDate when no round data', () => {
      mockRoundManager.roundData = null;

      const { result } = renderHook(() => useRoundData());

      const weekNumber = result.current.getWeekNumberForDate('2024-01-15');

      expect(weekNumber).toBe(null);
    });

    it('should provide getAllWeeks method', () => {
      const { result } = renderHook(() => useRoundData());

      const weeks = result.current.getAllWeeks();

      expect(weeks).toBeDefined();
      expect(Array.isArray(weeks)).toBe(true);
      expect(weeks).toHaveLength(12);
    });

    it('should return null from getAllWeeks when no round data', () => {
      mockRoundManager.roundData = null;

      const { result } = renderHook(() => useRoundData());

      const weeks = result.current.getAllWeeks();

      expect(weeks).toBe(null);
    });
  });

  describe('Round Management Functions', () => {
    beforeEach(() => {
      const startDate = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 2,
        startDate,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(5);
    });

    it('should provide startRound method', () => {
      const { result } = renderHook(() => useRoundData());

      result.current.startRound(3);

      expect(mockRoundManager.startRound).toHaveBeenCalledWith(3);
      expect(mockRoundManager.startRound).toHaveBeenCalledTimes(1);
    });

    it('should provide endRound method', () => {
      const { result } = renderHook(() => useRoundData());

      result.current.endRound();

      expect(mockRoundManager.endRound).toHaveBeenCalled();
      expect(mockRoundManager.endRound).toHaveBeenCalledTimes(1);
    });

    it('should provide updateRoundStartDate method', () => {
      const { result } = renderHook(() => useRoundData());
      const newDate = '2024-02-01T00:00:00.000Z';

      result.current.updateRoundStartDate(newDate);

      expect(mockRoundManager.updateRoundStartDate).toHaveBeenCalledWith(newDate);
      expect(mockRoundManager.updateRoundStartDate).toHaveBeenCalledTimes(1);
    });

    it('should provide restartCurrentRound method', () => {
      const { result } = renderHook(() => useRoundData());

      result.current.restartCurrentRound();

      expect(mockRoundManager.restartCurrentRound).toHaveBeenCalled();
      expect(mockRoundManager.restartCurrentRound).toHaveBeenCalledTimes(1);
    });

    it('should provide isRoundComplete method', () => {
      mockRoundManager.isRoundComplete.mockReturnValue(false);

      const { result } = renderHook(() => useRoundData());

      const isComplete = result.current.isRoundComplete();

      expect(mockRoundManager.isRoundComplete).toHaveBeenCalled();
      expect(isComplete).toBe(false);
    });

    it('should provide hasActiveRound method', () => {
      mockRoundManager.hasActiveRound.mockReturnValue(true);

      const { result } = renderHook(() => useRoundData());

      const hasActive = result.current.hasActiveRound();

      expect(mockRoundManager.hasActiveRound).toHaveBeenCalled();
      expect(hasActive).toBe(true);
    });

    it('should provide canRestart method', () => {
      mockRoundManager.canRestart.mockReturnValue(true);

      const { result } = renderHook(() => useRoundData());

      const canRestart = result.current.canRestart();

      expect(mockRoundManager.canRestart).toHaveBeenCalled();
      expect(canRestart).toBe(true);
    });
  });

  describe('Memoization and Performance', () => {
    it('should memoize round context when roundData does not change', () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 2,
        startDate,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(5);

      const { result, rerender } = renderHook(() => useRoundData());

      const firstRender = {
        currentRound: result.current.currentRound,
        currentWeek: result.current.currentWeek,
        roundStartDate: result.current.roundStartDate
      };

      rerender();

      const secondRender = {
        currentRound: result.current.currentRound,
        currentWeek: result.current.currentWeek,
        roundStartDate: result.current.roundStartDate
      };

      expect(firstRender).toEqual(secondRender);
    });

    it('should update round context when roundData changes', () => {
      const startDate1 = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 2,
        startDate: startDate1,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(5);

      const { result, rerender } = renderHook(() => useRoundData());

      expect(result.current.currentRound).toBe(2);

      // Update mock to return different data
      const startDate2 = '2024-02-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 3,
        startDate: startDate2,
        endDate: null,
        isActive: true
      };
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(1);

      rerender();

      expect(result.current.currentRound).toBe(3);
      expect(result.current.roundStartDate).toBe(startDate2);
    });
  });

  describe('Integration with roundDateUtils', () => {
    beforeEach(() => {
      const startDate = '2024-01-01T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 1,
        startDate,
        endDate: null,
        isActive: true
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(3);
    });

    it('should correctly bind date utilities to current round context', () => {
      const { result } = renderHook(() => useRoundData());

      const weekBoundaries = result.current.getWeekBoundaries(3);
      const isInRound = result.current.isDateInCurrentRound('2024-01-15');
      const weekNumber = result.current.getWeekNumberForDate('2024-01-15');

      expect(weekBoundaries).toBeDefined();
      expect(typeof isInRound).toBe('boolean');
      expect(typeof weekNumber).toBe('number');
    });

    it('should use roundStartDate from context in date utilities', async () => {
      const { result } = renderHook(() => useRoundData());
      const roundDateUtils = await import('../utils/roundDateUtils');

      result.current.getWeekBoundaries(5);

      expect(roundDateUtils.getRoundWeekBoundaries).toHaveBeenCalledWith('2024-01-01T00:00:00.000Z', 5);
    });

    it('should handle date validation correctly', () => {
      const { result } = renderHook(() => useRoundData());

      const dateInRound = result.current.isDateInCurrentRound('2024-01-15');
      const dateOutsideRound = result.current.isDateInCurrentRound('2025-01-15');

      expect(dateInRound).toBe(true);
      expect(dateOutsideRound).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing startDate in roundData', () => {
      mockRoundManager.roundData = {
        round: 1,
        startDate: null,
        endDate: null,
        isActive: false
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(null);

      const { result } = renderHook(() => useRoundData());

      expect(result.current.currentRound).toBe(null);
      expect(result.current.roundStartDate).toBe(null);
      expect(result.current.getCurrentWeekBoundaries()).toBe(null);
    });

    it('should handle inactive rounds', () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-03-24T00:00:00.000Z';
      mockRoundManager.roundData = {
        round: 1,
        startDate,
        endDate,
        isActive: false
      };
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockReturnValue(null);

      const { result } = renderHook(() => useRoundData());

      expect(result.current.isActive).toBe(false);
      expect(result.current.currentWeek).toBe(null);
      expect(result.current.roundEndDate).toBe(endDate);
    });

    it('should handle round manager errors gracefully', () => {
      mockRoundManager.roundData = null;
      mockRoundManager.loading = false;
      mockRoundManager.getCurrentWeekInRound.mockImplementation(() => {
        throw new Error('Failed to get current week');
      });

      const { result } = renderHook(() => useRoundData());

      expect(result.current.currentRound).toBe(null);
      expect(result.current.currentWeek).toBe(null);
    });
  });
});
