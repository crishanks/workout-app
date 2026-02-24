import { useMemo } from 'react';
import SessionCard from './SessionCard';
import './TimelineView.css';

const TimelineView = ({
  workoutHistory,
  healthData,
  selectedRound,
  onRoundSelect,
  onEditSession,
  onDeleteSession,
  getWeeklyHealthMetrics
}) => {
  // Helper function to calculate week date range (Monday to Sunday)
  const getWeekDateRange = (sessionDate) => {
    const date = new Date(sessionDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday of the week
    const monday = new Date(date);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
    monday.setDate(date.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Calculate Sunday of the week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  // Helper function to get previous week date range
  const getPreviousWeekDateRange = (sessionDate) => {
    const date = new Date(sessionDate);
    const dayOfWeek = date.getDay();
    
    // Calculate Monday of current week
    const monday = new Date(date);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(date.getDate() - daysToMonday);
    
    // Calculate previous Monday (7 days before)
    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    prevMonday.setHours(0, 0, 0, 0);
    
    // Calculate previous Sunday
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    prevSunday.setHours(23, 59, 59, 999);
    
    return {
      start: prevMonday.toISOString().split('T')[0],
      end: prevSunday.toISOString().split('T')[0]
    };
  };
  // Group sessions by round and week, sorted chronologically (most recent first)
  const groupedSessions = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return [];
    }

    // Filter by selected round if applicable
    const filteredHistory = selectedRound !== null
      ? workoutHistory.filter(session => session.round === selectedRound)
      : workoutHistory;

    // Group by round and week
    const groups = {};
    filteredHistory.forEach(session => {
      const key = `${session.round}-${session.week}`;
      if (!groups[key]) {
        groups[key] = {
          round: session.round,
          week: session.week,
          sessions: []
        };
      }
      groups[key].sessions.push(session);
    });

    // Convert to array and sort
    const groupedArray = Object.values(groups);
    
    // Sort groups: most recent round first, then most recent week first
    groupedArray.sort((a, b) => {
      if (a.round !== b.round) {
        return b.round - a.round; // Higher round number first
      }
      return b.week - a.week; // Higher week number first
    });

    // Sort sessions within each group: most recent first
    groupedArray.forEach(group => {
      group.sessions.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    });

    return groupedArray;
  }, [workoutHistory, selectedRound]);

  // Get unique rounds for filter chips
  const availableRounds = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return [];
    }

    const rounds = [...new Set(workoutHistory.map(session => session.round))];
    return rounds.sort((a, b) => b - a); // Most recent first
  }, [workoutHistory]);

  // Show filter chips only if multiple rounds exist
  const showRoundFilters = availableRounds.length > 1;

  // Empty state
  if (!workoutHistory || workoutHistory.length === 0) {
    return (
      <div className="timeline-view">
        <div className="empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">🏋️</div>
          <p>No workout history yet</p>
          <p className="empty-state-subtitle">Complete your first workout to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      {showRoundFilters && (
        <nav className="round-filters" aria-label="Filter by round">
          <button
            className={`round-chip ${selectedRound === null ? 'active' : ''}`}
            onClick={() => onRoundSelect(null)}
            aria-pressed={selectedRound === null}
            aria-label="Show all rounds"
          >
            All Rounds
          </button>
          {availableRounds.map(round => (
            <button
              key={round}
              className={`round-chip ${selectedRound === round ? 'active' : ''}`}
              onClick={() => onRoundSelect(round)}
              aria-pressed={selectedRound === round}
              aria-label={`Filter to round ${round}`}
            >
              Round {round}
            </button>
          ))}
        </nav>
      )}

      <div className="timeline-content">
        {groupedSessions.map(group => {
          // Determine if this is the first week of the round
          const isFirstWeekOfRound = group.week === 1;
          
          return (
            <section key={`${group.round}-${group.week}`} className="round-week-group" aria-labelledby={`round-${group.round}-week-${group.week}-heading`}>
              <header className="group-header">
                <h2 id={`round-${group.round}-week-${group.week}-heading`}>Round {group.round} - Week {group.week}</h2>
              </header>
              <div className="sessions-list">
                {group.sessions.map(session => {
                  // Calculate week date range for this session
                  const weekRange = getWeekDateRange(session.date);
                  
                  // Get previous week range for weight change calculation
                  const prevWeekRange = getPreviousWeekDateRange(session.date);
                  
                  // Get health metrics for this session's week
                  const healthMetrics = getWeeklyHealthMetrics(
                    weekRange.start,
                    weekRange.end,
                    isFirstWeekOfRound ? null : prevWeekRange.start,
                    isFirstWeekOfRound ? null : prevWeekRange.end
                  );
                  
                  return (
                    <SessionCard
                      key={session.id}
                      session={session}
                      healthMetrics={healthMetrics}
                      isFirstWeek={isFirstWeekOfRound}
                      onEdit={() => onEditSession(session)}
                      onDelete={() => onDeleteSession(session)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
