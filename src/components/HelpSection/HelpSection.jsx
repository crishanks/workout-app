import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { CategoryList } from './CategoryList';
import { TopicCard } from './TopicCard';
import { ErrorBoundary } from './ErrorBoundary';
import { UserIdManager } from '../UserIdManager/UserIdManager';
import { helpContent, getTopicById } from '../../data/helpContent';
import { useHelpSearch } from '../../hooks/useHelpSearch';
import './HelpSection.css';

export const HelpSection = ({ isOpen, onClose }) => {
  const [expandedTopicId, setExpandedTopicId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentError, setContentError] = useState(null);
  
  const {
    searchQuery,
    searchResults,
    selectedCategory,
    hasNoResults,
    handleSearchChange,
    handleCategoryChange,
    clearSearch
  } = useHelpSearch();

  // Simulate initial content load and validate content structure
  useEffect(() => {
    if (isOpen) {
      const loadContent = async () => {
        try {
          setIsLoading(true);
          setContentError(null);
          
          // Simulate network delay for initial load
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Validate content structure
          if (!helpContent || !helpContent.categories || !Array.isArray(helpContent.categories)) {
            throw new Error('Invalid help content structure');
          }
          
          if (helpContent.categories.length === 0) {
            throw new Error('No help content available');
          }
          
          // Validate each category has required fields
          helpContent.categories.forEach(category => {
            if (!category.id || !category.name || !Array.isArray(category.topics)) {
              throw new Error('Malformed category data');
            }
          });
          
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to load help content:', error);
          setContentError(error.message);
          setIsLoading(false);
        }
      };
      
      loadContent();
    }
  }, [isOpen]);

  const handleRetry = () => {
    setContentError(null);
    setIsLoading(true);
    // Trigger reload by toggling state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

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
    <ErrorBoundary onReset={handleRetry}>
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
        
        <UserIdManager />
        
        <div className="help-category-container">
          <CategoryList
            categories={helpContent.categories}
            selectedCategory={selectedCategory || 'all'}
            onCategorySelect={handleCategorySelect}
          />
        </div>
        
        <main className="help-content">
          <div className="help-scroll-container">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading help content...</p>
              </div>
            ) : contentError ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Failed to load content</h3>
                <p>{contentError}</p>
                <button onClick={handleRetry} className="error-retry-btn">
                  Retry
                </button>
              </div>
            ) : hasNoResults ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>No topics found matching "{searchQuery}"</p>
                <p className="no-results-hint">Try different keywords or browse by category</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No content available</h3>
                <p>There are no help topics in this category yet.</p>
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
    </ErrorBoundary>
  );
};
