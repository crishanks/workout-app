import { RotateCcw, HelpCircle } from 'lucide-react';
import './Header.css';

export const Header = ({ currentWeek, currentRound, programWeek, onRestart, canRestart, onHelpClick }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Shreddit</h1>
        <div className="round-indicator">
          Round {currentRound}, Week {programWeek} of 12
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
