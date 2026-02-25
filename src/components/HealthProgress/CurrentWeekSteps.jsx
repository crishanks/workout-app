import { memo } from 'react';

export const CurrentWeekSteps = memo(({ stepsData, weekNumber, weekBoundaries }) => {
  if (!stepsData || stepsData.total === 0) {
    return (
      <div className="current-week-steps no-data" role="status" aria-live="polite">
        <p>No steps data for current week</p>
      </div>
    );
  }

  const { total: totalSteps, goalMet, percentageOfGoal, dailySteps } = stepsData;
  const goal = 60000;
  const remaining = Math.max(0, goal - totalSteps);

  // Get day name and day number relative to week start
  const getDayInfo = (dateStr) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Calculate day number within the round week (1-7)
    if (weekBoundaries) {
      const weekStart = new Date(weekBoundaries.startDate);
      weekStart.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate - weekStart;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const dayNumber = diffDays + 1; // 1-indexed
      
      return { dayName, dayNumber };
    }
    
    return { dayName, dayNumber: null };
  };

  // Sort daily steps by date
  const sortedDailySteps = [...dailySteps].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  const progressAriaLabel = `Week ${weekNumber} progress: ${totalSteps.toLocaleString()} out of ${goal.toLocaleString()} steps, ${percentageOfGoal}% complete. ${goalMet ? 'Goal achieved' : `${remaining.toLocaleString()} steps remaining`}`;

  return (
    <div className="current-week-steps">
      <div className="week-progress" role="region" aria-label={`Week ${weekNumber} step progress`}>
        <div className="progress-header">
          <span className="progress-label">Week {weekNumber} of 12</span>
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
        {weekBoundaries && (
          <p className="week-dates">
            {new Date(weekBoundaries.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekBoundaries.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
        <div className="daily-steps-list" role="list">
          {sortedDailySteps.map((day, index) => {
            const { dayName, dayNumber } = getDayInfo(day.date);
            const dayLabel = dayNumber ? `Day ${dayNumber} (${dayName})` : dayName;
            
            return (
              <div 
                key={index} 
                className="daily-step-item" 
                role="listitem"
                aria-label={`${dayLabel}: ${day.steps.toLocaleString()} steps`}
              >
                <span className="day-name">{dayLabel}</span>
                <span className="day-steps">{day.steps.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
