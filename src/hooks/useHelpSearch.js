import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { getAllTopics } from '../data/helpContent';

const SEARCH_HISTORY_KEY = 'shreddit_search_history';
const MAX_HISTORY_ITEMS = 10;

export const useHelpSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    const topics = getAllTopics();
    return new Fuse(topics, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'keywords', weight: 1.5 },
        { name: 'content', weight: 1 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    });
  }, []);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(parsed.queries || []);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (queries) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify({
        queries,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Add query to search history
  const addToSearchHistory = (query) => {
    if (!query || query.trim().length < 2) return;

    const trimmedQuery = query.trim();
    
    // Remove duplicate if exists and add to front
    const updatedHistory = [
      trimmedQuery,
      ...searchHistory.filter(q => q !== trimmedQuery)
    ].slice(0, MAX_HISTORY_ITEMS);

    setSearchHistory(updatedHistory);
    saveSearchHistory(updatedHistory);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // Perform search
  const searchResults = useMemo(() => {
    let results = getAllTopics();

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(topic => topic.categoryId === selectedCategory);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery);
      const searchedTopicIds = fuseResults.map(result => result.item.id);
      
      // Filter by category first, then by search results
      results = results.filter(topic => searchedTopicIds.includes(topic.id));
    }

    return results;
  }, [searchQuery, selectedCategory, fuse]);

  // Handle search query change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Execute search from history
  const executeHistorySearch = (query) => {
    setSearchQuery(query);
  };

  return {
    searchQuery,
    searchResults,
    selectedCategory,
    searchHistory,
    handleSearchChange,
    handleCategoryChange,
    clearSearch,
    addToSearchHistory,
    clearSearchHistory,
    executeHistorySearch
  };
};
