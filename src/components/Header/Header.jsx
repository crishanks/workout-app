import './Header.css';

export const Header = ({ currentWeek, currentRound, programWeek, onRestart, canRestart }) => {
  return (
    <header className="header">
      <div className="header-top">
        <h1>💪 Shreddit</h1>
        {canRestart && (
          <button className="restart-btn" onClick={onRestart} title="Restart Round">
            ↻
          </button>
        )}
      </div>
      <div className="round-indicator">
        Round {currentRound}, Week {programWeek} of 12
      </div>
    </header>
  );
};
