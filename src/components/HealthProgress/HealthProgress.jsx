import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useHealthData } from '../../hooks/useHealthData';
import { useRoundData } from '../../hooks/useRoundData';
import { RoundContextHeader } from './RoundContextHeader';
import { WeightChart } from './WeightChart';
import { WeightSummary } from './WeightSummary';
import { WeeklyStepsChart } from './WeeklyStepsChart';
import { CurrentWeekSteps } from './CurrentWeekSteps';
import { ManualEntryForm } from './ManualEntryForm';
import './HealthProgress.css';

export const HealthProgress = ({ onBack }) => {
  const {
    healthData,
    loading: healthLoading,
    error,
    syncFromAppleHealth,
    addManualEntry,
    hasPermissions,
    requestPermissions,
    isIOS,
    getRoundHealthMetrics,
    getCurrentWeekHealthData,
    getWeightProgressForRound
  } = useHealthData();

  const {
    currentRound,
    currentWeek,
    roundStartDate,
    roundEndDate,
    isActive,
    loading: roundLoading
  } = useRoundData();

  const loading = healthLoading || roundLoading;

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);

    // Safety timeout: if sync takes more than 30 seconds, stop the UI
    const timeoutId = setTimeout(() => {
      setSyncing(false);
      setSyncMessage({ type: 'error', text: 'Sync timed out. Please try again.' });
    }, 30000);

    try {
      const success = await syncFromAppleHealth();

      clearTimeout(timeoutId);

      if (success) {
        setSyncMessage({ type: 'success', text: 'Data synced successfully!' });
      } else {
        setSyncMessage({ type: 'error', text: error || 'Failed to sync data' });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      setSyncMessage({ type: 'error', text: 'An error occurred during sync' });
    } finally {
      setSyncing(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setSyncMessage({ type: 'success', text: 'Permissions granted! Syncing data...' });
      setTimeout(() => handleSync(), 500);
    }
  };

  const handleManualEntry = async (date, steps, weight) => {
    const success = await addManualEntry(date, steps, weight);

    if (success) {
      setSyncMessage({ type: 'success', text: 'Entry added successfully!' });
      setTimeout(() => setSyncMessage(null), 3000);
    }

    return success;
  };

  // Calculate round-based health metrics
  const roundHealthMetrics = useMemo(() => {
    if (!roundStartDate || !isActive) {
      return [];
    }
    return getRoundHealthMetrics(roundStartDate);
  }, [roundStartDate, isActive, healthData, getRoundHealthMetrics]);

  // Get current week health data
  const currentWeekData = useMemo(() => {
    if (!roundStartDate || !currentWeek || !isActive) {
      return null;
    }
    return getCurrentWeekHealthData(currentWeek, roundStartDate);
  }, [currentWeek, roundStartDate, isActive, healthData, getCurrentWeekHealthData]);

  // Calculate weight progress for current round
  const weightProgress = useMemo(() => {
    if (!roundStartDate || !isActive) {
      return { entries: [], currentWeight: null, startWeight: null, totalChange: 0, trend: 'stable' };
    }
    return getWeightProgressForRound(roundStartDate, roundEndDate);
  }, [roundStartDate, roundEndDate, isActive, healthData, getWeightProgressForRound]);

  const hasData = healthData && healthData.length > 0;

  // Show permission prompt if on iOS and no permissions
  if (isIOS && !hasPermissions && !loading) {
    return (
      <div className="app">
        <header className="health-header" role="banner">
          <h1>Health Progress</h1>
          <div className="health-header-actions">
            <button
              className="back-btn"
              onClick={onBack}
              aria-label="Go back to main screen"
            >
              ← Back
            </button>
          </div>
        </header>
        <main className="health-content" role="main">
          <div className="permission-prompt" role="region" aria-labelledby="permission-heading">
            <h3 id="permission-heading">Apple Health Access Required</h3>
            <p>
              To track your weight and steps progress, we need access to your Apple Health data.
            </p>
            <p className="permission-benefits">
              This will allow you to:
            </p>
            <ul>
              <li>Automatically sync your weight and steps</li>
              <li>View progress charts and trends</li>
              <li>Track weekly step goals (60,000 steps/week)</li>
              <li>See health metrics alongside your workouts</li>
            </ul>
            <button
              className="permission-btn"
              onClick={handleRequestPermissions}
              aria-label="Grant access to Apple Health data"
            >
              Grant Access
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show platform limitation message for non-iOS
  if (!isIOS) {
    return (
      <div className="app">
        <header className="health-header" role="banner">
          <h1>Health Progress</h1>
          <div className="health-header-actions">
            <button
              className="back-btn"
              onClick={onBack}
              aria-label="Go back to main screen"
            >
              ← Back
            </button>
          </div>
        </header>
        <main className="health-content" role="main">
          <RoundContextHeader round={currentRound} week={currentWeek} loading={roundLoading} />

          <div className="platform-message" role="region" aria-labelledby="platform-heading">
            <h3 id="platform-heading">Manual Entry Mode</h3>
            <p>
              Apple Health integration is only available on iOS devices.
              You can manually enter your health data below.
            </p>
          </div>

          {syncMessage && (
            <div
              className={`sync-message ${syncMessage.type}`}
              role="alert"
              aria-live="polite"
            >
              {syncMessage.text}
            </div>
          )}

          <ManualEntryForm
            onSubmit={handleManualEntry}
            loading={loading}
            error={error}
          />

          {!isActive && !loading && (
            <div className="no-data-message" role="status" aria-live="polite">
              <p>Start a round to begin tracking your health progress.</p>
            </div>
          )}

          {isActive && hasData && (
            <>
              <section className="health-section weight-section" aria-labelledby="weight-heading">
                <h2 id="weight-heading">Weight Progress</h2>
                <WeightChart 
                  data={weightProgress.entries} 
                  roundStartDate={roundStartDate}
                  roundEndDate={roundEndDate}
                />
                <WeightSummary weightProgress={weightProgress} />
              </section>

              <section className="health-section steps-section" aria-labelledby="steps-heading">
                <h2 id="steps-heading">Steps Progress</h2>
                <WeeklyStepsChart 
                  data={roundHealthMetrics} 
                  currentWeek={currentWeek}
                />
                {currentWeekData && (
                  <CurrentWeekSteps 
                    stepsData={currentWeekData.steps}
                    weekNumber={currentWeek}
                    weekBoundaries={{
                      startDate: currentWeekData.startDate,
                      endDate: currentWeekData.endDate
                    }}
                  />
                )}
              </section>
            </>
          )}

          {isActive && !hasData && !loading && (
            <div className="no-data-message" role="status" aria-live="polite">
              <p>No health data yet. Add your first entry above to get started!</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="health-header" role="banner">
        <h1>Health Progress</h1>
        <div className="health-header-actions">
          <button
            className="back-btn"
            onClick={onBack}
            aria-label="Go back to main screen"
          >
            ← Back
          </button>
          {isIOS && hasPermissions && (
            <button
              className="sync-btn"
              onClick={handleSync}
              disabled={syncing}
              aria-label={syncing ? 'Syncing health data' : 'Sync health data from Apple Health'}
              aria-busy={syncing}
            >
              <RefreshCw size={18} className={syncing ? 'spinning' : ''} aria-hidden="true" />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          )}
        </div>
      </header>

      <main className="health-content" role="main">
        <RoundContextHeader round={currentRound} week={currentWeek} loading={roundLoading} />

        {syncMessage && (
          <div
            className={`sync-message ${syncMessage.type}`}
            role="alert"
            aria-live="polite"
          >
            {syncMessage.text}
          </div>
        )}

        {error && !syncMessage && (
          <div className="error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* Manual entry form for weight (since Apple Health weight sync is not available) */}
        <div className="manual-entry-section">
          <ManualEntryForm
            onSubmit={handleManualEntry}
            loading={loading}
            error={error}
            stepsDisabled={true}
          />
        </div>

        {!isActive && !loading && (
          <div className="no-data-prompt" role="region" aria-labelledby="no-round-heading">
            <h3 id="no-round-heading">No Active Round</h3>
            <p>
              Start a round to begin tracking your health progress within your training cycle.
            </p>
          </div>
        )}

        {isActive && !hasData && !loading && (
          <div className="no-data-prompt" role="region" aria-labelledby="no-data-heading">
            <h3 id="no-data-heading">No Health Data</h3>
            <p>
              Sync your Apple Health data to see your progress.
            </p>
            <button
              className="sync-btn-large"
              onClick={handleSync}
              disabled={syncing}
              aria-label={syncing ? 'Syncing health data' : 'Sync health data now'}
              aria-busy={syncing}
            >
              <RefreshCw size={20} className={syncing ? 'spinning' : ''} aria-hidden="true" />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {isActive && hasData && (
          <>
            <section className="health-section weight-section" aria-labelledby="weight-heading">
              <h2 id="weight-heading">Weight Progress</h2>
              <WeightChart 
                data={weightProgress.entries}
                roundStartDate={roundStartDate}
                roundEndDate={roundEndDate}
              />
              <WeightSummary weightProgress={weightProgress} />
            </section>

            <section className="health-section steps-section" aria-labelledby="steps-heading">
              <h2 id="steps-heading">Steps Progress</h2>
              <WeeklyStepsChart 
                data={roundHealthMetrics}
                currentWeek={currentWeek}
              />
              {currentWeekData && (
                <CurrentWeekSteps 
                  stepsData={currentWeekData.steps}
                  weekNumber={currentWeek}
                  weekBoundaries={{
                    startDate: currentWeekData.startDate,
                    endDate: currentWeekData.endDate
                  }}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};
