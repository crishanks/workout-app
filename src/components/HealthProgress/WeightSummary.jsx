import { memo } from 'react';

export const WeightSummary = memo(({ weightProgress }) => {
  if (!weightProgress || !weightProgress.currentWeight) {
    return (
      <div className="weight-summary no-data" role="status" aria-live="polite">
        <p>No weight data available. {' '}
          <span className="hint">Sync from Apple Health or add entries manually.</span>
        </p>
      </div>
    );
  }

  const { currentWeight, startWeight, totalChange, trend } = weightProgress;

  const getTrendIcon = () => {
    if (trend === 'increasing') return '↑';
    if (trend === 'decreasing') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'increasing') return 'var(--accent-warning)';
    if (trend === 'decreasing') return 'var(--accent-success)';
    return 'var(--text-secondary)';
  };

  const getTrendText = () => {
    if (trend === 'increasing') return 'increasing';
    if (trend === 'decreasing') return 'decreasing';
    return 'stable';
  };

  const changeText = totalChange > 0 ? `+${totalChange}` : totalChange;
  const summaryAriaLabel = `Weight summary: Current weight ${currentWeight} pounds${startWeight ? `, starting weight ${startWeight} pounds` : ''}${totalChange !== 0 ? `, total change ${changeText} pounds, trend ${getTrendText()}` : ''}`;

  return (
    <div className="weight-summary" role="region" aria-label={summaryAriaLabel}>
      <div className="summary-stats" role="list">
        <div className="summary-item" role="listitem">
          <span className="summary-label" id="current-weight-label">Current Weight</span>
          <span className="summary-value" aria-labelledby="current-weight-label">
            {currentWeight} lbs
          </span>
        </div>
        
        {startWeight && (
          <div className="summary-item" role="listitem">
            <span className="summary-label" id="start-weight-label">Starting Weight</span>
            <span className="summary-value" aria-labelledby="start-weight-label">
              {startWeight} lbs
            </span>
          </div>
        )}
        
        {totalChange !== 0 && (
          <div className="summary-item" role="listitem">
            <span className="summary-label" id="total-change-label">Total Change</span>
            <span 
              className="summary-value change" 
              style={{ color: getTrendColor() }}
              aria-labelledby="total-change-label"
              aria-label={`${changeText} pounds, ${getTrendText()}`}
            >
              {getTrendIcon()} {changeText} lbs
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
