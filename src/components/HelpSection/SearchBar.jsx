import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

const SEARCH_HISTORY_KEY = 'shreddit_search_history';
const MAX_HISTORY_ITEMS = 10;

export const SearchBar = ({ value, onChange, onClear, placeholder = 'Search help topics...' }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchBarRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load search history from localStorage on mount
  useEffect(() => {
    const loadSearchHistory = () => {
      try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSearchHistory(parsed.queries || []);
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    loadSearchHistory();
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
  const addToHistory = (query) => {
    if (!query.trim()) return;

    setSearchHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      // Add new query at the beginning
      const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveSearchHistory(updated);
      return updated;
    });
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Update input immediately for responsive UI
    onChange(newValue);

    // Debounce the search execution (for potential heavy operations)
    debounceTimerRef.current = setTimeout(() => {
      // If user has typed something and then cleared it, don't add to history
      if (newValue.trim()) {
        addToHistory(newValue);
      }
    }, 300);
  };

  // Handle focus - show history dropdown
  const handleFocus = () => {
    setShowHistory(true);
  };

  // Handle blur - hide history dropdown (with delay for click handling)
  const handleBlur = () => {
    setTimeout(() => {
      setShowHistory(false);
    }, 200);
  };

  // Handle history item click
  const handleHistoryClick = (query) => {
    onChange(query);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // Handle clear button
  const handleClearClick = () => {
    onClear();
    inputRef.current?.focus();
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="search-bar-container" ref={searchBarRef}>
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label="Search help topics"
        />
        {value && (
          <button
            className="search-clear-btn"
            onClick={handleClearClick}
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showHistory && searchHistory.length > 0 && !value && (
        <div className="search-history-dropdown">
          <div className="search-history-header">Recent Searches</div>
          <ul className="search-history-list">
            {searchHistory.map((query, index) => (
              <li key={index} className="search-history-item">
                <button
                  className="search-history-btn"
                  onClick={() => handleHistoryClick(query)}
                >
                  <Search size={16} />
                  <span>{query}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
