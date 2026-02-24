import { memo } from 'react';

export const CurrentWeekSteps = memo(({ stepsData }) => {
  if (!stepsData || stepsData.totalSteps === 0) {
    return (
      <div className="current-week-steps no-data" role="status" aria-live="polite">
        <p>No steps data for current week</p>
      </div>
    );
  }

  const { totalSteps, goalMet, percentageOfGoal, dailySteps } = stepsData;
  const goal = 60000;
  const remaining = Math.max(0, goal - totalSteps);

  // Get day names for the week
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Sort daily steps by date
  const sortedDailySteps = [...dailySteps].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const progressAriaLabel = `Weekly progress: ${totalSteps.toLocaleString()} out of ${goal.toLocaleString()} steps, ${percentageOfGoal}% complete. ${goalMet ? 'Goal achieved' : `${remaining.toLocaleString()} steps remaining`}`;

  return (
    <div className="current-week-steps">
      <div className="week-progress" role="region" aria-label="Weekly step progress">
        <div className="progress-header">
          <span className="progress-label">Weekly Progress</span>
          <span className="progress-value" aria-label={progressAriaLabel}>
            {totalSteps.toLocaleString()} / {goal.toLocaleString()} steps
          </span>
        </div>
        
        <div 
          className="progress-bar-container" 
          role="progressbar" 
          aria-valuenow={percentageOfGoal} 
          aria-valuemin="0" 
          aria-valuemax="100"
          aria-label={`Step goal progress: ${percentageOfGoal}%`}
        >
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${Math.min(percentageOfGoal, 100)}%`,
              background: goalMet ? 'var(--accent-success)' : 'var(--accent-warning)'
            }}
          />
        </div>
        
        <div className="progress-footer">
          {goalMet ? (
            <span className="goal-status met" role="status">✓ Goal achieved!</span>
          ) : (
            <span className="goal-status" role="status">
              {remaining.toLocaleString()} steps remaining
            </span>
          )}
          <span className="goal-percentage" aria-hidden="true">{percentageOfGoal}%</span>
        </div>
      </div>

      <div className="daily-breakdown" role="region" aria-label="Daily step breakdown">
        <h4>Daily Breakdown</h4>
        <div className="daily-steps-list" role="list">
          {sortedDailySteps.map((day, index) => (
            <div 
              key={index} 
              className="daily-step-item" 
              role="listitem"
              aria-label={`${getDayName(day.date)}: ${day.steps.toLocaleString()} steps`}
            >
              <span className="day-name">{getDayName(day.date)}</span>
              <span className="day-steps">{day.steps.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
