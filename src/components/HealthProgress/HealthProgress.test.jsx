import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthProgress } from './HealthProgress';
import { useHealthData } from '../../hooks/useHealthData';
import { useRoundData } from '../../hooks/useRoundData';

// Mock the hooks
vi.mock('../../hooks/useHealthData');
vi.mock('../../hooks/useRoundData');

// Mock child components to simplify testing
vi.mock('./RoundContextHeader', () => ({
  RoundContextHeader: ({ round, week, loading }) => (
    <div data-testid="round-context-header">
      {loading ? 'Loading...' : round && week ? `Round ${round}, Week ${week} of 12` : 'No active round'}
    </div>
  )
}));

vi.mock('./WeeklyStepsChart', () => ({
  WeeklyStepsChart: ({ data, currentWeek }) => (
    <div data-testid="weekly-steps-chart">
      {data && data.length > 0 ? (
        <div>
          <div data-testid="chart-weeks">{data.length} weeks</div>
          <div data-testid="current-week">Current: Week {currentWeek}</div>
          {data.map((week) => (
            <div key={week.week} data-testid={`week-${week.week}`}>
              W{week.week}: {week.steps.total} steps
            </div>
          ))}
        </div>
      ) : (
        <div>No steps data</div>
      )}
    </div>
  )
}));

vi.mock('./CurrentWeekSteps', () => ({
  CurrentWeekSteps: ({ stepsData, weekNumber, weekBoundaries }) => (
    <div data-testid="current-week-steps">
      <div data-testid="week-number">Week {weekNumber}</div>
      <div data-testid="week-total">{stepsData.total} steps</div>
      <div data-testid="week-boundaries">
        {new Date(weekBoundaries.startDate).toLocaleDateString()} - {new Date(weekBoundaries.endDate).toLocaleDateString()}
      </div>
    </div>
  )
}));

