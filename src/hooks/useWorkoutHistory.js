import { useState, useEffect } from 'react';

export const useWorkoutHistory = () => {
  const [workoutHistory, setWorkoutHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('shreddit-history');
    if (saved) {
      setWorkoutHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (history) => {
    setWorkoutHistory(history);
    localStorage.setItem('shreddit-history', JSON.stringify(history));
  };

  const logSet = (dayName, currentWeek, currentRound, exerciseName, setIndex, weight, reps) => {
    const today = new Date().toLocaleDateString();
    const sessionKey = `${dayName}-${today}`;
    const existingSession = workoutHistory.find(s => s.sessionKey === sessionKey);

    if (existingSession) {
      const updatedHistory = workoutHistory.map(session => {
        if (session.sessionKey === sessionKey) {
          const exercises = [...session.exercises];
          const exIdx = exercises.findIndex(e => e.name === exerciseName);

          if (exIdx >= 0) {
            exercises[exIdx].sets[setIndex] = { weight, reps };
          } else {
            exercises.push({
              name: exerciseName,
              sets: { [setIndex]: { weight, reps } }
            });
          }

          return { ...session, exercises, timestamp: new Date().toISOString() };
        }
        return session;
      });
      saveHistory(updatedHistory);
    } else {
      const newSession = {
        sessionKey,
        week: currentWeek,
        round: currentRound,
        day: dayName,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        exercises: [{
          name: exerciseName,
          sets: { [setIndex]: { weight, reps } }
        }]
      };
      saveHistory([...workoutHistory, newSession]);
    }
  };

  const getLastWorkout = (dayName, exerciseName) => {
    const previousSessions = workoutHistory
      .filter(s => s.day === dayName && s.sessionKey !== `${dayName}-${new Date().toLocaleDateString()}`)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (previousSessions.length === 0) return null;

    const lastSession = previousSessions[0];
    const exercise = lastSession.exercises.find(e => e.name === exerciseName);
    return exercise || null;
  };

  const getCurrentLog = (dayName, exerciseName, setIndex) => {
    const sessionKey = `${dayName}-${new Date().toLocaleDateString()}`;
    const session = workoutHistory.find(s => s.sessionKey === sessionKey);
    const exercise = session?.exercises.find(e => e.name === exerciseName);
    return exercise?.sets[setIndex] || { weight: '', reps: '' };
  };

  const getDayHistory = (dayName) => {
    return workoutHistory
      .filter(s => s.day === dayName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getAllRounds = (dayName) => {
    const sessions = workoutHistory.filter(s => s.day === dayName);
    const rounds = {};
    
    sessions.forEach(session => {
      const round = session.round || 1;
      if (!rounds[round]) {
        rounds[round] = [];
      }
      rounds[round].push(session);
    });

    Object.keys(rounds).forEach(round => {
      rounds[round].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });

    return rounds;
  };

  const clearRoundData = (roundNumber) => {
    const filteredHistory = workoutHistory.filter(s => s.round !== roundNumber);
    saveHistory(filteredHistory);
  };

  return {
    workoutHistory,
    logSet,
    getLastWorkout,
    getCurrentLog,
    getDayHistory,
    getAllRounds,
    clearRoundData
  };
};
