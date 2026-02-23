import './Stats.css';

export const Stats = ({ stats, onBack }) => {
  const rating = stats.getOverallRating();
  const prs = stats.getExercisePRs();
  const weeklyConsistency = stats.getWeeklyConsistency();
  const consistency = Math.round(stats.getConsistencyScore());
  const progress = Math.round(stats.getProgressScore());
  const streak = Math.round(stats.getStreakBonus());
  const stepGoal = stats.getStepGoalScore();

  const hasData = rating.score > 0;

  return (
    <div className="app">
      <header className="header">
        <h1>Shreddit</h1>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </header>
      <main className="content">
        <div className="stats-container">
          {!hasData ? (
            <div className="no-data-message">
              <p>No workout data yet. Start logging to see your stats!</p>
            </div>
          ) : (
            <>
              <div className="rating-card">
                <div className="rating-badge" style={{ borderColor: rating.color }}>
                  <span className="rating-grade" style={{ color: rating.color }}>{rating.grade}</span>
                  <span className="rating-score">{rating.score}</span>
                </div>
                <div className="rating-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-label">Consistency</span>
                    <span className="breakdown-value">{consistency}%</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Progress</span>
                    <span className="breakdown-value">{progress}%</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-label">Streak</span>
                    <span className="breakdown-value">{streak}%</span>
                  </div>
                  {stepGoal !== null && (
                    <div className="breakdown-item">
                      <span className="breakdown-label">Step Goals</span>
                      <span className="breakdown-value">{Math.round(stepGoal)}%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="stats-section">
                <h3>Weekly Consistency</h3>
                {weeklyConsistency.length === 0 ? (
                  <p className="no-data">No weekly data yet</p>
                ) : (
                  <div className="consistency-grid">
                    {weeklyConsistency.map(([key, data]) => (
                      <div key={key} className="consistency-week">
                        <span className="week-label">R{data.round} W{data.week}</span>
                        <div className="workout-dots">
                          {[...Array(5)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`workout-dot ${i < data.count ? 'completed' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="stats-section">
                <h3>Top 10 PRs</h3>
                {prs.length === 0 ? (
                  <p className="no-data">No PRs yet - start logging workouts!</p>
                ) : (
                  <div className="prs-list">
                    {prs.map(([name, data], idx) => (
                      <div key={idx} className="pr-item">
                        <div className="pr-rank">{idx + 1}</div>
                        <div className="pr-info">
                          <strong>{name}</strong>
                          <span className="pr-stats">
                            {data.weight}lbs × {data.reps} = {Math.round(data.volume)} total
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
