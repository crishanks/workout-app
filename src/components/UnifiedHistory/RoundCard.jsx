import './RoundCard.css';

const RoundCard = ({ round, stats, healthSummary, isActive }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${Math.round(value)}%`;
  };

  const formatWeightChange = (change) => {
    if (change === null || change === undefined) return null;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} lbs`;
  };

  const formatSteps = (steps) => {
    if (steps === null || steps === undefined) return 'N/A';
    return steps.toLocaleString();
  };

  const formatGoalsMet = (goalsMet) => {
    if (goalsMet === null || goalsMet === undefined) return 'N/A';
    return `${goalsMet}/12`;
  };

  return (
    <article className="round-card" aria-labelledby={`round-${round.round}-heading`}>
      {/* Round header with number and active badge */}
      <header className="round-card-header">
        <h2 id={`round-${round.round}-heading`} className="round-number">Round {round.round}</h2>
        {isActive && <span className="active-badge" aria-label="Currently in progress">In Progress</span>}
      </header>

      {/* Rating badge with grade, score, and color coding */}
      <div 
        className={`rating-badge grade-${stats.rating.grade.toLowerCase()}`}
        role="img"
        aria-label={`Grade ${stats.rating.grade} with score ${stats.rating.score}`}
      >
        <div className="rating-grade">
          {stats.rating.grade}
        </div>
        <div className="rating-score">{stats.rating.score}</div>
      </div>

      {/* Start and end dates */}
      <section className="round-dates" aria-label="Round dates">
        <div className="date-item">
          <span className="date-label">Started:</span>
          <span className="date-value">{formatDate(round.startDate)}</span>
        </div>
        {round.endDate && (
          <div className="date-item">
            <span className="date-label">Ended:</span>
            <span className="date-value">{formatDate(round.endDate)}</span>
          </div>
        )}
      </section>

      {/* Stats grid for consistency, progress, streak, and step goals */}
      <section className="stats-grid" aria-label="Performance statistics">
        <div className="stat-item">
          <div className="stat-label">Consistency</div>
          <div className="stat-value">{formatPercentage(stats.consistency)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Progress</div>
          <div className="stat-value">{formatPercentage(stats.progress)}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Streak</div>
          <div className="stat-value">{stats.streakCount} {stats.streakCount === 1 ? 'day' : 'days'}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Step Goals</div>
          <div className="stat-value">{formatPercentage(stats.stepGoal)}</div>
        </div>
      </section>

      {/* Total workout count */}
      <div className="workout-count">
        <span className="workout-count-label">Total Workouts:</span>
        <span className="workout-count-value">{round.sessionCount}</span>
      </div>

      {/* Health metrics summary */}
      <section className="health-summary" aria-label="Health metrics summary">
        <h3 className="health-summary-title">Health Metrics</h3>
        <div className="health-summary-grid">
          <div className="health-metric">
            <div className="health-metric-label">Total Steps</div>
            <div className="health-metric-value">
              {healthSummary.totalSteps !== null 
                ? formatSteps(healthSummary.totalSteps)
                : 'No data'}
            </div>
          </div>
          <div className="health-metric">
            <div className="health-metric-label">Weekly Goals Met</div>
            <div className="health-metric-value">
              {healthSummary.weeklyStepGoalsMet !== null ? (
                <span className="goals-met-indicator">
                  {formatGoalsMet(healthSummary.weeklyStepGoalsMet)}
                  {healthSummary.weeklyStepGoalsMet >= 10 && (
                    <span className="goal-badge excellent" aria-label="Excellent performance">🏆</span>
                  )}
                  {healthSummary.weeklyStepGoalsMet >= 8 && healthSummary.weeklyStepGoalsMet < 10 && (
                    <span className="goal-badge good" aria-label="Good performance">⭐</span>
                  )}
                </span>
              ) : (
                'No data'
              )}
            </div>
          </div>
          <div className="health-metric">
            <div className="health-metric-label">Weight Change</div>
            <div className="health-metric-value">
              {healthSummary.weightChange !== null ? (
                <span 
                  className={`weight-change ${
                    healthSummary.weightChange < 0 ? 'weight-loss' : 
                    healthSummary.weightChange > 0 ? 'weight-gain' : 
                    'weight-neutral'
                  }`}
                >
                  {formatWeightChange(healthSummary.weightChange)}
                </span>
              ) : (
                'No data'
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
};

export default RoundCard;
