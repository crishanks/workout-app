export const CurrentWeekSteps = ({ stepsData }) => {
  if (!stepsData || stepsData.totalSteps === 0) {
    return (
      <div className="current-week-steps no-data">
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

  return (
    <div className="current-week-steps">
      <div className="week-progress">
        <div className="progress-header">
          <span className="progress-label">Weekly Progress</span>
          <span className="progress-value">
            {totalSteps.toLocaleString()} / {goal.toLocaleString()} steps
          </span>
        </div>
        
        <div className="progress-bar-container">
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
            <span className="goal-status met">✓ Goal achieved!</span>
          ) : (
            <span className="goal-status">
              {remaining.toLocaleString()} steps remaining
            </span>
          )}
          <span className="goal-percentage">{percentageOfGoal}%</span>
        </div>
      </div>

      <div className="daily-breakdown">
        <h4>Daily Breakdown</h4>
        <div className="daily-steps-list">
          {sortedDailySteps.map((day, index) => (
            <div key={index} className="daily-step-item">
              <span className="day-name">{getDayName(day.date)}</span>
              <span className="day-steps">{day.steps.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
