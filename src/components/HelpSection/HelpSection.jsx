import { useState } from 'react';
import './HelpSection.css';

export const HelpSection = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-section">
      <header className="help-header">
        <button className="help-back-btn" onClick={onClose}>
          ← Back
        </button>
        <h1>Help & Reference</h1>
      </header>
      
      <main className="help-content">
        <div className="help-scroll-container">
          {/* Content will be added in subsequent tasks */}
          <p className="help-placeholder">Help content coming soon...</p>
        </div>
      </main>
    </div>
  );
};
