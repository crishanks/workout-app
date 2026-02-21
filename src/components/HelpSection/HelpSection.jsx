import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { CategoryList } from './CategoryList';
import { TopicCard } from './TopicCard';
import { helpContent, getTopicsByCategory, getTopicById } from '../../data/helpContent';
import { useHelpSearch } from '../../hooks/useHelpSearch';
import './HelpSection.css';

export const HelpSection = ({ isOpen, onClose }) => {
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  
  const {
    searchQuery,
    searchResults,
    selectedCategory,
    hasNoResults,
    handleSearchChange,
    handleCategoryChange,
    clearSearch
  } = useHelpSearch();

  if (!isOpen) return null;

  const handleTopicToggle = (topicId) => {
    setExpandedTopicId(expandedTopicId === topicId ? null : topicId);
  };

  const handleRelatedTopicClick = (relatedTopicId) => {
    const topic = getTopicById(relatedTopicId);
    if (topic) {
      // Switch to the category of the related topic
      handleCategoryChange(topic.categoryId);
      // Expand the related topic
      setExpandedTopicId(relatedTopicId);
      // Scroll to top to see the expanded topic
      document.querySelector('.help-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (categoryId) => {
    handleCategoryChange(categoryId);
    setExpandedTopicId(null); // Collapse any expanded topic when changing category
  };

  const handleSearchChangeWrapper = (value) => {
    handleSearchChange(value);
    setExpandedTopicId(null); // Collapse any expanded topic when searching
  };

  const handleSearchClear = () => {
    clearSearch();
    setExpandedTopicId(null);
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
          onChange={handleSearchChangeWrapper}
          onClear={handleSearchClear}
          placeholder="Search help topics..."
        />
      </div>
      
      <div className="help-category-container">
        <CategoryList
          categories={helpContent.categories}
          selectedCategory={selectedCategory || 'all'}
          onCategorySelect={handleCategorySelect}
        />
      </div>
      
      <main className="help-content">
        <div className="help-scroll-container">
          {hasNoResults ? (
            <div className="no-results">
              <p>No topics found matching "{searchQuery}"</p>
              <p className="no-results-hint">Try different keywords or browse by category</p>
            </div>
          ) : (
            <div className="topics-list">
              {searchResults.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isExpanded={expandedTopicId === topic.id}
                  onToggle={() => handleTopicToggle(topic.id)}
                  searchQuery={searchQuery}
                  onRelatedTopicClick={handleRelatedTopicClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
