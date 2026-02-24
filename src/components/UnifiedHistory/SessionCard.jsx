import { useMemo } from 'react';
import './SessionCard.css';

const SessionCard = ({ session, healthMetrics, isFirstWeek, onEdit, onDelete }) => {
  // Format date for display
  const formattedDate = useMemo(() => {
    const date = new Date(session.date);
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }, [session.date]);

  // Count total sets across all exercises
  const exerciseSummary = useMemo(() => {
    if (!session.exercises || session.exercises.length === 0) {
      return [];
    }

    return session.exercises.map(exercise => {
      const setCount = Object.keys(exercise.sets || {}).length;
      return {
        name: exercise.name,
        setCount
      };
    });
  }, [session.exercises]);

  return (
    <article className="session-card">
      <header className="session-header">
        <div className="session-date-info">
          <h3 className="session-date">{formattedDate}</h3>
          <p className="session-day">{session.day}</p>
        </div>
        <div className="session-meta">
          <span className="session-round-week">
            Round {session.round} • Week {session.week}
          </span>
        </div>
      </header>

      <section className="health-metrics" aria-label="Weekly health metrics">
        <div className="metric-item weight-metric">
          <span className="metric-label">Weekly Avg Weight</span>
          {healthMetrics.weight ? (
            <div className="metric-value-container">
              <span className="metric-value">{healthMetrics.weight.average} lbs</span>
              {!isFirstWeek && healthMetrics.weight.change !== null && (
                <span className={`weight-change ${healthMetrics.weight.change >= 0 ? 'gain' : 'loss'}`}>
                  {healthMetrics.weight.change >= 0 ? '+' : ''}{healthMetrics.weight.change} lbs
                </span>
              )}
            </div>
          ) : (
            <span className="metric-value no-data">No weight data</span>
          )}
        </div>

        <div className="metric-item steps-metric">
          <span className="metric-label">Weekly Steps</span>
          <div className="metric-value-container">
            <span className="metric-value">{healthMetrics.steps.total.toLocaleString()}</span>
            <span className={`step-goal-indicator ${
              healthMetrics.steps.goalStatus === 'achieved' ? 'goal-met' : 
              healthMetrics.steps.goalStatus === 'on-track' ? 'on-track' :
              healthMetrics.steps.goalStatus === 'behind' ? 'behind' :
              'goal-missed'
            }`}>
              {healthMetrics.steps.goalStatus === 'achieved' && '✓ Goal Achieved'}
              {healthMetrics.steps.goalStatus === 'missed' && '✗ Goal Missed'}
              {healthMetrics.steps.goalStatus === 'on-track' && '→ On Track'}
              {healthMetrics.steps.goalStatus === 'behind' && '⚠ Behind'}
            </span>
          </div>
        </div>
      </section>

      <section className="exercise-summary" aria-label="Exercises performed">
        <h4 className="exercise-summary-title">Exercises</h4>
        <ul className="exercise-list">
          {exerciseSummary.map((exercise, index) => (
            <li key={index} className="exercise-item">
              <span className="exercise-name">{exercise.name}</span>
              <span className="exercise-sets">{exercise.setCount} {exercise.setCount === 1 ? 'set' : 'sets'}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="session-actions">
        <button 
          className="action-button edit-button" 
          onClick={onEdit}
          aria-label={`Edit workout from ${formattedDate}`}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button 
          className="action-button delete-button" 
          onClick={onDelete}
          aria-label={`Delete workout from ${formattedDate}`}
        >
          <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Delete
        </button>
      </footer>
    </article>
  );
};

export default SessionCard;
