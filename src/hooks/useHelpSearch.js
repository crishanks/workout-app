import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { getAllTopics } from '../data/helpContent';

const SEARCH_HISTORY_KEY = 'shreddit_search_history';
const MAX_HISTORY_ITEMS = 10;

export const useHelpSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);

  // Initialize Fuse.js for fuzzy search with optimized configuration
  const fuse = useMemo(() => {
    const topics = getAllTopics();
    return new Fuse(topics, {
      keys: [
        { name: 'title', weight: 2 },        // Highest weight for title matches
        { name: 'keywords', weight: 1.5 },   // High weight for keyword matches
        { name: 'content', weight: 1 }       // Standard weight for content matches
      ],
      threshold: 0.4,                        // Balance between fuzzy and exact matching
      includeScore: true,                    // Include match score for ranking
      includeMatches: true,                  // Include match positions for highlighting
      minMatchCharLength: 2,                 // Minimum 2 characters to match
      ignoreLocation: true,                  // Search entire string, not just beginning
      findAllMatches: true                   // Find all matching patterns
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

  // Perform search with real-time filtering
  const searchResults = useMemo(() => {
    let results = getAllTopics();

    // Apply category filter first
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(topic => topic.categoryId === selectedCategory);
    }

    // Apply search query with fuzzy matching
    if (searchQuery.trim()) {
      const fuseResults = fuse.search(searchQuery);
      const searchedTopicIds = fuseResults.map(result => result.item.id);
      
      // Filter results to match search, maintaining category filter
      results = results.filter(topic => searchedTopicIds.includes(topic.id));
      
      // Sort by relevance score (lower score = better match)
      results.sort((a, b) => {
        const scoreA = fuseResults.find(r => r.item.id === a.id)?.score || 1;
        const scoreB = fuseResults.find(r => r.item.id === b.id)?.score || 1;
        return scoreA - scoreB;
      });
    }

    return results;
  }, [searchQuery, selectedCategory, fuse]);

  // Get match highlights for a specific topic
  const getHighlights = (topicId) => {
    if (!searchQuery.trim()) return [];
    
    const fuseResults = fuse.search(searchQuery);
    const result = fuseResults.find(r => r.item.id === topicId);
    
    return result?.matches || [];
  };

  // Highlight search terms in text
  const highlightText = (text, topicId) => {
    if (!searchQuery.trim() || !text) return text;
    
    const highlights = getHighlights(topicId);
    if (!highlights.length) return text;

    // Collect all match indices for the text
    const matchIndices = [];
    highlights.forEach(match => {
      if (match.value === text && match.indices) {
        match.indices.forEach(([start, end]) => {
          matchIndices.push({ start, end });
        });
      }
    });

    if (!matchIndices.length) return text;

    // Sort and merge overlapping indices
    matchIndices.sort((a, b) => a.start - b.start);
    const merged = [];
    let current = matchIndices[0];

    for (let i = 1; i < matchIndices.length; i++) {
      if (matchIndices[i].start <= current.end + 1) {
        current.end = Math.max(current.end, matchIndices[i].end);
      } else {
        merged.push(current);
        current = matchIndices[i];
      }
    }
    merged.push(current);

    // Build highlighted text
    let result = '';
    let lastIndex = 0;

    merged.forEach(({ start, end }) => {
      result += text.slice(lastIndex, start);
      result += `<mark>${text.slice(start, end + 1)}</mark>`;
      lastIndex = end + 1;
    });
    result += text.slice(lastIndex);

    return result;
  };

  // Check if there are no results
  const hasNoResults = searchQuery.trim() && searchResults.length === 0;

  // Check if showing all topics (empty search state)
  const showingAllTopics = !searchQuery.trim();

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
    hasNoResults,
    showingAllTopics,
    handleSearchChange,
    handleCategoryChange,
    clearSearch,
    addToSearchHistory,
    clearSearchHistory,
    executeHistorySearch,
    highlightText,
    getHighlights
  };
};
