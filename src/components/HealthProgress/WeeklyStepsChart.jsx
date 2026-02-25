import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const WeeklyStepsChart = memo(({ data, currentWeek, goal = 60000, height = 250 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty" role="status" aria-live="polite">
        <p>No steps data available</p>
      </div>
    );
  }

  // Format data for Recharts - data is already in round week format
  const chartData = data.map((weekData) => ({
    week: `W${weekData.week}`,
    weekNumber: weekData.week,
    steps: weekData.steps.total,
    goalMet: weekData.steps.goalMet,
    percentage: weekData.steps.percentageOfGoal,
    isCurrentWeek: weekData.week === currentWeek,
    isWeekComplete: weekData.steps.isWeekComplete,
    daysElapsed: weekData.steps.daysElapsed,
    expectedSteps: weekData.steps.expectedSteps
  }));

  // Determine bar color based on goal achievement
  const getBarColor = (percentage, isCurrentWeek) => {
    if (isCurrentWeek) return 'var(--accent-primary)'; // Blue - current week
    if (percentage >= 100) return 'var(--accent-success)'; // Green - goal met
    if (percentage >= 80) return 'var(--accent-warning)'; // Orange - close
    return '#ef4444'; // Red - missed
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" role="tooltip">
          <p className="tooltip-label">Week {data.weekNumber}</p>
          <p className="tooltip-value">{data.steps.toLocaleString()} steps</p>
          <p className="tooltip-percentage" style={{ 
            color: getBarColor(data.percentage, data.isCurrentWeek) 
          }}>
            {data.percentage}% of goal
          </p>
          {data.isCurrentWeek && (
            <p className="tooltip-current" style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Current Week {!data.isWeekComplete && `(${data.daysElapsed}/7 days)`}
            </p>
          )}
          {!data.isWeekComplete && data.isCurrentWeek && (
            <p className="tooltip-expected" style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
              Expected: {data.expectedSteps.toLocaleString()} steps
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { x, y, width, height, payload } = props;
    const barColor = getBarColor(payload.percentage, payload.isCurrentWeek);
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={barColor}
        rx={4}
      />
    );
  };

  // Create accessible description
  const weeksMetGoal = data.filter(w => w.steps.goalMet).length;
  const chartDescription = `Weekly steps chart showing ${data.length} weeks. ${weeksMetGoal} out of ${data.length} weeks met the 60,000 step goal. Currently on week ${currentWeek}.`;

  return (
    <div 
      className="steps-chart-container" 
      role="img" 
      aria-label={chartDescription}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="week" 
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: 'var(--text-secondary)' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={goal} 
            stroke="var(--accent-primary)" 
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ 
              value: '60k Goal', 
              position: 'right',
              fill: 'var(--accent-primary)',
              fontSize: '0.75rem'
            }}
          />
          <Bar 
            dataKey="steps" 
            shape={<CustomBar />}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
