export const useStats = (workoutHistory, healthData = []) => {
  const calculateVolume = (exercise) => {
    let totalVolume = 0;
    Object.values(exercise.sets).forEach(set => {
      const weight = parseFloat(set.weight) || 0;
      const reps = parseFloat(set.reps) || 0;
      totalVolume += weight * reps;
    });
    return totalVolume;
  };

  const getConsistencyScore = () => {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentSessions = workoutHistory.filter(s => 
      new Date(s.date) >= fourWeeksAgo && s.exercises.length > 0
    );

    const weeks = Math.ceil(recentSessions.length / 5);
    const expectedWorkouts = weeks * 5;
    const completedWorkouts = recentSessions.length;
    
    if (expectedWorkouts === 0) return 0;
    
    const rate = (completedWorkouts / expectedWorkouts) * 100;
    return Math.min(100, rate);
  };

  const getProgressScore = () => {
    if (workoutHistory.length === 0) return 0;
    
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const oldSessions = workoutHistory.filter(s => 
      new Date(s.date) < fourWeeksAgo && s.exercises.length > 0
    );
    const recentSessions = workoutHistory.filter(s => 
      new Date(s.date) >= fourWeeksAgo && s.exercises.length > 0
    );

    if (oldSessions.length === 0 || recentSessions.length === 0) return 70;

    const oldVolume = oldSessions.reduce((sum, session) => 
      sum + session.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0), 0
    );
    const recentVolume = recentSessions.reduce((sum, session) => 
      sum + session.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0), 0
    );

    const avgOldVolume = oldVolume / oldSessions.length;
    const avgRecentVolume = recentVolume / recentSessions.length;
    
    if (avgRecentVolume > avgOldVolume * 1.05) return 100;
    if (avgRecentVolume > avgOldVolume * 0.95) return 70;
    return 40;
  };

  const getStreakBonus = () => {
    const sortedSessions = [...workoutHistory]
      .filter(s => s.exercises.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedSessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 2) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    if (streak >= 7) return 100;
    if (streak >= 3) return (streak / 7) * 100;
    return 0;
  };

  const getStepGoalScore = () => {
    if (!healthData || healthData.length === 0) return null;

    // Group health data by week
    const weeklySteps = {};
    
    healthData.forEach(entry => {
      if (!entry.steps) return;
      
      const entryDate = new Date(entry.date);
      // Get Monday of the week
      const dayOfWeek = entryDate.getDay();
      const diff = entryDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(entryDate.setDate(diff));
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weeklySteps[weekKey]) {
        weeklySteps[weekKey] = 0;
      }
      weeklySteps[weekKey] += entry.steps;
    });

    // Calculate achievement percentage for each week
    const weeklyAchievements = Object.values(weeklySteps).map(totalSteps => {
      return Math.min((totalSteps / 60000) * 100, 100);
    });

    if (weeklyAchievements.length === 0) return null;

    // Calculate average achievement
    const avgAchievement = weeklyAchievements.reduce((sum, val) => sum + val, 0) / weeklyAchievements.length;
    
    return avgAchievement;
  };

  const getOverallRating = () => {
    if (workoutHistory.length === 0) {
      return { grade: '-', score: 0, color: '#888' };
    }
    
    const consistency = getConsistencyScore();
    const progress = getProgressScore();
    const streak = getStreakBonus();
    const stepGoal = getStepGoalScore();
    
    // Adjust weights based on whether step data is available
    let score;
    if (stepGoal !== null) {
      // With step data: 35/35/15/15
      score = (consistency * 0.35) + (progress * 0.35) + (streak * 0.15) + (stepGoal * 0.15);
    } else {
      // Without step data: maintain original proportions (40/40/20)
      score = (consistency * 0.4) + (progress * 0.4) + (streak * 0.2);
    }
    
    if (score >= 90) return { grade: 'S', score: Math.round(score), color: '#ffd700' };
    if (score >= 75) return { grade: 'A', score: Math.round(score), color: '#ff4444' };
    if (score >= 60) return { grade: 'B', score: Math.round(score), color: '#ff8844' };
    return { grade: 'C', score: Math.round(score), color: '#888' };
  };

  const getExercisePRs = () => {
    const prs = {};
    
    workoutHistory.forEach(session => {
      session.exercises.forEach(exercise => {
        Object.values(exercise.sets).forEach(set => {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseFloat(set.reps) || 0;
          const volume = weight * reps;
          
          if (!prs[exercise.name] || volume > prs[exercise.name].volume) {
            prs[exercise.name] = {
              weight,
              reps,
              volume,
              date: session.date
            };
          }
        });
      });
    });

    return Object.entries(prs)
      .sort((a, b) => b[1].volume - a[1].volume)
      .slice(0, 10);
  };

  const getWeeklyConsistency = () => {
    const weeks = {};
    
    workoutHistory.forEach(session => {
      if (session.exercises.length === 0) return;
      
      const date = new Date(session.date);
      const weekKey = `${session.round || 1}-${((session.week - 1) % 12) + 1}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { count: 0, round: session.round || 1, week: ((session.week - 1) % 12) + 1 };
      }
      weeks[weekKey].count++;
    });

    return Object.entries(weeks)
      .sort((a, b) => {
        const [aRound, aWeek] = a[0].split('-').map(Number);
        const [bRound, bWeek] = b[0].split('-').map(Number);
        if (aRound !== bRound) return bRound - aRound;
        return bWeek - aWeek;
      })
      .slice(0, 12);
  };

  return {
    getOverallRating,
    getConsistencyScore,
    getProgressScore,
    getStreakBonus,
    getStepGoalScore,
    getExercisePRs,
    getWeeklyConsistency
  };
};
