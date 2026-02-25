import { memo } from 'react';
import './RoundContextHeader.css';

export const RoundContextHeader = memo(({ round, week, loading }) => {
  if (loading) {
    return (
      <div className="round-context-header loading" role="status" aria-live="polite">
        <div className="context-skeleton"></div>
      </div>
    );
  }

  if (!round || !week) {
    return (
      <div className="round-context-header no-round" role="status" aria-live="polite">
        <p className="context-message">No active round. Start a round to track your progress.</p>
      </div>
    );
  }

  return (
    <div className="round-context-header" role="region" aria-label="Current round context">
      <div className="context-info">
        <span className="context-label">Round {round}</span>
        <span className="context-separator">•</span>
        <span className="context-label">Week {week} of 12</span>
      </div>
    </div>
  );
});
