import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getBrowserFingerprint } from '../utils/browserFingerprint';

export const useRoundManager = () => {
    const [roundData, setRoundData] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get browser fingerprint as user ID
    useEffect(() => {
        const id = getBrowserFingerprint();
        setUserId(id);
    }, []);

    // Load round data from Supabase
    useEffect(() => {
        if (!userId) return;

        const loadRoundData = async () => {
            try {
                const { data, error } = await supabase
                    .from('round_data')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

                // Convert snake_case to camelCase for app use
                if (data) {
                    setRoundData({
                        round: data.round,
                        startDate: data.start_date,
                        endDate: data.end_date,
                        isActive: data.is_active
                    });
                } else {
                    setRoundData(null);
                }
            } catch (error) {
                console.error('Error loading round data:', error);
                setRoundData(null);
            } finally {
                setLoading(false);
            }
        };

        loadRoundData();
    }, [userId]);

    const saveRoundData = async (data) => {
        if (!userId) return;

        setRoundData(data);

        try {
            // Convert camelCase to snake_case for database
            const dbData = {
                user_id: userId,
                round: data.round,
                start_date: data.startDate,
                end_date: data.endDate,
                is_active: data.isActive
            };

            const { error } = await supabase
                .from('round_data')
                .upsert(dbData);

            if (error) throw error;
        } catch (error) {
            console.error('Error saving round data:', error);
        }
    };

    const startRound = (roundNumber) => {
        const data = {
            round: roundNumber,
            startDate: new Date().toISOString(),
            endDate: null,
            isActive: true
        };
        saveRoundData(data);
    };

    const restartCurrentRound = () => {
        if (!roundData) return;

        const data = {
            round: roundData.round,
            startDate: null,
            endDate: null,
            isActive: false
        };
        saveRoundData(data);
    };

    const endRound = () => {
        if (!roundData) return;

        const data = {
            ...roundData,
            endDate: new Date().toISOString(),
            isActive: false
        };
        saveRoundData(data);
    };

    const getCurrentWeekInRound = () => {
        if (!roundData?.isActive) return null;

        const startDate = new Date(roundData.startDate);
        // Reset to start of day for consistent week boundaries
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysDiff / 7) + 1;

        return Math.min(weekNumber, 12);
    };

    const isRoundComplete = () => {
        if (!roundData?.isActive) return false;

        const startDate = new Date(roundData.startDate);
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

        // Round is complete after 84 days (12 weeks * 7 days)
        return daysDiff >= 84;
    };

    const canRestart = () => {
        return roundData?.isActive === true && !isRoundComplete();
    };

    const hasActiveRound = () => {
        return roundData?.isActive === true;
    };

    const getCurrentRound = () => {
        return roundData?.round || 0;
    };

    return {
        roundData,
        loading,
        startRound,
        restartCurrentRound,
        endRound,
        getCurrentWeekInRound,
        isRoundComplete,
        hasActiveRound,
        getCurrentRound,
        canRestart
    };
};
