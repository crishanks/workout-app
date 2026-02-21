import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseWorkoutHistory = () => {
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Get or create anonymous user ID
    useEffect(() => {
        let id = localStorage.getItem('supabase_user_id');
        if (!id) {
            id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('supabase_user_id', id);
        }
        setUserId(id);
    }, []);

    // Load workout history from Supabase and migrate localStorage data
    useEffect(() => {
        if (!userId) return;

        const loadHistory = async () => {
            try {
                // Load from Supabase
                const { data, error } = await supabase
                    .from('workout_sessions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('timestamp', { ascending: false });

                if (error) throw error;

                // Check for localStorage data to migrate
                const localData = localStorage.getItem('shreddit-history');
                if (localData && (!data || data.length === 0)) {
                    const localHistory = JSON.parse(localData);

                    // Migrate to Supabase
                    if (localHistory.length > 0) {
                        const migratedSessions = localHistory.map(session => ({
                            user_id: userId,
                            day: session.day,
                            date: session.date.split('T')[0],
                            week: session.week,
                            round: session.round || 1,
                            timestamp: session.timestamp,
                            exercises: session.exercises
                        }));

                        const { error: insertError } = await supabase
                            .from('workout_sessions')
                            .insert(migratedSessions);

                        if (!insertError) {
                            console.log('Successfully migrated localStorage data to Supabase');
                            // Reload data
                            const { data: newData } = await supabase
                                .from('workout_sessions')
                                .select('*')
                                .eq('user_id', userId)
                                .order('timestamp', { ascending: false });

                            setWorkoutHistory(newData || []);
                        }
                    }
                } else {
                    setWorkoutHistory(data || []);
                }

                // Keep localStorage as backup
                if (data) {
                    localStorage.setItem('shreddit-history', JSON.stringify(data));
                }
            } catch (error) {
                console.error('Error loading workout history:', error);
                // Fallback to localStorage
                const localData = localStorage.getItem('shreddit-history');
                if (localData) {
                    setWorkoutHistory(JSON.parse(localData));
                }
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

        // Update set
        exercise.sets[setIndex] = { weight: parseFloat(weight), reps: parseInt(reps) };

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
            }

            // Update local state
            const updatedHistory = existing
                ? workoutHistory.map(s =>
                    (s.sessionKey === sessionKey || (s.id && s.id === existing.id)) ? session : s
                )
                : [session, ...workoutHistory];

            setWorkoutHistory(updatedHistory);
            localStorage.setItem('shreddit-history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            // Fallback to localStorage only
            const updatedHistory = session.id
                ? workoutHistory.map(s => s.id === session.id ? session : s)
                : [session, ...workoutHistory];
            setWorkoutHistory(updatedHistory);
            localStorage.setItem('shreddit-history', JSON.stringify(updatedHistory));
        }
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
            localStorage.setItem('shreddit-history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error clearing round data:', error);
            // Fallback to localStorage
            const updatedHistory = workoutHistory.filter(w => w.round !== round);
            setWorkoutHistory(updatedHistory);
            localStorage.setItem('shreddit-history', JSON.stringify(updatedHistory));
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
            localStorage.setItem('shreddit-history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Error updating session:', error);
            // Fallback to localStorage
            const updatedHistory = workoutHistory.map(s =>
                s.sessionKey === updatedSession.sessionKey ? updatedSession : s
            );
            setWorkoutHistory(updatedHistory);
            localStorage.setItem('shreddit-history', JSON.stringify(updatedHistory));
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
