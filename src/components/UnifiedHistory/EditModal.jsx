import { useState, useEffect } from 'react';
import './EditModal.css';

const EditModal = ({ session, onSave, onCancel }) => {
  const [editedData, setEditedData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState(null);

  // Initialize edited data from session
  useEffect(() => {
    if (session) {
      setEditedData({
        ...session,
        exercises: JSON.parse(JSON.stringify(session.exercises)) // Deep clone
      });
    }
  }, [session]);

  if (!editedData) return null;

  const handleDateChange = (newDate) => {
    // Validate date is not in the future
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      setErrors(prev => ({ ...prev, date: 'Date cannot be in the future' }));
      return;
    }
    
    setErrors(prev => ({ ...prev, date: null }));
    setEditedData(prev => ({ ...prev, date: newDate }));
  };

  const handleSetChange = (exerciseName, setIdx, field, value) => {
    // Validate input
    if (value !== '') {
      if (field === 'weight') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          setErrors(prev => ({ 
            ...prev, 
            [`${exerciseName}-${setIdx}-${field}`]: 'Weight must be a positive number' 
          }));
          return;
        }
      } else if (field === 'reps') {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue <= 0 || !Number.isInteger(parseFloat(value))) {
          setErrors(prev => ({ 
            ...prev, 
            [`${exerciseName}-${setIdx}-${field}`]: 'Reps must be a positive integer' 
          }));
          return;
        }
      }
    }
    
    setErrors(prev => ({ ...prev, [`${exerciseName}-${setIdx}-${field}`]: null }));

    setEditedData(prev => {
      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.name === exerciseName) {
          const updatedSets = { ...exercise.sets };
          if (!updatedSets[setIdx]) {
            updatedSets[setIdx] = { weight: '', reps: '' };
          }
          updatedSets[setIdx] = {
            ...updatedSets[setIdx],
            [field]: value === '' ? '' : (field === 'weight' ? parseFloat(value) : parseInt(value))
          };
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let hasData = false;

    // Check if at least one set has data
    editedData.exercises.forEach(exercise => {
      Object.entries(exercise.sets).forEach(([setIdx, setData]) => {
        if (setData.weight !== '' || setData.reps !== '') {
          hasData = true;
        }
      });
    });

    if (!hasData) {
      newErrors.form = 'At least one set must have data';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSave = async () => {
    try {
      setSaveError(null);
      await onSave(editedData);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error saving session:', error);
      setSaveError('Failed to save changes. Please try again.');
      setShowConfirmation(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateForInput = (dateStr) => {
    // Handle both ISO datetime strings and date-only strings
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };

  return (
    <>
      <div className="edit-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
        <div className="edit-modal">
          <header className="edit-modal-header">
            <button 
              className="edit-modal-back" 
              onClick={onCancel}
              aria-label="Cancel editing and go back"
            >
              ← Back
            </button>
            <h2 id="edit-modal-title">Edit Workout</h2>
          </header>

          <div className="edit-modal-content">
            <section className="edit-session-info" aria-label="Workout information">
              <h3>{editedData.day}</h3>
              <p>Round {editedData.round}, Week {editedData.week}</p>
            </section>

            <section className="edit-date-section">
              <label htmlFor="workout-date">Workout Date</label>
              <input
                id="workout-date"
                type="date"
                value={formatDateForInput(editedData.date)}
                onChange={(e) => handleDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                aria-describedby={errors.date ? "date-error" : undefined}
                aria-invalid={errors.date ? "true" : "false"}
              />
              {errors.date && <span id="date-error" className="error-message" role="alert">{errors.date}</span>}
            </section>

            <section className="edit-exercises-section" aria-label="Exercise sets">
              <h3>Exercises</h3>
              {editedData.exercises.map((exercise, exerciseIdx) => (
                <article key={exerciseIdx} className="edit-exercise-card">
                  <h4>{exercise.name}</h4>
                  <div className="edit-sets-list">
                    {Object.entries(exercise.sets).map(([setIdx, setData]) => (
                      <div key={setIdx} className="edit-set-row">
                        <span className="set-label">
                          {setIdx.startsWith('warmup') ? 'Warmup' : `Set ${parseInt(setIdx) + 1}`}
                        </span>
                        <div className="set-inputs">
                          <div className="input-group">
                            <input
                              type="number"
                              value={setData.weight}
                              onChange={(e) => handleSetChange(exercise.name, setIdx, 'weight', e.target.value)}
                              placeholder="Weight"
                              step="0.5"
                              min="0"
                              aria-label={`Weight for ${exercise.name} ${setIdx.startsWith('warmup') ? 'warmup' : `set ${parseInt(setIdx) + 1}`}`}
                              aria-describedby={errors[`${exercise.name}-${setIdx}-weight`] ? `${exercise.name}-${setIdx}-weight-error` : undefined}
                              aria-invalid={errors[`${exercise.name}-${setIdx}-weight`] ? "true" : "false"}
                            />
                            <span className="input-unit" aria-hidden="true">lbs</span>
                          </div>
                          <span className="input-separator" aria-hidden="true">×</span>
                          <div className="input-group">
                            <input
                              type="number"
                              value={setData.reps}
                              onChange={(e) => handleSetChange(exercise.name, setIdx, 'reps', e.target.value)}
                              placeholder="Reps"
                              step="1"
                              min="0"
                              aria-label={`Reps for ${exercise.name} ${setIdx.startsWith('warmup') ? 'warmup' : `set ${parseInt(setIdx) + 1}`}`}
                              aria-describedby={errors[`${exercise.name}-${setIdx}-reps`] ? `${exercise.name}-${setIdx}-reps-error` : undefined}
                              aria-invalid={errors[`${exercise.name}-${setIdx}-reps`] ? "true" : "false"}
                            />
                            <span className="input-unit" aria-hidden="true">reps</span>
                          </div>
                        </div>
                        {(errors[`${exercise.name}-${setIdx}-weight`] || errors[`${exercise.name}-${setIdx}-reps`]) && (
                          <span 
                            id={`${exercise.name}-${setIdx}-${errors[`${exercise.name}-${setIdx}-weight`] ? 'weight' : 'reps'}-error`}
                            className="error-message" 
                            role="alert"
                          >
                            {errors[`${exercise.name}-${setIdx}-weight`] || errors[`${exercise.name}-${setIdx}-reps`]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            {errors.form && (
              <div className="form-error-message" role="alert">{errors.form}</div>
            )}

            {saveError && (
              <div className="save-error-message" role="alert">{saveError}</div>
            )}
          </div>

          <footer className="edit-modal-footer">
            <button 
              className="save-button" 
              onClick={handleSaveClick}
              aria-label="Save workout changes"
            >
              Save Changes
            </button>
          </footer>
        </div>
      </div>

      {showConfirmation && (
        <div className="confirmation-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="confirmation-modal">
            <h3 id="confirm-modal-title">Confirm Changes</h3>
            <p>Are you sure you want to save these changes to your workout?</p>
            <div className="confirmation-details">
              <p><strong>{editedData.day}</strong></p>
              <p>{formatDate(editedData.date)}</p>
              <p>Round {editedData.round}, Week {editedData.week}</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="cancel-button" 
                onClick={handleCancelConfirmation}
                aria-label="Cancel save"
              >
                Cancel
              </button>
              <button 
                className="confirm-button" 
                onClick={handleConfirmSave}
                aria-label="Confirm and save changes"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditModal;
