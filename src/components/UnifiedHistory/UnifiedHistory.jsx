import { useState } from 'react';
import { useSupabaseWorkoutHistory } from '../../hooks/useSupabaseWorkoutHistory';
import { useHealthData } from '../../hooks/useHealthData';
import { useRoundManager } from '../../hooks/useRoundManager';
import { useStats } from '../../hooks/useStats';
import TimelineView from './TimelineView';
import RoundsView from './RoundsView';
import EditModal from './EditModal';
import DeleteModal from './DeleteModal';
import './UnifiedHistory.css';

const UnifiedHistory = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [editingSession, setEditingSession] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Integrate existing hooks
  const { workoutHistory, loading: workoutLoading, updateSession, deleteSession } = useSupabaseWorkoutHistory();
  const { healthData, loading: healthLoading, getWeeklyHealthMetrics } = useHealthData();
  const roundManager = useRoundManager();
  const stats = useStats(workoutHistory, healthData, roundManager.roundData?.startDate);

  const loading = workoutLoading || healthLoading;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleKeyDown = (e, tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tab);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs = ['timeline', 'rounds', 'analytics'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      handleTabChange(tabs[nextIndex]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs = ['timeline', 'rounds', 'analytics'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      handleTabChange(tabs[prevIndex]);
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
  };

  const handleSaveEdit = async (updatedSession) => {
    try {
      await updateSession(updatedSession);
      setEditingSession(null);
    } catch (error) {
      console.error('Error saving session:', error);
      throw error; // Re-throw to let EditModal handle the error display
    }
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
  };

  const handleDeleteSession = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteSession(sessionToDelete.id);
      // Success - close modal
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      setDeleteError(error.message || 'Failed to delete workout. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setSessionToDelete(null);
      setDeleteError(null);
    }
  };

  const handleRoundSelect = (round) => {
    setSelectedRound(round);
  };

  return (
    <div className="unified-history">
      <header className="unified-history-header">
        <button className="back-button" onClick={onBack} aria-label="Go back to main view">
          ← Back
        </button>
        <h1>History</h1>
      </header>

      <nav className="tab-navigation" role="tablist" aria-label="History view tabs">
        <button
          id="timeline-tab"
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => handleTabChange('timeline')}
          onKeyDown={(e) => handleKeyDown(e, 'timeline')}
          role="tab"
          aria-selected={activeTab === 'timeline'}
          aria-controls="timeline-panel"
          tabIndex={activeTab === 'timeline' ? 0 : -1}
        >
          Timeline
        </button>
        <button
          id="rounds-tab"
          className={`tab-button ${activeTab === 'rounds' ? 'active' : ''}`}
          onClick={() => handleTabChange('rounds')}
          onKeyDown={(e) => handleKeyDown(e, 'rounds')}
          role="tab"
          aria-selected={activeTab === 'rounds'}
          aria-controls="rounds-panel"
          tabIndex={activeTab === 'rounds' ? 0 : -1}
        >
          Rounds
        </button>
        <button
          id="analytics-tab"
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabChange('analytics')}
          onKeyDown={(e) => handleKeyDown(e, 'analytics')}
          role="tab"
          aria-selected={activeTab === 'analytics'}
          aria-controls="analytics-panel"
          tabIndex={activeTab === 'analytics' ? 0 : -1}
        >
          Analytics
        </button>
      </nav>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {activeTab === 'timeline' && 'Timeline view selected'}
        {activeTab === 'rounds' && 'Rounds view selected'}
        {activeTab === 'analytics' && 'Analytics view selected'}
      </div>

      <main className="tab-content">
        {loading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <div className="spinner" aria-label="Loading history data"></div>
            <p>Loading history...</p>
          </div>
        ) : (
          <>
            {activeTab === 'timeline' && (
              <section id="timeline-panel" role="tabpanel" aria-labelledby="timeline-tab">
                <TimelineView
                  workoutHistory={workoutHistory}
                  healthData={healthData}
                  selectedRound={selectedRound}
                  onRoundSelect={handleRoundSelect}
                  onEditSession={handleEditSession}
                  onDeleteSession={handleDeleteSession}
                  getWeeklyHealthMetrics={getWeeklyHealthMetrics}
                />
              </section>
            )}

            {activeTab === 'rounds' && (
              <section id="rounds-panel" role="tabpanel" aria-labelledby="rounds-tab">
                <RoundsView
                  workoutHistory={workoutHistory}
                  healthData={healthData}
                  roundManager={roundManager}
                />
              </section>
            )}

            {activeTab === 'analytics' && (
              <section id="analytics-panel" role="tabpanel" aria-labelledby="analytics-tab">
                <div className="empty-state">
                  <div className="empty-state-icon" aria-hidden="true">📊</div>
                  <p>Analytics View</p>
                  <p className="empty-state-subtitle">Coming soon! Track your progress with detailed charts and insights.</p>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {editingSession && (
        <EditModal
          session={editingSession}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {showDeleteModal && sessionToDelete && (
        <DeleteModal
          session={sessionToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
};

export default UnifiedHistory;
