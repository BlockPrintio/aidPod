import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SortDropdown = ({ 
  currentSort, 
  onSortChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    {
      value: 'relevance',
      label: 'Most Relevant',
      description: 'Based on search and filters',
      icon: 'Target'
    },
    {
      value: 'urgency',
      label: 'Most Urgent',
      description: 'Critical cases first',
      icon: 'AlertTriangle'
    },
    {
      value: 'progress',
      label: 'Funding Progress',
      description: 'Closest to goal',
      icon: 'TrendingUp'
    },
    {
      value: 'newest',
      label: 'Newest First',
      description: 'Recently created',
      icon: 'Clock'
    },
    {
      value: 'ending-soon',
      label: 'Ending Soon',
      description: 'Deadline approaching',
      icon: 'Calendar'
    },
    {
      value: 'amount-high',
      label: 'Highest Goal',
      description: 'Largest funding needs',
      icon: 'ArrowUp'
    },
    {
      value: 'amount-low',
      label: 'Lowest Goal',
      description: 'Smaller funding needs',
      icon: 'ArrowDown'
    },
    {
      value: 'donors',
      label: 'Most Supported',
      description: 'Most donors',
      icon: 'Users'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentSortOption = () => {
    return sortOptions?.find(option => option?.value === currentSort) || sortOptions?.[0];
  };

  const handleSortSelect = (sortValue) => {
    onSortChange(sortValue);
    setIsOpen(false);
  };

  const currentOption = getCurrentSortOption();

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName={currentOption?.icon}
        iconPosition="left"
        className="justify-between min-w-48"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{currentOption?.label}</span>
          <span className="text-xs text-muted-foreground">{currentOption?.description}</span>
        </div>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-medical shadow-medical-lg z-dropdown">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
              Sort campaigns by
            </div>
            {sortOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => handleSortSelect(option?.value)}
                className={`w-full text-left px-3 py-2 rounded-medical transition-colors duration-200 flex items-center space-x-3 ${
                  currentSort === option?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-popover-foreground hover:bg-muted'
                }`}
              >
                <Icon 
                  name={option?.icon} 
                  size={16} 
                  className={currentSort === option?.value ? 'text-primary-foreground' : 'text-muted-foreground'}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{option?.label}</div>
                  <div className={`text-xs ${
                    currentSort === option?.value 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {option?.description}
                  </div>
                </div>
                {currentSort === option?.value && (
                  <Icon name="Check" size={16} className="text-primary-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;