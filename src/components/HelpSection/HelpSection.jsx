import { useState } from 'react';
import { SearchBar } from './SearchBar';
import './HelpSection.css';

export const HelpSection = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="help-section">
      <header className="help-header">
        <button className="help-back-btn" onClick={onClose}>
          ← Back
        </button>
        <h1>Help & Reference</h1>
      </header>
      
      <div className="help-search-container">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder="Search help topics..."
        />
      </div>
      
      <main className="help-content">
        <div className="help-scroll-container">
          {/* Content will be added in subsequent tasks */}
          <p className="help-placeholder">
            {searchQuery ? `Searching for: "${searchQuery}"` : 'Help content coming soon...'}
          </p>
        </div>
      </main>
    </div>
  );
};
