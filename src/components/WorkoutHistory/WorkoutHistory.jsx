import './WorkoutHistory.css';

export const WorkoutHistory = ({ dayName, rounds, selectedRound, onRoundSelect, onBack }) => {
  const roundNumbers = Object.keys(rounds).sort((a, b) => b - a);
  const displayRound = selectedRound || roundNumbers[0];
  const history = rounds[displayRound] || [];

  return (
    <div className="app">
      <header className="header">
        <h1>💪 Shreddit</h1>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </header>
      <main className="content">
        <h2 className="day-title">{dayName} - History</h2>
        
        {roundNumbers.length > 1 && (
          <div className="round-selector">
            {roundNumbers.map(round => (
              <button
                key={round}
                className={`round-chip ${displayRound === round ? 'active' : ''}`}
                onClick={() => onRoundSelect(round)}
              >
                Round {round}
              </button>
            ))}
          </div>
        )}

        {history.length === 0 ? (
          <p className="no-history">No workout history yet</p>
        ) : (
          <div className="history-list">
            {history.map((session, idx) => {
              const programWeek = ((session.week - 1) % 12) + 1;
              return (
                <div key={idx} className="history-session">
                  <div className="history-date">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })} - Round {session.round || 1}, Week {programWeek}
                  </div>
                  {session.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="history-exercise">
                      <strong>{ex.name}</strong>
                      <div className="history-sets">
                        {Object.entries(ex.sets).map(([setIdx, data]) => (
                          <span key={setIdx} className="history-set">
                            {data.weight}lbs × {data.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
