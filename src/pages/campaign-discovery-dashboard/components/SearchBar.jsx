import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  onSearchSubmit,
  suggestions = [],
  isLoading = false,
  className = '' 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const recentSearches = [
    'Heart surgery',
    'Cancer treatment',
    'Emergency surgery',
    'Pediatric care',
    'Transplant surgery'
  ];

  const popularSearches = [
    'Cardiology',
    'Oncology',
    'Neurology',
    'Orthopedics',
    'Emergency care'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    onSearchChange(value);
    setShowSuggestions(value?.length > 0 || true);
    setSelectedSuggestionIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    const allSuggestions = [...suggestions, ...recentSearches, ...popularSearches];
    
    if (e?.key === 'ArrowDown') {
      e?.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < allSuggestions?.length - 1 ? prev + 1 : 0
      );
    } else if (e?.key === 'ArrowUp') {
      e?.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : allSuggestions?.length - 1
      );
    } else if (e?.key === 'Enter') {
      e?.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        const selectedSuggestion = allSuggestions?.[selectedSuggestionIndex];
        onSearchChange(selectedSuggestion);
        onSearchSubmit(selectedSuggestion);
      } else {
        onSearchSubmit(searchQuery);
      }
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e?.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    onSearchSubmit(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearchSubmit(searchQuery);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions?.filter(suggestion =>
    suggestion?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const filteredRecentSearches = recentSearches?.filter(search =>
    search?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const filteredPopularSearches = popularSearches?.filter(search =>
    search?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="Search" size={18} className="text-muted-foreground" />
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search campaigns by condition, patient name, or keywords..."
            className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-medical text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center">
            {isLoading ? (
              <div className="pr-3">
                <Icon name="Loader2" size={18} className="text-muted-foreground animate-spin" />
              </div>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                iconName="Search"
                className="mr-1"
                aria-label="Search campaigns"
              />
            )}
          </div>
        </div>
      </form>
      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-medical shadow-medical-lg z-dropdown max-h-96 overflow-y-auto"
        >
          {/* Live Suggestions */}
          {filteredSuggestions?.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                Suggestions
              </div>
              {filteredSuggestions?.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 rounded-medical text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    selectedSuggestionIndex === index
                      ? 'bg-muted text-foreground'
                      : 'text-popover-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="Search" size={14} className="text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {searchQuery === '' && filteredRecentSearches?.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center space-x-1">
                <Icon name="Clock" size={12} />
                <span>Recent Searches</span>
              </div>
              {filteredRecentSearches?.slice(0, 3)?.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full text-left px-3 py-2 rounded-medical text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    selectedSuggestionIndex === filteredSuggestions?.length + index
                      ? 'bg-muted text-foreground'
                      : 'text-popover-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {searchQuery === '' && filteredPopularSearches?.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center space-x-1">
                <Icon name="TrendingUp" size={12} />
                <span>Popular Searches</span>
              </div>
              {filteredPopularSearches?.slice(0, 4)?.map((search, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full text-left px-3 py-2 rounded-medical text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    selectedSuggestionIndex === filteredSuggestions?.length + filteredRecentSearches?.length + index
                      ? 'bg-muted text-foreground'
                      : 'text-popover-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name="TrendingUp" size={14} className="text-muted-foreground" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery && filteredSuggestions?.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Icon name="Search" size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found for "{searchQuery}"</p>
              <p className="text-xs mt-1">Try searching for medical conditions or patient names</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;