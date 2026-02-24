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
  getWeeklyHealthMetrics,
  roundManager
}) => {
  // Helper function to calculate week date range based on round start date and week number
  const getWeekDateRangeFromRoundWeek = (round, week) => {
    // Get the round start date from roundManager
    // For now, we'll calculate based on the first session in that round/week
    // This is a fallback - ideally we'd have the round start date
    const roundSessions = workoutHistory.filter(s => s.round === round);
    if (roundSessions.length === 0) {
      return null;
    }
    
    // Sort by date to find the earliest session in this round
    const sortedSessions = [...roundSessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const roundStartDate = new Date(sortedSessions[0].date);
    
    // Calculate the start of the requested week
    // Week 1 starts on round start date, Week 2 starts 7 days later, etc.
    const weekStartDate = new Date(roundStartDate);
    weekStartDate.setDate(roundStartDate.getDate() + ((week - 1) * 7));
    weekStartDate.setHours(0, 0, 0, 0);
    
    // Calculate the end of the week (6 days later, at 23:59:59)
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);
    
    return {
      start: weekStartDate.toISOString().split('T')[0],
      end: weekEndDate.toISOString().split('T')[0]
    };
  };

  // Helper function to get previous week date range
  const getPreviousWeekDateRange = (round, week) => {
    if (week === 1) {
      // No previous week for week 1
      return null;
    }
    
    return getWeekDateRangeFromRoundWeek(round, week - 1);
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
                  // Calculate week date range based on round and week number
                  const weekRange = getWeekDateRangeFromRoundWeek(session.round, session.week);
                  
                  // Get previous week range for weight change calculation
                  const prevWeekRange = isFirstWeekOfRound ? null : getPreviousWeekDateRange(session.round, session.week);
                  
                  // Get health metrics for this session's week
                  const healthMetrics = weekRange ? getWeeklyHealthMetrics(
                    weekRange.start,
                    weekRange.end,
                    prevWeekRange?.start || null,
                    prevWeekRange?.end || null
                  ) : { weight: null, steps: { total: 0, goalMet: false, goalStatus: 'missed', percentageOfGoal: 0 } };
                  
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
