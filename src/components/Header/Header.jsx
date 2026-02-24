import { useState } from 'react';
import { RotateCcw, HelpCircle, Calendar } from 'lucide-react';
import './Header.css';

export const Header = ({ currentWeek, currentRound, programWeek, onRestart, canRestart, onHelpClick, roundStartDate, onUpdateStartDate }) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [editedDate, setEditedDate] = useState('');
  // Helper to parse date as local date (not UTC)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    return new Date(datePart + 'T12:00:00');
  };

  // Calculate end date (84 days after start)
  const getEndDate = (startDate) => {
    if (!startDate) return null;
    const start = parseLocalDate(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 83); // 83 days later = 84 days total (12 weeks)
    return end;
  };

  const startDate = roundStartDate ? parseLocalDate(roundStartDate) : null;
  const endDate = roundStartDate ? getEndDate(roundStartDate) : null;

  const handleEditDate = () => {
    if (startDate) {
      // Format date as YYYY-MM-DD for input
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      setEditedDate(`${year}-${month}-${day}`);
    }
    setShowDateModal(true);
  };

  const handleSaveDate = () => {
    if (editedDate && onUpdateStartDate) {
      // Convert to ISO string at midnight local time
      const newDate = new Date(editedDate + 'T00:00:00');
      onUpdateStartDate(newDate.toISOString());
    }
    setShowDateModal(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Shreddit</h1>
        <div className="round-info">
          <div className="round-indicator">
            Round {currentRound}, Week {programWeek} of 12
          </div>
          {startDate && endDate && (
            <div className="round-dates-container">
              <div className="round-dates">
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <button className="edit-date-btn" onClick={handleEditDate} title="Edit Start Date">
                <Calendar size={14} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="header-buttons">
        <button className="header-help-btn" onClick={onHelpClick} title="Help & Reference">
          <HelpCircle size={22} strokeWidth={2} />
        </button>
        {canRestart && (
          <button className="header-restart-btn" onClick={onRestart} title="Restart Round">
            <RotateCcw size={22} strokeWidth={2} />
          </button>
        )}
      </div>

      {showDateModal && (
        <div className="date-modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="date-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Round Start Date</h3>
            <p className="date-modal-info">
              Changing the start date will automatically adjust the end date to maintain the 12-week duration.
            </p>
            <input
              type="date"
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
              className="date-input"
            />
            <div className="date-modal-buttons">
              <button className="cancel-btn" onClick={() => setShowDateModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveDate}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
