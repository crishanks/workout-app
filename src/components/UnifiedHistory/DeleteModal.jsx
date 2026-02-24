import { useMemo } from 'react';
import './DeleteModal.css';

const DeleteModal = ({ session, onConfirm, onCancel, isDeleting, error }) => {
  // Format date for display
  const formattedDate = useMemo(() => {
    const date = new Date(session.date);
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }, [session.date]);

  // Count total exercises and sets
  const { exerciseCount, totalSets } = useMemo(() => {
    if (!session.exercises || session.exercises.length === 0) {
      return { exerciseCount: 0, totalSets: 0 };
    }

    const exerciseCount = session.exercises.length;
    const totalSets = session.exercises.reduce((sum, exercise) => {
      return sum + Object.keys(exercise.sets || {}).length;
    }, 0);

    return { exerciseCount, totalSets };
  }, [session.exercises]);

  return (
    <div className="delete-modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <header className="delete-modal-header">
          <h2 id="delete-modal-title">Delete Workout?</h2>
        </header>

        <div className="delete-modal-content">
          <p className="delete-warning">
            This action cannot be undone. Are you sure you want to delete this workout?
          </p>

          <section className="session-details" aria-label="Workout details">
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formattedDate}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Day:</span>
              <span className="detail-value">{session.day}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Round & Week:</span>
              <span className="detail-value">Round {session.round}, Week {session.week}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Exercises:</span>
              <span className="detail-value">{exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Sets:</span>
              <span className="detail-value">{totalSets} {totalSets === 1 ? 'set' : 'sets'}</span>
            </div>
          </section>

          {error && (
            <div className="delete-error" role="alert">
              <p>Error: {error}</p>
            </div>
          )}
        </div>

        <footer className="delete-modal-actions">
          <button
            className="cancel-button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            className="confirm-delete-button"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-label={isDeleting ? "Deleting workout" : "Confirm delete workout"}
          >
            {isDeleting ? 'Deleting...' : 'Delete Workout'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteModal;
