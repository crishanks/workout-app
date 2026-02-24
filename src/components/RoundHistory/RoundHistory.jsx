import { useMemo } from 'react';
import { useStats } from '../../hooks/useStats';
import './RoundHistory.css';

export const RoundHistory = ({ workoutHistory, healthData, roundManager, onBack }) => {
  // Group workout history by round
  const roundsData = useMemo(() => {
    const rounds = {};
    
    workoutHistory.forEach(session => {
      const round = session.round || 1;
      if (!rounds[round]) {
        rounds[round] = {
          roundNumber: round,
          sessions: [],
          startDate: null,
          endDate: null,
          isActive: false
        };
      }
      rounds[round].sessions.push(session);
    });

    // Sort sessions by date and determine date ranges
    Object.keys(rounds).forEach(roundNum => {
      rounds[roundNum].sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (rounds[roundNum].sessions.length > 0) {
        rounds[roundNum].startDate = rounds[roundNum].sessions[0].date;
        rounds[roundNum].endDate = rounds[roundNum].sessions[rounds[roundNum].sessions.length - 1].date;
      }
    });

    // Mark current round as active
    const currentRound = roundManager.getCurrentRound();
    if (rounds[currentRound] && roundManager.hasActiveRound()) {
      rounds[currentRound].isActive = true;
      rounds[currentRound].startDate = roundManager.roundData?.startDate;
    }

    return rounds;
  }, [workoutHistory, roundManager]);

  // Calculate stats for each round
  const roundsWithStats = useMemo(() => {
    return Object.values(roundsData).map(round => {
      // Filter workout history for this round
      const roundWorkouts = workoutHistory.filter(s => (s.round || 1) === round.roundNumber);
      
      // Create stats for this round
      const roundStats = useStats(roundWorkouts, healthData, round.startDate);
      const rating = roundStats.getOverallRating();
      
      return {
        ...round,
        stats: {
          rating,
          consistency: Math.round(roundStats.getConsistencyScore()),
          progress: Math.round(roundStats.getProgressScore()),
          streak: Math.round(roundStats.getStreakBonus()),
          stepGoal: roundStats.getStepGoalScore() !== null ? Math.round(roundStats.getStepGoalScore()) : null
        },
        totalWorkouts: roundWorkouts.length
      };
    }).sort((a, b) => b.roundNumber - a.roundNumber);
  }, [roundsData, workoutHistory, healthData]);

  return (
    <div className="app">
      <header className="header">
        <h1>Shreddit</h1>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </header>
      <main className="content">
        <h2 className="page-title">Round History</h2>
        
        {roundsWithStats.length === 0 ? (
          <p className="no-history">No round history yet. Complete your first round to see stats!</p>
        ) : (
          <div className="rounds-list">
            {roundsWithStats.map(round => (
              <div key={round.roundNumber} className={`round-card ${round.isActive ? 'active' : ''}`}>
                <div className="round-header">
                  <div className="round-title-section">
                    <h3>Round {round.roundNumber}</h3>
                    {round.isActive && <span className="active-badge">In Progress</span>}
                  </div>
                  <div className="round-rating-badge" style={{ borderColor: round.stats.rating.color }}>
                    <span className="rating-grade" style={{ color: round.stats.rating.color }}>
                      {round.stats.rating.grade}
                    </span>
                    <span className="rating-score">{round.stats.rating.score}</span>
                  </div>
                </div>

                <div className="round-dates">
                  {round.startDate && (
                    <span>
                      Started: {new Date(round.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                  {!round.isActive && round.endDate && (
                    <span>
                      Ended: {new Date(round.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>

                <div className="round-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Consistency</span>
                    <span className="stat-value">{round.stats.consistency}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">{round.stats.progress}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">{round.stats.streak}%</span>
                  </div>
                  {round.stats.stepGoal !== null && (
                    <div className="stat-item">
                      <span className="stat-label">Step Goals</span>
                      <span className="stat-value">{round.stats.stepGoal}%</span>
                    </div>
                  )}
                </div>

                <div className="round-summary">
                  <span className="summary-text">
                    {round.totalWorkouts} workout{round.totalWorkouts !== 1 ? 's' : ''} completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
