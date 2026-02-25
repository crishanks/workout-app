import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeightChart = memo(({ data, roundStartDate, roundEndDate, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty" role="status" aria-live="polite">
        <p>No weight data available for this round</p>
      </div>
    );
  }

  // Calculate days from round start for each entry
  const chartData = useMemo(() => {
    if (!roundStartDate) {
      // Fallback to absolute dates if no round context
      return data.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: entry.weight,
        fullDate: entry.date,
        dayLabel: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    }

    const roundStart = new Date(roundStartDate);
    roundStart.setHours(0, 0, 0, 0);

    return data.map(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      // Calculate days from round start (1-based)
      const daysSinceStart = Math.floor((entryDate - roundStart) / (1000 * 60 * 60 * 24)) + 1;
      
      return {
        date: `Day ${daysSinceStart}`,
        weight: entry.weight,
        fullDate: entry.date,
        dayLabel: `Day ${daysSinceStart}`,
        absoluteDate: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }, [data, roundStartDate]);

  // Calculate Y-axis domain with some padding
  const weights = data.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = (maxWeight - minWeight) * 0.1 || 5;
  const yMin = Math.floor(minWeight - padding);
  const yMax = Math.ceil(maxWeight + padding);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="custom-tooltip" role="tooltip">
          <p className="tooltip-date">{entry.dayLabel}</p>
          {entry.absoluteDate && <p className="tooltip-absolute-date">{entry.absoluteDate}</p>}
          <p className="tooltip-value">{payload[0].value} lbs</p>
        </div>
      );
    }
    return null;
  };

  // Create round context subtitle
  const roundContextSubtitle = useMemo(() => {
    if (!roundStartDate) return null;
    
    const startDateFormatted = new Date(roundStartDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    if (roundEndDate) {
      const endDateFormatted = new Date(roundEndDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${startDateFormatted} - ${endDateFormatted}`;
    }
    
    return `Started ${startDateFormatted}`;
  }, [roundStartDate, roundEndDate]);

  // Create accessible description
  const chartDescription = useMemo(() => {
    const roundContext = roundStartDate 
      ? ` for current round (${new Date(roundStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${roundEndDate ? new Date(roundEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ongoing'})`
      : '';
    return `Weight chart${roundContext} showing ${data.length} data points from ${minWeight.toFixed(1)} to ${maxWeight.toFixed(1)} pounds`;
  }, [roundStartDate, roundEndDate, data.length, minWeight, maxWeight]);

  return (
    <div 
      className="weight-chart-container" 
      role="img" 
      aria-label={chartDescription}
    >
      {roundContextSubtitle && (
        <div className="chart-subtitle" aria-hidden="true">
          {roundContextSubtitle}
        </div>
      )}
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
