import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const WeeklyStepsChart = ({ data, goal = 60000, height = 250 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No steps data available</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((week, index) => ({
    week: `W${index + 1}`,
    steps: week.totalSteps,
    goalMet: week.goalMet,
    percentage: week.percentageOfGoal
  }));

  // Determine bar color based on goal achievement
  const getBarColor = (percentage) => {
    if (percentage >= 100) return 'var(--accent-success)'; // Green - goal met
    if (percentage >= 80) return 'var(--accent-warning)'; // Orange - close
    return '#ef4444'; // Red - missed
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.week}</p>
          <p className="tooltip-value">{data.steps.toLocaleString()} steps</p>
          <p className="tooltip-percentage" style={{ 
            color: getBarColor(data.percentage) 
          }}>
            {data.percentage}% of goal
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { fill, x, y, width, height, payload } = props;
    const barColor = getBarColor(payload.percentage);
    
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

  return (
    <div className="steps-chart-container">
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
};
