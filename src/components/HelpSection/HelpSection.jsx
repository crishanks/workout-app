import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { CategoryList } from './CategoryList';
import { helpContent } from '../../data/helpContent';
import './HelpSection.css';

export const HelpSection = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
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
      
      <div className="help-category-container">
        <CategoryList
          categories={helpContent.categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>
      
      <main className="help-content">
        <div className="help-scroll-container">
          {/* Content will be added in subsequent tasks */}
          <p className="help-placeholder">
            {searchQuery 
              ? `Searching for: "${searchQuery}"` 
              : selectedCategory === 'all' 
                ? 'Showing all topics...' 
                : `Showing topics from: ${helpContent.categories.find(c => c.id === selectedCategory)?.name || 'Unknown'}`
            }
          </p>
        </div>
      </main>
    </div>
  );
};
