import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getBrowserFingerprint } from '../utils/browserFingerprint';

export const useSupabaseWorkoutHistory = () => {
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const saveTimeoutRef = useRef({});

    // Helper function to get local date in YYYY-MM-DD format (not UTC)
    const getLocalDateString = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get browser fingerprint as user ID (no localStorage)
    useEffect(() => {
        const id = getBrowserFingerprint();
        setUserId(id);
        console.log('Using browser fingerprint as user ID:', id);
    }, []);

    // Load workout history from Supabase only
    useEffect(() => {
        if (!userId) return;

        const loadHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from('workout_sessions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('timestamp', { ascending: false });

                if (error) throw error;

                // Add sessionKey to loaded data
                const enrichedData = (data || []).map(session => {
                    // Handle both ISO datetime strings and date-only strings
                    const dateStr = session.date.includes('T')
                        ? session.date.split('T')[0]
                        : session.date;
                    const dateObj = new Date(dateStr + 'T12:00:00'); // Parse as noon local time
                    return {
                        ...session,
                        sessionKey: `${session.day}-${dateObj.toLocaleDateString()}`
                    };
                });
                setWorkoutHistory(enrichedData);
            } catch (error) {
                console.error('Error loading workout history:', error);
                setWorkoutHistory([]);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [userId]);

    const logSet = async (dayName, currentWeek, currentRound, exerciseName, setIndex, weight, reps) => {
        if (!userId) return;

        // Find existing session for this day in the current week/round
        let session = workoutHistory.find(s =>
            s.day === dayName &&
            s.week === currentWeek &&
            s.round === currentRound
        );

        const dateStr = getLocalDateString(); // Use local date, not UTC
        const today = new Date().toLocaleDateString();
        const sessionKey = `${dayName}-${today}`;

        if (!session) {
            // Create new session only if none exists for this week
            session = {
                sessionKey,
                user_id: userId,
                day: dayName,
                date: dateStr, // Store as local date string
                week: currentWeek,
                round: currentRound,
                timestamp: new Date().toISOString(),
                exercises: []
            };
        } else {
            // Use existing session but update sessionKey for local state tracking
            session.sessionKey = session.sessionKey || sessionKey;
        }

        // Find or create exercise
        let exercise = session.exercises.find(e => e.name === exerciseName);
        if (!exercise) {
            exercise = { name: exerciseName, sets: {} };
            session.exercises = [...session.exercises, exercise];
        } else {
            session.exercises = session.exercises.map(e =>
                e.name === exerciseName ? exercise : e
            );
        }

        // Update set - handle empty values
        const weightValue = weight === '' ? '' : parseFloat(weight);
        const repsValue = reps === '' ? '' : parseInt(reps);

        // Only save if both values are present
        if (weightValue !== '' && repsValue !== '') {
            exercise.sets[setIndex] = { weight: weightValue, reps: repsValue };
        } else if (weightValue !== '' || repsValue !== '') {
            // Partial data - save what we have
            exercise.sets[setIndex] = {
                weight: weightValue === '' ? '' : weightValue,
                reps: repsValue === '' ? '' : repsValue
            };
        } else {
            // Both empty - remove the set if it exists
            if (exercise.sets[setIndex]) {
                delete exercise.sets[setIndex];
            }
            // If no sets remain, don't save to DB yet
            if (Object.keys(exercise.sets).length === 0) {
                // Update local state only
                const updatedHistory = session.id
                    ? workoutHistory.map(s => s.id === session.id ? session : s)
                    : workoutHistory.some(s => s.sessionKey === sessionKey)
                        ? workoutHistory.map(s => s.sessionKey === sessionKey ? session : s)
                        : [session, ...workoutHistory];
                setWorkoutHistory(updatedHistory);
                return;
            }
        }

        // Update local state immediately for responsive UI
        const updatedHistory = session.id
            ? workoutHistory.map(s => (s.sessionKey === sessionKey || (s.id && s.id === session.id)) ? session : s)
            : workoutHistory.some(s => s.sessionKey === sessionKey)
                ? workoutHistory.map(s => s.sessionKey === sessionKey ? session : s)
                : [session, ...workoutHistory];
        setWorkoutHistory(updatedHistory);

        // Debounce database save
        const saveKey = `${sessionKey}-${exerciseName}-${setIndex}`;
        if (saveTimeoutRef.current[saveKey]) {
            clearTimeout(saveTimeoutRef.current[saveKey]);
        }

        saveTimeoutRef.current[saveKey] = setTimeout(async () => {
            try {
                // Check if session exists in database by week/round/day (not by date)
                const { data: existing } = await supabase
                    .from('workout_sessions')
                    .select('id, date')
                    .eq('user_id', userId)
                    .eq('day', dayName)
                    .eq('week', currentWeek)
                    .eq('round', currentRound)
                    .maybeSingle();

                if (existing) {
                    // Update existing session - keep original date
                    const { error } = await supabase
                        .from('workout_sessions')
                        .update({
                            exercises: session.exercises,
                            timestamp: new Date().toISOString(),
                            week: currentWeek
                        })
                        .eq('id', existing.id);

                    if (error) throw error;

                    session.id = existing.id;
                    session.date = existing.date; // Preserve original date
                } else {
                    // Insert new session with today's date
                    const { data: newSession, error } = await supabase
                        .from('workout_sessions')
                        .insert([{
                            user_id: userId,
                            day: dayName,
                            date: dateStr,
                            week: currentWeek,
                            round: currentRound,
                            timestamp: new Date().toISOString(),
                            exercises: session.exercises
                        }])
                        .select()
                        .single();

                    if (error) throw error;
                    session.id = newSession.id;
                    session.date = newSession.date;

                    // Update local state with the new ID
                    setWorkoutHistory(prev => prev.map(s =>
                        s.sessionKey === sessionKey ? { ...s, id: newSession.id, date: newSession.date } : s
                    ));
                }
            } catch (error) {
                console.error('Error saving to Supabase:', error);
            }

            delete saveTimeoutRef.current[saveKey];
        }, 500); // 500ms debounce
    };

    const getLastWorkout = (dayName, exerciseName) => {
        const today = new Date().toLocaleDateString();
        const previousSessions = workoutHistory
            .filter(s => s.day === dayName && s.sessionKey !== `${dayName}-${today}`)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (previousSessions.length === 0) return null;

        const lastSession = previousSessions[0];
        const exercise = lastSession.exercises.find(e => e.name === exerciseName);
        return exercise || null;
    };

    const getCurrentLog = (dayName, exerciseName, setIndex, currentWeek, currentRound) => {
        // Find the most recent session for this day in the current week and round
        const currentWeekSessions = workoutHistory.filter(s =>
            s.day === dayName &&
            s.week === currentWeek &&
            s.round === currentRound
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (currentWeekSessions.length === 0) {
            return { weight: '', reps: '' };
        }

        const session = currentWeekSessions[0];
        const exercise = session?.exercises.find(e => e.name === exerciseName);
        return exercise?.sets[setIndex] || { weight: '', reps: '' };
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

    const clearRoundData = async (round) => {
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('user_id', userId)
                .eq('round', round);

            if (error) throw error;

            const updatedHistory = workoutHistory.filter(w => w.round !== round);
            setWorkoutHistory(updatedHistory);
        } catch (error) {
            console.error('Error clearing round data:', error);
            // Just update local state, no localStorage fallback
            const updatedHistory = workoutHistory.filter(w => w.round !== round);
            setWorkoutHistory(updatedHistory);
        }
    };

    const updateSession = async (updatedSession) => {
        if (!userId) return;

        try {
            if (updatedSession.id) {
                const updateData = {
                    exercises: updatedSession.exercises,
                    timestamp: updatedSession.timestamp
                };

                // If date is provided and different, update it too
                if (updatedSession.date) {
                    updateData.date = updatedSession.date;
                }

                const { error } = await supabase
                    .from('workout_sessions')
                    .update(updateData)
                    .eq('id', updatedSession.id);

                if (error) throw error;
            }

            const updatedHistory = workoutHistory.map(s => {
                if (s.sessionKey === updatedSession.sessionKey || s.id === updatedSession.id) {
                    const updated = { ...s, ...updatedSession };
                    // Update sessionKey if date changed
                    if (updatedSession.date && updatedSession.date !== s.date) {
                        const dateStr = updatedSession.date.includes('T')
                            ? updatedSession.date.split('T')[0]
                            : updatedSession.date;
                        const dateObj = new Date(dateStr + 'T12:00:00');
                        updated.sessionKey = `${updatedSession.day}-${dateObj.toLocaleDateString()}`;
                    }
                    return updated;
                }
                return s;
            });

            setWorkoutHistory(updatedHistory);
        } catch (error) {
            console.error('Error updating session:', error);
            // Just update local state, no localStorage fallback
            const updatedHistory = workoutHistory.map(s =>
                s.sessionKey === updatedSession.sessionKey ? updatedSession : s
            );
            setWorkoutHistory(updatedHistory);
        }
    };

    const deleteSession = async (sessionId) => {
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

            const updatedHistory = workoutHistory.filter(s => s.id !== sessionId);
            setWorkoutHistory(updatedHistory);
        } catch (error) {
            console.error('Error deleting session:', error);
            // Just update local state
            const updatedHistory = workoutHistory.filter(s => s.id !== sessionId);
            setWorkoutHistory(updatedHistory);
        }
    };

    const updateSessionDate = async (sessionId, newDate) => {
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('workout_sessions')
                .update({ date: newDate })
                .eq('id', sessionId);

            if (error) throw error;

            // Update local state
            const updatedHistory = workoutHistory.map(s => {
                if (s.id === sessionId) {
                    const updatedSession = { ...s, date: newDate };
                    const dateObj = new Date(newDate + 'T12:00:00');
                    updatedSession.sessionKey = `${s.day}-${dateObj.toLocaleDateString()}`;
                    return updatedSession;
                }
                return s;
            });
            setWorkoutHistory(updatedHistory);
        } catch (error) {
            console.error('Error updating session date:', error);
        }
    };

    // Expose debug functions globally
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.fixWorkoutDate = (sessionId, newDate) => {
                updateSessionDate(sessionId, newDate);
                console.log(`Updated workout ${sessionId} to date ${newDate}`);
            };

            window.listWorkouts = () => {
                const sessions = workoutHistory.map(s => ({
                    id: s.id,
                    day: s.day,
                    date: s.date,
                    round: s.round,
                    week: s.week,
                    exercises: s.exercises.length
                }));

                if (sessions.length === 0) {
                    console.log('No workouts found. Make sure data is loaded.');
                    return [];
                }

                console.table(sessions);
                return sessions;
            };
        }
    }, [workoutHistory]);

    const getLastPerformedExercise = (dayName) => {
        const today = new Date().toLocaleDateString();
        const previousSessions = workoutHistory
            .filter(s => s.day === dayName && s.sessionKey !== `${dayName}-${today}`)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (previousSessions.length === 0) return null;

        const lastSession = previousSessions[0];
        return lastSession.exercises.map(e => e.name);
    };

    return {
        workoutHistory,
        loading,
        logSet,
        getLastWorkout,
        getCurrentLog,
        getAllRounds,
        clearRoundData,
        updateSession,
        deleteSession,
        updateSessionDate,
        getLastPerformedExercise
    };
};