vi.mock('./WeightChart', () => ({
  WeightChart: ({ data, roundStartDate, roundEndDate }) => (
    <div data-testid="weight-chart">
      {data && data.length > 0 ? (
        <div>
          <div data-testid="weight-entries">{data.length} entries</div>
          <div data-testid="round-dates">
            {new Date(roundStartDate).toLocaleDateString()} - {new Date(roundEndDate).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div>No weight data</div>
      )}
    </div>
  )
}));

vi.mock('./WeightSummary', () => ({
  WeightSummary: ({ weightProgress }) => (
    <div data-testid="weight-summary">
      Change: {weightProgress.totalChange} lbs
    </div>
  )
}));

vi.mock('./ManualEntryForm', () => ({
  ManualEntryForm: () => <div data-testid="manual-entry-form">Manual Entry Form</div>
}));

describe('HealthProgress Integration Tests - Round Context', () => {
  const mockOnBack = vi.fn();

  const defaultHealthDataMock = {
    healthData: [],
    loading: false,
    error: null,
    syncFromAppleHealth: vi.fn(),
    addManualEntry: vi.fn(),
    hasPermissions: true,
    requestPermissions: vi.fn(),
    isIOS: true,
    getRoundHealthMetrics: vi.fn(() => []),
    getCurrentWeekHealthData: vi.fn(() => null),
    getWeightProgressForRound: vi.fn(() => ({
      entries: [],
      currentWeight: null,
      startWeight: null,
      totalChange: 0,
      trend: 'stable'
    }))
  };

  const defaultRoundDataMock = {
    currentRound: null,
    currentWeek: null,
    roundStartDate: null,
    roundEndDate: null,
    isActive: false,
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useHealthData.mockReturnValue(defaultHealthDataMock);
    useRoundData.mockReturnValue(defaultRoundDataMock);
  });

  describe('Component Renders with Round Context', () => {
    it('should render with active round context', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 2,
        currentWeek: 5,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }]
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify round context header is rendered
      expect(screen.getByTestId('round-context-header')).toBeInTheDocument();
      expect(screen.getByText('Round 2, Week 5 of 12')).toBeInTheDocument();
    });

    it('should show loading state when round data is loading', () => {
      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        loading: true
      });

      render(<HealthProgress onBack={mockOnBack} />);

      expect(screen.getByTestId('round-context-header')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show no active round message when round is not active', () => {
      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: null,
        currentWeek: null,
        isActive: false,
        loading: false
      });

      render(<HealthProgress onBack={mockOnBack} />);

      expect(screen.getByTestId('round-context-header')).toBeInTheDocument();
      expect(screen.getByText('No active round')).toBeInTheDocument();
    });

    it('should render all main sections when round is active and has data', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const mockRoundHealthMetrics = [
        { week: 1, steps: { total: 50000, goalMet: false, percentageOfGoal: 83, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } },
        { week: 2, steps: { total: 65000, goalMet: true, percentageOfGoal: 108, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } }
      ];

      const mockCurrentWeekData = {
        week: 2,
        startDate: '2024-01-08T00:00:00.000Z',
        endDate: '2024-01-14T23:59:59.999Z',
        steps: {
          total: 65000,
          goalMet: true,
          percentageOfGoal: 108,
          dailySteps: [
            { date: '2024-01-08', steps: 9000 },
            { date: '2024-01-09', steps: 10000 }
          ]
        }
      };

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 2,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [
          { id: '1', date: '2024-01-08', steps: 9000, weight: 180 },
          { id: '2', date: '2024-01-09', steps: 10000, weight: 179 }
        ],
        getRoundHealthMetrics: vi.fn(() => mockRoundHealthMetrics),
        getCurrentWeekHealthData: vi.fn(() => mockCurrentWeekData),
        getWeightProgressForRound: vi.fn(() => ({
          entries: [
            { date: '2024-01-08', weight: 180 },
            { date: '2024-01-09', weight: 179 }
          ],
          currentWeight: 179,
          startWeight: 180,
          totalChange: -1,
          trend: 'down'
        }))
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify all main sections are present
      expect(screen.getByTestId('round-context-header')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-steps-chart')).toBeInTheDocument();
      expect(screen.getByTestId('current-week-steps')).toBeInTheDocument();
      expect(screen.getByTestId('weight-chart')).toBeInTheDocument();
      expect(screen.getByTestId('weight-summary')).toBeInTheDocument();
    });
  });

  describe('Week Labels Display Correctly', () => {
    it('should display week labels as "W1", "W2", etc. in WeeklyStepsChart', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const mockRoundHealthMetrics = [
        { week: 1, steps: { total: 50000, goalMet: false, percentageOfGoal: 83, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } },
        { week: 2, steps: { total: 65000, goalMet: true, percentageOfGoal: 108, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } },
        { week: 3, steps: { total: 70000, goalMet: true, percentageOfGoal: 117, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } }
      ];

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 3,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }],
        getRoundHealthMetrics: vi.fn(() => mockRoundHealthMetrics)
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify week labels are displayed
      expect(screen.getByTestId('week-1')).toHaveTextContent('W1: 50000 steps');
      expect(screen.getByTestId('week-2')).toHaveTextContent('W2: 65000 steps');
      expect(screen.getByTestId('week-3')).toHaveTextContent('W3: 70000 steps');
    });

    it('should display all 12 weeks when full round data is available', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const mockRoundHealthMetrics = Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        steps: {
          total: 60000 + (i * 1000),
          goalMet: true,
          percentageOfGoal: 100 + Math.floor(i * 1.67),
          isWeekComplete: true,
          daysElapsed: 7,
          expectedSteps: 60000
        }
      }));

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 12,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }],
        getRoundHealthMetrics: vi.fn(() => mockRoundHealthMetrics)
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify 12 weeks are displayed
      expect(screen.getByTestId('chart-weeks')).toHaveTextContent('12 weeks');
      
      // Verify first and last week
      expect(screen.getByTestId('week-1')).toBeInTheDocument();
      expect(screen.getByTestId('week-12')).toBeInTheDocument();
    });

    it('should highlight current week in WeeklyStepsChart', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const mockRoundHealthMetrics = [
        { week: 1, steps: { total: 50000, goalMet: false, percentageOfGoal: 83, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } },
        { week: 2, steps: { total: 65000, goalMet: true, percentageOfGoal: 108, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } },
        { week: 3, steps: { total: 70000, goalMet: true, percentageOfGoal: 117, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } }
      ];

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 2,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }],
        getRoundHealthMetrics: vi.fn(() => mockRoundHealthMetrics)
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify current week is indicated
      expect(screen.getByTestId('current-week')).toHaveTextContent('Current: Week 2');
    });

    it('should display week number in CurrentWeekSteps component', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const mockCurrentWeekData = {
        week: 5,
        startDate: '2024-01-29T00:00:00.000Z',
        endDate: '2024-02-04T23:59:59.999Z',
        steps: {
          total: 45000,
          goalMet: false,
          percentageOfGoal: 75,
          dailySteps: [
            { date: '2024-01-29', steps: 8000 },
            { date: '2024-01-30', steps: 9000 }
          ]
        }
      };

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 5,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-29', steps: 8000, weight: 180 }],
        getCurrentWeekHealthData: vi.fn(() => mockCurrentWeekData)
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify week number is displayed
      expect(screen.getByTestId('week-number')).toHaveTextContent('Week 5');
    });
  });

  describe('Data Filtering by Round', () => {
    it('should filter health metrics to current round boundaries', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const getRoundHealthMetricsMock = vi.fn(() => [
        { week: 1, steps: { total: 50000, goalMet: false, percentageOfGoal: 83, isWeekComplete: true, daysElapsed: 7, expectedSteps: 60000 } }
      ]);

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 1,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-05', steps: 10000, weight: 180 }],
        getRoundHealthMetrics: getRoundHealthMetricsMock
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify getRoundHealthMetrics was called with correct round start date
      expect(getRoundHealthMetricsMock).toHaveBeenCalledWith(roundStartDate);
    });

    it('should filter weight data to current round boundaries', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const getWeightProgressForRoundMock = vi.fn(() => ({
        entries: [
          { date: '2024-01-01', weight: 180 },
          { date: '2024-02-01', weight: 175 },
          { date: '2024-03-01', weight: 170 }
        ],
        currentWeight: 170,
        startWeight: 180,
        totalChange: -10,
        trend: 'down'
      }));

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 8,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [
          { id: '1', date: '2024-01-01', steps: 10000, weight: 180 },
          { id: '2', date: '2024-02-01', steps: 10000, weight: 175 },
          { id: '3', date: '2024-03-01', steps: 10000, weight: 170 }
        ],
        getWeightProgressForRound: getWeightProgressForRoundMock
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify getWeightProgressForRound was called with correct round boundaries
      expect(getWeightProgressForRoundMock).toHaveBeenCalledWith(roundStartDate, roundEndDate);
      
      // Verify weight chart receives filtered data
      expect(screen.getByTestId('weight-entries')).toHaveTextContent('3 entries');
    });

    it('should filter current week data to round week boundaries', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const getCurrentWeekHealthDataMock = vi.fn(() => ({
        week: 3,
        startDate: '2024-01-14T00:00:00.000Z',
        endDate: '2024-01-21T23:59:59.999Z',
        steps: {
          total: 55000,
          goalMet: false,
          percentageOfGoal: 92,
          dailySteps: [
            { date: '2024-01-15', steps: 8000 },
            { date: '2024-01-16', steps: 9000 },
            { date: '2024-01-17', steps: 7500 }
          ]
        }
      }));

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 3,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 8000, weight: 180 }],
        getCurrentWeekHealthData: getCurrentWeekHealthDataMock
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify getCurrentWeekHealthData was called with correct parameters
      expect(getCurrentWeekHealthDataMock).toHaveBeenCalledWith(3, roundStartDate);
      
      // Verify current week component displays correct boundaries (account for timezone)
      const boundariesText = screen.getByTestId('week-boundaries').textContent;
      expect(boundariesText).toMatch(/1\/13\/2024|1\/14\/2024/); // Start date
      expect(boundariesText).toContain('1/21/2024'); // End date
    });

    it('should not display health data when round is not active', () => {
      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: null,
        currentWeek: null,
        isActive: false,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }]
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify no data prompt is shown (use more specific selector)
      expect(screen.getByRole('region', { name: /no active round/i })).toBeInTheDocument();
      
      // Verify charts are not rendered
      expect(screen.queryByTestId('weekly-steps-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('weight-chart')).not.toBeInTheDocument();
    });

    it('should handle empty health data gracefully when round is active', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 1,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [],
        getRoundHealthMetrics: vi.fn(() => []),
        getCurrentWeekHealthData: vi.fn(() => null),
        getWeightProgressForRound: vi.fn(() => ({
          entries: [],
          currentWeight: null,
          startWeight: null,
          totalChange: 0,
          trend: 'stable'
        }))
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify no data prompt is shown
      expect(screen.getByText(/No Health Data/i)).toBeInTheDocument();
    });

    it('should pass round dates to WeightChart component', () => {
      const roundStartDate = '2024-01-01T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 5,
        roundStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }],
        getWeightProgressForRound: vi.fn(() => ({
          entries: [{ date: '2024-01-15', weight: 180 }],
          currentWeight: 180,
          startWeight: 180,
          totalChange: 0,
          trend: 'stable'
        }))
      });

      render(<HealthProgress onBack={mockOnBack} />);

      // Verify weight chart receives round dates (account for timezone differences)
      const roundDatesText = screen.getByTestId('round-dates').textContent;
      expect(roundDatesText).toMatch(/12\/31\/2023|1\/1\/2024/); // Start date
      expect(roundDatesText).toContain('3/24/2024'); // End date
    });
  });

  describe('Round Context Updates', () => {
    it('should update displayed data when round context changes', async () => {
      const { rerender } = render(<HealthProgress onBack={mockOnBack} />);

      // Initial state - Round 1
      const round1StartDate = '2024-01-01T00:00:00.000Z';
      const round1EndDate = '2024-03-24T23:59:59.999Z';

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 5,
        roundStartDate: round1StartDate,
        roundEndDate: round1EndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [{ id: '1', date: '2024-01-15', steps: 10000, weight: 180 }]
      });

      rerender(<HealthProgress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Round 1, Week 5 of 12')).toBeInTheDocument();
      });

      // Update to Round 2
      const round2StartDate = '2024-04-01T00:00:00.000Z';
      const round2EndDate = '2024-06-23T23:59:59.999Z';

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 2,
        currentWeek: 3,
        roundStartDate: round2StartDate,
        roundEndDate: round2EndDate,
        isActive: true,
        loading: false
      });

      rerender(<HealthProgress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('Round 2, Week 3 of 12')).toBeInTheDocument();
      });
    });

    it('should recalculate metrics when round start date changes', () => {
      const initialStartDate = '2024-01-01T00:00:00.000Z';
      const updatedStartDate = '2024-01-08T00:00:00.000Z';
      const roundEndDate = '2024-03-24T23:59:59.999Z';

      const getRoundHealthMetricsMock = vi.fn(() => []);
      const getCurrentWeekHealthDataMock = vi.fn(() => null);
      const getWeightProgressForRoundMock = vi.fn(() => ({
        entries: [],
        currentWeight: null,
        startWeight: null,
        totalChange: 0,
        trend: 'stable'
      }));

      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 1,
        roundStartDate: initialStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      useHealthData.mockReturnValue({
        ...defaultHealthDataMock,
        healthData: [],
        getRoundHealthMetrics: getRoundHealthMetricsMock,
        getCurrentWeekHealthData: getCurrentWeekHealthDataMock,
        getWeightProgressForRound: getWeightProgressForRoundMock
      });

      const { rerender } = render(<HealthProgress onBack={mockOnBack} />);

      // Verify initial calls
      expect(getRoundHealthMetricsMock).toHaveBeenCalledWith(initialStartDate);

      // Update round start date
      useRoundData.mockReturnValue({
        ...defaultRoundDataMock,
        currentRound: 1,
        currentWeek: 1,
        roundStartDate: updatedStartDate,
        roundEndDate,
        isActive: true,
        loading: false
      });

      rerender(<HealthProgress onBack={mockOnBack} />);

      // Verify metrics are recalculated with new start date
      expect(getRoundHealthMetricsMock).toHaveBeenCalledWith(updatedStartDate);
    });
  });
});
