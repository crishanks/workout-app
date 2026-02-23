export const WeightSummary = ({ weightProgress }) => {
  if (!weightProgress || !weightProgress.currentWeight) {
    return (
      <div className="weight-summary no-data">
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

  const changeText = totalChange > 0 ? `+${totalChange}` : totalChange;

  return (
    <div className="weight-summary">
      <div className="summary-stats">
        <div className="summary-item">
          <span className="summary-label">Current Weight</span>
          <span className="summary-value">{currentWeight} lbs</span>
        </div>
        
        {startWeight && (
          <div className="summary-item">
            <span className="summary-label">Starting Weight</span>
            <span className="summary-value">{startWeight} lbs</span>
          </div>
        )}
        
        {totalChange !== 0 && (
          <div className="summary-item">
            <span className="summary-label">Total Change</span>
            <span 
              className="summary-value change" 
              style={{ color: getTrendColor() }}
            >
              {getTrendIcon()} {changeText} lbs
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
