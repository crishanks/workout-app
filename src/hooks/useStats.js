import { getRoundDateRange, getAllRoundWeeks } from '../utils/roundDateUtils';

export const useStats = (workoutHistory, healthData = [], roundStartDate = null, roundEndDate = null) => {
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
    // If no round context, fall back to calendar-based calculation
    if (!roundStartDate) {
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
    }

    // Round-based calculation: use last 4 round weeks
    const allWeeks = getAllRoundWeeks(roundStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find current week in round
    let currentWeekIndex = 0;
    for (let i = 0; i < allWeeks.length; i++) {
      const weekStart = new Date(allWeeks[i].startDate);
      const weekEnd = new Date(allWeeks[i].endDate);
      if (today >= weekStart && today <= weekEnd) {
        currentWeekIndex = i;
        break;
      } else if (today > weekEnd) {
        currentWeekIndex = i;
      }
    }
    
    // Get last 4 weeks (or fewer if at start of round)
    const startWeekIndex = Math.max(0, currentWeekIndex - 3);
    const recentWeeks = allWeeks.slice(startWeekIndex, currentWeekIndex + 1);
    
    if (recentWeeks.length === 0) return 0;
    
    // Filter sessions within these weeks
    const recentSessions = workoutHistory.filter(s => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      return recentWeeks.some(week => {
        const weekStart = new Date(week.startDate);
        const weekEnd = new Date(week.endDate);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }) && s.exercises.length > 0;
    });

    const expectedWorkouts = recentWeeks.length * 5;
    const completedWorkouts = recentSessions.length;
    
    if (expectedWorkouts === 0) return 0;
    
    const rate = (completedWorkouts / expectedWorkouts) * 100;
    return Math.min(100, rate);
  };

  const getProgressScore = () => {
    if (workoutHistory.length === 0) return 0;
    
    // If no round context, fall back to calendar-based calculation
    if (!roundStartDate) {
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      const oldSessions = workoutHistory.filter(s => 
        new Date(s.date) < fourWeeksAgo && s.exercises.length > 0
      );
      const recentSessions = workoutHistory.filter(s => 
        new Date(s.date) >= fourWeeksAgo && s.exercises.length > 0
      );

      // If no old sessions or no recent sessions, return default score
      if (oldSessions.length === 0 || recentSessions.length === 0) return 70;

      const oldVolume = oldSessions.reduce((sum, session) => 
        sum + session.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0), 0
      );
      const recentVolume = recentSessions.reduce((sum, session) => 
        sum + session.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0), 0
      );

      const avgOldVolume = oldVolume / oldSessions.length;
      const avgRecentVolume = recentVolume / recentSessions.length;
      
      // Avoid division by zero
      if (avgOldVolume === 0) return 70;
      
      if (avgRecentVolume > avgOldVolume * 1.05) return 100;
      if (avgRecentVolume > avgOldVolume * 0.95) return 70;
      return 40;
    }

    // Round-based calculation: compare first half vs second half of round
    const allWeeks = getAllRoundWeeks(roundStartDate);
    const midpoint = Math.floor(allWeeks.length / 2);
    
    const firstHalfWeeks = allWeeks.slice(0, midpoint);
    const secondHalfWeeks = allWeeks.slice(midpoint);
    
    const oldSessions = workoutHistory.filter(s => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      return firstHalfWeeks.some(week => {
        const weekStart = new Date(week.startDate);
        const weekEnd = new Date(week.endDate);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }) && s.exercises.length > 0;
    });
    
    const recentSessions = workoutHistory.filter(s => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      return secondHalfWeeks.some(week => {
        const weekStart = new Date(week.startDate);
        const weekEnd = new Date(week.endDate);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }) && s.exercises.length > 0;
    });

    // If no old sessions or no recent sessions, return default score
    if (oldSessions.length === 0 || recentSessions.length === 0) return 70;

    const oldVolume = oldSessions.reduce((sum, session) => 
      sum + session.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0), 0
    );
    const recentVolume = recentSessions.reduce((sum, session) => 
      sum + session.exercises.reduce((exSum, ex) => exSum + calculateVolume(ex), 0), 0
    );

    const avgOldVolume = oldVolume / oldSessions.length;
    const avgRecentVolume = recentVolume / recentSessions.length;
    
    // Avoid division by zero
    if (avgOldVolume === 0) return 70;
    
    if (avgRecentVolume > avgOldVolume * 1.05) return 100;
    if (avgRecentVolume > avgOldVolume * 0.95) return 70;
    return 40;
  };

  const getStreakBonus = () => {
    const sortedSessions = [...workoutHistory]
      .filter(s => s.exercises.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedSessions.length === 0) return 0;

    // Get the most recent workout date
    const mostRecentDate = new Date(sortedSessions[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Check if the most recent workout is within the last 2 days (to consider it active)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLastWorkout = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastWorkout > 2) {
      // Streak is broken if no workout in the last 2 days
      return 0;
    }

    // Find the start of the streak by going backwards
    let streakStartDate = mostRecentDate;
    let currentCheckDate = new Date(mostRecentDate);
    
    for (let i = 1; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentCheckDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      // If gap is more than 2 days, streak is broken
      if (daysDiff > 2) {
        break;
      }
      
      // Update streak start date and continue checking
      streakStartDate = sessionDate;
      currentCheckDate = sessionDate;
    }

    // Calculate total calendar days in the streak (from start to today)
    const streakDays = Math.floor((today - streakStartDate) / (1000 * 60 * 60 * 24)) + 1;

    // Return percentage for scoring
    if (streakDays >= 7) return 100;
    if (streakDays >= 3) return (streakDays / 7) * 100;
    return 0;
  };

  const getStreakCount = () => {
    const sortedSessions = [...workoutHistory]
      .filter(s => s.exercises.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedSessions.length === 0) return 0;

    // Get the most recent workout date
    const mostRecentDate = new Date(sortedSessions[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Check if the most recent workout is within the last 2 days (to consider it active)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLastWorkout = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastWorkout > 2) {
      // Streak is broken if no workout in the last 2 days
      return 0;
    }

    // Find the start of the streak by going backwards
    let streakStartDate = mostRecentDate;
    let currentCheckDate = new Date(mostRecentDate);
    
    for (let i = 1; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].date);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentCheckDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      // If gap is more than 2 days, streak is broken
      if (daysDiff > 2) {
        break;
      }
      
      // Update streak start date and continue checking
      streakStartDate = sessionDate;
      currentCheckDate = sessionDate;
    }

    // Calculate total calendar days in the streak (from start to today)
    const streakDays = Math.floor((today - streakStartDate) / (1000 * 60 * 60 * 24)) + 1;

    return streakDays;
  };

  const getStepGoalScore = () => {
    if (!healthData || healthData.length === 0) return null;

    // Filter health data to only include entries from the current round
    let filteredHealthData = healthData;
    if (roundStartDate) {
      const roundBoundaries = roundEndDate 
        ? { startDate: new Date(roundStartDate), endDate: new Date(roundEndDate) }
        : getRoundDateRange(roundStartDate);
      
      const roundStart = new Date(roundBoundaries.startDate);
      roundStart.setHours(0, 0, 0, 0);
      const roundEnd = new Date(roundBoundaries.endDate);
      roundEnd.setHours(23, 59, 59, 999);
      
      filteredHealthData = healthData.filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate >= roundStart && entryDate <= roundEnd;
      });
    }

    if (filteredHealthData.length === 0) return null;

    // Group health data by round week
    const weeklySteps = {};
    
    if (roundStartDate) {
      // Use round weeks
      const allWeeks = getAllRoundWeeks(roundStartDate);
      
      filteredHealthData.forEach(entry => {
        if (!entry.steps) return;
        
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        
        // Find which round week this entry belongs to
        const week = allWeeks.find(w => {
          const weekStart = new Date(w.startDate);
          const weekEnd = new Date(w.endDate);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
        
        if (week) {
          const weekKey = `week-${week.week}`;
          if (!weeklySteps[weekKey]) {
            weeklySteps[weekKey] = 0;
          }
          weeklySteps[weekKey] += entry.steps;
        }
      });
    } else {
      // Fall back to calendar weeks
      filteredHealthData.forEach(entry => {
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
    }

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
    // If no round context, use existing round/week from workout data
    if (!roundStartDate) {
      const weeks = {};
      
      workoutHistory.forEach(session => {
        if (session.exercises.length === 0) return;
        
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
    }

    // Round-based calculation: group by round weeks
    const allWeeks = getAllRoundWeeks(roundStartDate);
    const weeks = {};
    
    workoutHistory.forEach(session => {
      if (session.exercises.length === 0) return;
      
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      // Find which round week this session belongs to
      const week = allWeeks.find(w => {
        const weekStart = new Date(w.startDate);
        const weekEnd = new Date(w.endDate);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      if (week) {
        const weekKey = `week-${week.week}`;
        if (!weeks[weekKey]) {
          weeks[weekKey] = { count: 0, round: session.round || 1, week: week.week };
        }
        weeks[weekKey].count++;
      }
    });

    return Object.entries(weeks)
      .sort((a, b) => {
        const aWeek = a[1].week;
        const bWeek = b[1].week;
        return bWeek - aWeek;
      })
      .slice(0, 12);
  };

  return {
    getOverallRating,
    getConsistencyScore,
    getProgressScore,
    getStreakBonus,
    getStreakCount,
    getStepGoalScore,
    getExercisePRs,
    getWeeklyConsistency
  };
};
