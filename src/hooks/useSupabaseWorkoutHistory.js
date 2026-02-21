import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getBrowserFingerprint } from '../utils/browserFingerprint';

export const useSupabaseWorkoutHistory = () => {
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const saveTimeoutRef = useRef({});

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
                const enrichedData = (data || []).map(session => ({
                    ...session,
                    sessionKey: `${session.day}-${new Date(session.date).toLocaleDateString()}`
                }));
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

        const today = new Date().toLocaleDateString();
        const sessionKey = `${dayName}-${today}`;

        // Find existing session
        let session = workoutHistory.find(s => s.sessionKey === sessionKey ||
            (s.day === dayName && s.date.split('T')[0] === new Date().toISOString().split('T')[0] && s.round === currentRound));

        const dateStr = new Date().toISOString().split('T')[0];

        if (!session) {
            session = {
                sessionKey,
                user_id: userId,
                day: dayName,
                date: new Date().toISOString(),
                week: currentWeek,
                round: currentRound,
                timestamp: new Date().toISOString(),
                exercises: []
            };
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
                // Check if session exists in database
                const { data: existing } = await supabase
                    .from('workout_sessions')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('day', dayName)
                    .eq('date', dateStr)
                    .eq('round', currentRound)
                    .maybeSingle();

                if (existing) {
                    // Update existing session
                    const { error } = await supabase
                        .from('workout_sessions')
                        .update({
                            exercises: session.exercises,
                            timestamp: session.timestamp,
                            week: currentWeek
                        })
                        .eq('id', existing.id);

                    if (error) throw error;

                    session.id = existing.id;
                } else {
                    // Insert new session
                    const { data: newSession, error } = await supabase
                        .from('workout_sessions')
                        .insert([{
                            user_id: userId,
                            day: dayName,
                            date: dateStr,
                            week: currentWeek,
                            round: currentRound,
                            timestamp: session.timestamp,
                            exercises: session.exercises
                        }])
                        .select()
                        .single();

                    if (error) throw error;
                    session.id = newSession.id;

                    // Update local state with the new ID
                    setWorkoutHistory(prev => prev.map(s =>
                        s.sessionKey === sessionKey ? { ...s, id: newSession.id } : s
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

    const getCurrentLog = (dayName, exerciseName, setIndex) => {
        const sessionKey = `${dayName}-${new Date().toLocaleDateString()}`;
        const session = workoutHistory.find(s => s.sessionKey === sessionKey ||
            (s.day === dayName && s.date.split('T')[0] === new Date().toISOString().split('T')[0]));
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
                const { error } = await supabase
                    .from('workout_sessions')
                    .update({
                        exercises: updatedSession.exercises,
                        timestamp: updatedSession.timestamp
                    })
                    .eq('id', updatedSession.id);

                if (error) throw error;
            }

            const updatedHistory = workoutHistory.map(s =>
                s.sessionKey === updatedSession.sessionKey || s.id === updatedSession.id
                    ? updatedSession
                    : s
            );

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
        getLastPerformedExercise
    };
};
