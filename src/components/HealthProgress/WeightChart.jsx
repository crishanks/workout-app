import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeightChart = memo(({ data, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty" role="status" aria-live="polite">
        <p>No weight data available</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    fullDate: entry.date
  }));

  // Calculate Y-axis domain with some padding
  const weights = data.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.1 || 5;
  const yMin = Math.floor(minWeight - padding);
  const yMax = Math.ceil(maxWeight + padding);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" role="tooltip">
          <p className="tooltip-date">{payload[0].payload.fullDate}</p>
          <p className="tooltip-value">{payload[0].value} lbs</p>
        </div>
      );
    }
    return null;
  };

  // Create accessible description
  const chartDescription = `Weight chart showing ${data.length} data points from ${minWeight.toFixed(1)} to ${maxWeight.toFixed(1)} pounds`;

  return (
    <div 
      className="weight-chart-container" 
      role="img" 
      aria-label={chartDescription}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            domain={[yMin, yMax]}
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
            tick={{ fill: 'var(--text-secondary)' }}
            label={{ value: 'lbs', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="var(--accent-primary)" 
            strokeWidth={2}
            dot={{ fill: 'var(--accent-primary)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
