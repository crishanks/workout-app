import { useState, useEffect } from 'react';

export const useRoundManager = () => {
    const [roundData, setRoundData] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('shreddit-round');
        if (saved) {
            setRoundData(JSON.parse(saved));
        }
    }, []);

    const saveRoundData = (data) => {
        setRoundData(data);
        localStorage.setItem('shreddit-round', JSON.stringify(data));
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
