import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { useHealthData } from '../../hooks/useHealthData';
import { WeightChart } from './WeightChart';
import { WeightSummary } from './WeightSummary';
import { WeeklyStepsChart } from './WeeklyStepsChart';
import { CurrentWeekSteps } from './CurrentWeekSteps';
import { ManualEntryForm } from './ManualEntryForm';
import './HealthProgress.css';

export const HealthProgress = ({ onBack }) => {
  const {
    healthData,
    loading,
    error,
    syncFromAppleHealth,
    addManualEntry,
    hasPermissions,
    requestPermissions,
    isIOS,
    getWeightProgress,
    getWeeklySteps
  } = useHealthData();

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

  // Calculate weight progress
  const weightProgress = useMemo(() => getWeightProgress(), [healthData]);

  // Calculate weekly steps for last 12 weeks
  const weeklyStepsData = useMemo(() => {
    const weeks = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - (i * 7));

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const weekData = getWeeklySteps(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      weeks.push(weekData);
    }

    return weeks;
  }, [healthData]);

  // Calculate current week steps
  const currentWeekSteps = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return getWeeklySteps(
      monday.toISOString().split('T')[0],
      sunday.toISOString().split('T')[0]
    );
  }, [healthData]);

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

          {hasData && (
            <>
              <section className="health-section weight-section" aria-labelledby="weight-heading">
                <h2 id="weight-heading">Weight Progress</h2>
                <WeightChart data={weightProgress.entries} />
                <WeightSummary weightProgress={weightProgress} />
              </section>

              <section className="health-section steps-section" aria-labelledby="steps-heading">
                <h2 id="steps-heading">Steps Progress</h2>
                <WeeklyStepsChart data={weeklyStepsData} />
                <CurrentWeekSteps stepsData={currentWeekSteps} />
              </section>
            </>
          )}

          {!hasData && !loading && (
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

        {!hasData && !loading && (
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

        {hasData && (
          <>
            <section className="health-section weight-section" aria-labelledby="weight-heading">
              <h2 id="weight-heading">Weight Progress</h2>
              <WeightChart data={weightProgress.entries} />
              <WeightSummary weightProgress={weightProgress} />
            </section>

            <section className="health-section steps-section" aria-labelledby="steps-heading">
              <h2 id="steps-heading">Steps Progress</h2>
              <WeeklyStepsChart data={weeklyStepsData} />
              <CurrentWeekSteps stepsData={currentWeekSteps} />
            </section>
          </>
        )}
      </main>
    </div>
  );
};
