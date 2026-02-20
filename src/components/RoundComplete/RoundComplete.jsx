import './RoundComplete.css';

export const RoundComplete = ({ roundNumber, stats, onStartNext }) => {
  const rating = stats.getOverallRating();
  
  return (
    <div className="app">
      <header className="header">
        <h1>💪 Shreddit</h1>
      </header>
      <main className="content">
        <div className="round-complete">
          <div className="round-complete-card">
            <h2>🎉 Round {roundNumber} Complete!</h2>
            
            <div className="final-rating">
              <div className="rating-badge" style={{ borderColor: rating.color }}>
                <span className="rating-grade" style={{ color: rating.color }}>{rating.grade}</span>
                <span className="rating-score">{rating.score}</span>
              </div>
              <p className="rating-label">Final Rating</p>
            </div>

            <div className="round-summary">
              <div className="summary-item">
                <span className="summary-label">Consistency</span>
                <span className="summary-value">{Math.round(stats.getConsistencyScore())}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Progress</span>
                <span className="summary-value">{Math.round(stats.getProgressScore())}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Streak Bonus</span>
                <span className="summary-value">{Math.round(stats.getStreakBonus())}%</span>
              </div>
            </div>

            <button className="start-next-btn" onClick={onStartNext}>
              Start Round {roundNumber + 1}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
