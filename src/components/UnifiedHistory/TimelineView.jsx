import { useMemo } from 'react';
import SessionCard from './SessionCard';
import HealthDataCard from './HealthDataCard';
import { getRoundDateRange } from '../../utils/roundDateUtils';
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
  // Create timeline entries combining workouts and health data, sorted by date
  const timelineEntries = useMemo(() => {
    const entries = [];

    // Add workout sessions
    if (workoutHistory && workoutHistory.length > 0) {
      const filteredHistory = selectedRound !== null
        ? workoutHistory.filter(session => session.round === selectedRound)
        : workoutHistory;

      filteredHistory.forEach(session => {
        entries.push({
          type: 'workout',
          date: session.date,
          round: session.round,
          week: session.week,
          data: session
        });
      });
    }

    // Add health data entries
    if (healthData && healthData.length > 0) {
      // Filter health data by selected round if applicable
      let filteredHealthData = healthData;
      
      if (selectedRound !== null && roundManager?.roundData?.startDate) {
        // Get the round start date for the selected round
        // This is a simplified approach - ideally we'd have round start dates for all rounds
        const { startDate, endDate } = getRoundDateRange(roundManager.roundData.startDate);
        
        filteredHealthData = healthData.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
      }

      filteredHealthData.forEach(entry => {
        // Only include entries with actual data
        if ((entry.steps !== null && entry.steps !== undefined) || 
            (entry.weight !== null && entry.weight !== undefined)) {
          entries.push({
            type: 'health',
            date: entry.date,
            data: entry
          });
        }
      });
    }

    // Sort all entries by date (most recent first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    return entries;
  }, [workoutHistory, healthData, selectedRound, roundManager]);

  // Group timeline entries - interleave health data with workouts by date
  const groupedTimeline = useMemo(() => {
    if (timelineEntries.length === 0) {
      return [];
    }

    // First, separate entries by whether they have round/week info
    const entriesWithRound = timelineEntries.filter(e => e.type === 'workout');
    const healthOnlyEntries = timelineEntries.filter(e => e.type === 'health');

    // Group workout entries by round and week
    const workoutGroups = {};
    entriesWithRound.forEach(entry => {
      const key = `${entry.round}-${entry.week}`;
      if (!workoutGroups[key]) {
        workoutGroups[key] = {
          round: entry.round,
          week: entry.week,
          entries: []
        };
      }
      workoutGroups[key].entries.push(entry);
    });

    // For each workout group, find health data that falls within the same date range
    Object.values(workoutGroups).forEach(group => {
      // Get date range for this round/week
      const weekRange = getWeekDateRangeFromRoundWeek(group.round, group.week);
      
      if (weekRange) {
        const weekStart = new Date(weekRange.start);
        const weekEnd = new Date(weekRange.end);
        
        // Find health entries that fall within this week
        healthOnlyEntries.forEach(healthEntry => {
          const healthDate = new Date(healthEntry.date);
          if (healthDate >= weekStart && healthDate <= weekEnd) {
            group.entries.push(healthEntry);
          }
        });
      }
    });

    // Convert to array and sort groups
    const groupedArray = Object.values(workoutGroups);
    
    // Sort groups: most recent round first, then most recent week first
    groupedArray.sort((a, b) => {
      if (a.round !== b.round) {
        return b.round - a.round;
      }
      return b.week - a.week;
    });

    // Sort entries within each group by date (most recent first)
    groupedArray.forEach(group => {
      group.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    // Add standalone health entries (those not matched to any workout week)
    // These are health entries that don't fall within any workout round/week
    const matchedHealthDates = new Set();
    groupedArray.forEach(group => {
      group.entries.forEach(entry => {
        if (entry.type === 'health') {
          matchedHealthDates.add(entry.date);
        }
      });
    });

    const standaloneHealthEntries = healthOnlyEntries.filter(
      entry => !matchedHealthDates.has(entry.date)
    );

    // Add standalone health entries as individual groups
    standaloneHealthEntries.forEach(entry => {
      groupedArray.push({
        round: null,
        week: null,
        date: entry.date,
        entries: [entry]
      });
    });

    // Re-sort to include standalone entries
    groupedArray.sort((a, b) => {
      // Health-only groups (no round/week)
      if (a.round === null && b.round === null) {
        return new Date(b.date) - new Date(a.date);
      }
      if (a.round === null) {
        // Compare health entry date with the latest date in workout group
        const bLatestDate = new Date(b.entries[0].date);
        return bLatestDate - new Date(a.date);
      }
      if (b.round === null) {
        const aLatestDate = new Date(a.entries[0].date);
        return new Date(b.date) - aLatestDate;
      }

      // Both are workout groups
      if (a.round !== b.round) {
        return b.round - a.round;
      }
      return b.week - a.week;
    });

    return groupedArray;
  }, [timelineEntries]);

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
  if (timelineEntries.length === 0) {
    return (
      <div className="timeline-view">
        <div className="empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">🏋️</div>
          <p>No history yet</p>
          <p className="empty-state-subtitle">Complete workouts or log health data to see them here</p>
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
        {groupedTimeline.map((group, groupIndex) => {
          // Health-only group (no round/week)
          if (group.round === null) {
            return (
              <div key={`health-${group.date}-${groupIndex}`} className="timeline-entry-standalone">
                {group.entries.map((entry, entryIndex) => (
                  <HealthDataCard
                    key={`${entry.date}-${entryIndex}`}
                    date={entry.date}
                    steps={entry.data.steps}
                    weight={entry.data.weight}
                  />
                ))}
              </div>
            );
          }

          // Workout group with round/week
          const isFirstWeekOfRound = group.week === 1;
          
          return (
            <section key={`${group.round}-${group.week}`} className="round-week-group" aria-labelledby={`round-${group.round}-week-${group.week}-heading`}>
              <header className="group-header">
                <h2 id={`round-${group.round}-week-${group.week}-heading`}>Round {group.round} - Week {group.week}</h2>
              </header>
              <div className="entries-list">
                {group.entries.map((entry, entryIndex) => {
                  if (entry.type === 'workout') {
                    const session = entry.data;
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
                  } else {
                    // Health data entry
                    return (
                      <HealthDataCard
                        key={`${entry.date}-${entryIndex}`}
                        date={entry.date}
                        steps={entry.data.steps}
                        weight={entry.data.weight}
                      />
                    );
                  }
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
