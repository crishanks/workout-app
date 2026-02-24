import { useMemo } from 'react';
import { useStats } from '../../hooks/useStats';
import RoundCard from './RoundCard';
import './RoundsView.css';

const RoundsView = ({
  workoutHistory,
  healthData,
  roundManager
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

    return rounds;
  }, [workoutHistory, roundManager]);

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

  // Function to calculate health metrics summary for a round
  const calculateRoundHealthSummary = (roundHealthData) => {
    if (!roundHealthData || roundHealthData.length === 0) {
      return {
        avgStepsPerWeek: null,
        totalWeightChange: null,
        startWeight: null,
        endWeight: null
      };
    }

    // Calculate average steps per week
    let avgStepsPerWeek = null;
    const stepEntries = roundHealthData.filter(entry => entry.steps != null);
    
    if (stepEntries.length > 0) {
      // Group step data by week
      const weeklySteps = {};
      stepEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        // Get Monday of the week
        const dayOfWeek = entryDate.getDay();
        const diff = entryDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(entryDate.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const weekKey = monday.toISOString().split('T')[0];
        
        if (!weeklySteps[weekKey]) {
          weeklySteps[weekKey] = [];
        }
        weeklySteps[weekKey].push(entry.steps);
      });

      // Calculate average steps for each week, then average across weeks
      const weeklyAverages = Object.values(weeklySteps).map(steps => {
        const sum = steps.reduce((acc, val) => acc + val, 0);
        return sum / steps.length;
      });

      if (weeklyAverages.length > 0) {
        const totalAvg = weeklyAverages.reduce((acc, val) => acc + val, 0);
        avgStepsPerWeek = Math.round(totalAvg / weeklyAverages.length);
      }
    }

    // Calculate total weight change
    let totalWeightChange = null;
    let startWeight = null;
    let endWeight = null;
    
    const weightEntries = roundHealthData
      .filter(entry => entry.weight != null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (weightEntries.length >= 2) {
      startWeight = weightEntries[0].weight;
      endWeight = weightEntries[weightEntries.length - 1].weight;
      totalWeightChange = endWeight - startWeight;
    } else if (weightEntries.length === 1) {
      startWeight = weightEntries[0].weight;
      endWeight = weightEntries[0].weight;
      totalWeightChange = 0;
    }

    return {
      avgStepsPerWeek,
      totalWeightChange,
      startWeight,
      endWeight
    };
  };

  return (
    <div className="rounds-view">
      <div className="rounds-list">
        {roundsData.map(round => {
          // Calculate stats for this round using useStats hook
          const roundSessions = round.sessions;
          const roundStartDate = round.startDate;
          
          // Filter health data for this round
          const roundHealthData = healthData.filter(entry => {
            const entryDate = new Date(entry.date);
            const startDate = new Date(roundStartDate);
            const endDate = round.endDate ? new Date(round.endDate) : new Date();
            return entryDate >= startDate && entryDate <= endDate;
          });

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

          // Calculate health metrics summary for this round
          const healthSummary = calculateRoundHealthSummary(roundHealthData);

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
