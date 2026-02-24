import { useState } from 'react';
import './ManualEntryForm.css';

export const ManualEntryForm = ({ onSubmit, loading, error }) => {
  const [date, setDate] = useState('');
  const [steps, setSteps] = useState('');
  const [weight, setWeight] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const success = await onSubmit(date, steps || null, weight || null);
    
    if (success) {
      // Reset form
      setDate('');
      setSteps('');
      setWeight('');
      setShowForm(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!showForm) {
    return (
      <div className="manual-entry-prompt">
        <button 
          className="show-form-btn" 
          onClick={() => setShowForm(true)}
          aria-label="Show manual entry form to add health data"
        >
          + Add Manual Entry
        </button>
      </div>
    );
  }

  return (
    <div className="manual-entry-form" role="region" aria-labelledby="form-heading">
      <h3 id="form-heading">Add Health Data</h3>
      <form onSubmit={handleSubmit} aria-label="Manual health data entry form">
        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getTodayDate()}
            required
            aria-required="true"
            aria-describedby="date-hint"
          />
          <span id="date-hint" className="field-hint" aria-live="polite">
            Required field. Select a date up to today.
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="steps">Steps</label>
          <input
            type="number"
            id="steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="e.g., 10000"
            min="0"
            max="200000"
            aria-describedby="steps-hint"
          />
          <span id="steps-hint" className="field-hint">Optional (0 - 200,000)</span>
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (lbs)</label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 180.5"
            min="50"
            max="1000"
            step="0.1"
            aria-describedby="weight-hint"
          />
          <span id="weight-hint" className="field-hint">Optional (50 - 1000 lbs)</span>
        </div>

        {error && (
          <div className="form-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={() => {
              setShowForm(false);
              setDate('');
              setSteps('');
              setWeight('');
            }}
            disabled={loading}
            aria-label="Cancel and close form"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || !date || (!steps && !weight)}
            aria-label={loading ? 'Saving health data entry' : 'Save health data entry'}
            aria-busy={loading}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};
