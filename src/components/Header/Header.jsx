import { RotateCcw } from 'lucide-react';
import './Header.css';

export const Header = ({ currentWeek, currentRound, programWeek, onRestart, canRestart }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Shreddit</h1>
        <div className="round-indicator">
          Round {currentRound}, Week {programWeek} of 12
        </div>
      </div>
      {canRestart && (
        <button className="restart-btn" onClick={onRestart} title="Restart Round">
          <RotateCcw size={22} strokeWidth={2} />
        </button>
      )}
    </header>
  );
};
