import { useMemo } from 'react';
import { useStats } from '../../hooks/useStats';
import RoundCard from './RoundCard';
import { getRoundDateRange, getAllRoundWeeks } from '../../utils/roundDateUtils';
import './RoundsView.css';

const RoundsView = ({
  workoutHistory,
  healthData,
  roundManager,
  selectedRound,
  onRoundSelect
}) => {
  // Group workout history by round using useMemo
  const roundsData = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return [];
    }

    // Group sessions by round
    const roundGroups = {};
    workoutHistory.forEach(session => {
      const roundNum = session.round;
      if (!roundGroups[roundNum]) {
        roundGroups[roundNum] = {
          round: roundNum,
          sessions: []
        };
      }
      roundGroups[roundNum].sessions.push(session);
    });

    // Convert to array and calculate date ranges
    const rounds = Object.values(roundGroups).map(roundGroup => {
      // Sort sessions by date to find start and end dates
      const sortedSessions = [...roundGroup.sessions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      const startDate = sortedSessions[0].date;
      const endDate = sortedSessions[sortedSessions.length - 1].date;

      // Check if this is the current active round
      const isActive = roundManager?.roundData?.round === roundGroup.round && 
                       roundManager?.roundData?.isActive === true;

      return {
        round: roundGroup.round,
        startDate,
        endDate: isActive ? null : endDate, // null if active
        isActive,
        sessionCount: roundGroup.sessions.length,
        sessions: roundGroup.sessions
      };
    });

    // Sort rounds from most recent to oldest
    rounds.sort((a, b) => b.round - a.round);

    // Filter by selected round if applicable
    if (selectedRound !== null) {
      return rounds.filter(round => round.round === selectedRound);
    }

    return rounds;
  }, [workoutHistory, roundManager, selectedRound]);

  // Empty state when no rounds exist
  if (roundsData.length === 0) {
    return (
      <div className="rounds-view">
        <div className="empty-state" role="status">
          <div className="empty-state-icon" aria-hidden="true">🏆</div>
          <p>No round history yet</p>
          <p className="empty-state-subtitle">Complete your first round to see stats!</p>
        </div>
      </div>
    );
  }

  // Get unique rounds for filter chips (from all workout history, not filtered)
  const availableRounds = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return [];
    }

    const rounds = [...new Set(workoutHistory.map(session => session.round))];
    return rounds.sort((a, b) => b - a); // Most recent first
  }, [workoutHistory]);

  // Show filter chips only if multiple rounds exist
  const showRoundFilters = availableRounds.length > 1;

  // Function to calculate health metrics summary for a round
  const calculateRoundHealthSummary = (roundHealthData, roundStartDate) => {
    if (!roundHealthData || roundHealthData.length === 0 || !roundStartDate) {
      return {
        totalSteps: null,
        weeklyStepGoalsMet: null,
        weightChange: null,
        startWeight: null,
        endWeight: null
      };
    }

    // Get all 12 weeks for this round
    const allWeeks = getAllRoundWeeks(roundStartDate);
    const weekGoal = 60000;

    // Calculate total steps and weekly step goals met
    let totalSteps = 0;
    let weeklyStepGoalsMet = 0;

    allWeeks.forEach(({ startDate, endDate }) => {
      // Filter health data for this week
      const weekData = roundHealthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Sum steps for this week
      const weekSteps = weekData.reduce((sum, entry) => sum + (entry.steps || 0), 0);
      totalSteps += weekSteps;

      // Check if week goal was met
      if (weekSteps >= weekGoal) {
        weeklyStepGoalsMet++;
      }
    });

    // Calculate weight change
    let weightChange = null;
    let startWeight = null;
    let endWeight = null;
    
    const weightEntries = roundHealthData
      .filter(entry => entry.weight != null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (weightEntries.length >= 2) {
      startWeight = weightEntries[0].weight;
      endWeight = weightEntries[weightEntries.length - 1].weight;
      weightChange = endWeight - startWeight;
    } else if (weightEntries.length === 1) {
      startWeight = weightEntries[0].weight;
      endWeight = weightEntries[0].weight;
      weightChange = 0;
    }

    return {
      totalSteps,
      weeklyStepGoalsMet,
      weightChange,
      startWeight,
      endWeight
    };
  };

  return (
    <div className="rounds-view">
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

      <div className="rounds-list">
        {roundsData.map(round => {
          // Calculate stats for this round using useStats hook
          const roundSessions = round.sessions;
          const roundStartDate = round.startDate;
          
          // Use round boundaries to filter health data
          let roundHealthData = [];
          if (roundStartDate) {
            const { startDate, endDate } = getRoundDateRange(roundStartDate);
            roundHealthData = healthData.filter(entry => {
              const entryDate = new Date(entry.date);
              return entryDate >= startDate && entryDate <= endDate;
            });
          }

          // Use stats hook to calculate round statistics
          const statsHook = useStats(roundSessions, roundHealthData, roundStartDate);
          const rating = statsHook.getOverallRating();
          const consistency = statsHook.getConsistencyScore();
          const progress = statsHook.getProgressScore();
          const streak = statsHook.getStreakBonus();
          const streakCount = statsHook.getStreakCount();
          const stepGoal = statsHook.getStepGoalScore();

          const stats = {
            rating,
            consistency,
            progress,
            streak,
            streakCount,
            stepGoal
          };

          // Calculate health metrics summary for this round using round boundaries
          const healthSummary = calculateRoundHealthSummary(roundHealthData, roundStartDate);

          return (
            <RoundCard
              key={round.round}
              round={round}
              stats={stats}
              healthSummary={healthSummary}
              isActive={round.isActive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RoundsView;
