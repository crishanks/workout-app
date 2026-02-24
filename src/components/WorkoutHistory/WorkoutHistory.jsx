import './WorkoutHistory.css';
import { useHealthData } from '../../hooks/useHealthData';
import { useMemo } from 'react';

export const WorkoutHistory = ({ dayName, rounds, selectedRound, onRoundSelect, onBack }) => {
  const roundNumbers = Object.keys(rounds).sort((a, b) => b - a);
  const displayRound = selectedRound || roundNumbers[0];
  const history = rounds[displayRound] || [];
  
  // Get health data hook
  const { getWeeklyHealthMetrics } = useHealthData();
  
  // Calculate date ranges and health metrics for each session
  const sessionsWithHealthMetrics = useMemo(() => {
    return history.map((session, idx) => {
      // Calculate the week's date range (Monday to Sunday)
      const sessionDate = new Date(session.date);
      const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate Monday of that week
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(sessionDate);
      weekStart.setDate(sessionDate.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      
      // Calculate Sunday of that week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Calculate previous week's date range for weight change comparison
      let previousWeekStart = null;
      let previousWeekEnd = null;
      
      if (idx < history.length - 1) {
        // There is a previous session
        previousWeekStart = new Date(weekStart);
        previousWeekStart.setDate(weekStart.getDate() - 7);
        previousWeekEnd = new Date(weekEnd);
        previousWeekEnd.setDate(weekEnd.getDate() - 7);
      }
      
      // Get health metrics for this week
      const healthMetrics = getWeeklyHealthMetrics(
        weekStart.toISOString(),
        weekEnd.toISOString(),
        previousWeekStart?.toISOString(),
        previousWeekEnd?.toISOString()
      );
      
      return {
        ...session,
        healthMetrics,
        isFirstWeek: idx === history.length - 1
      };
    });
  }, [history, getWeeklyHealthMetrics]);

  return (
    <div className="app">
      <header className="header">
        <h1>Shreddit</h1>
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
            {sessionsWithHealthMetrics.map((session, idx) => {
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
                  
                  {/* Weekly Health Metrics Section */}
                  <div className="weekly-health-metrics">
                    {session.healthMetrics.weight ? (
                      <div className="weekly-weight">
                        <span className="metric-label">Avg Weight:</span>
                        <span className="weight-value">{session.healthMetrics.weight.average} lbs</span>
                        {!session.isFirstWeek && session.healthMetrics.weight.change !== null && (
                          <span className={`weight-change ${session.healthMetrics.weight.change >= 0 ? 'gain' : 'loss'}`}>
                            {session.healthMetrics.weight.change > 0 ? '+' : ''}{session.healthMetrics.weight.change}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="weekly-weight">
                        <span className="metric-label">Avg Weight:</span>
                        <span className="no-data">No weight data</span>
                      </div>
                    )}
                    
                    {session.healthMetrics.steps.total > 0 ? (
                      <div className="weekly-steps">
                        <span className="metric-label">Steps:</span>
                        <span className="steps-value">{session.healthMetrics.steps.total.toLocaleString()}</span>
                        <span className={`goal-indicator ${session.healthMetrics.steps.goalMet ? 'met' : 'missed'}`}>
                          {session.healthMetrics.steps.goalMet ? '✓' : '✗'} 60k
                        </span>
                      </div>
                    ) : (
                      <div className="weekly-steps">
                        <span className="metric-label">Steps:</span>
                        <span className="no-data">No step data</span>
                      </div>
                    )}
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
