import { RotateCcw, HelpCircle } from 'lucide-react';
import './Header.css';

export const Header = ({ currentWeek, currentRound, programWeek, onRestart, canRestart, onHelpClick, roundStartDate }) => {
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

  return (
    <header className="header">
      <div className="header-content">
        <h1>Shreddit</h1>
        <div className="round-info">
          <div className="round-indicator">
            Round {currentRound}, Week {programWeek} of 12
          </div>
          {startDate && endDate && (
            <div className="round-dates">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
    </header>
  );
};
