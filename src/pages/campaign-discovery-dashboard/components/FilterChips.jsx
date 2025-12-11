import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterChips = ({ activeFilters, onRemoveFilter, onClearAll, className = '' }) => {
  const getFilterChips = () => {
    const chips = [];

    // Search query
    if (activeFilters?.searchQuery) {
      chips?.push({
        key: 'searchQuery',
        label: `Search: "${activeFilters?.searchQuery}"`,
        value: activeFilters?.searchQuery
      });
    }

    // Medical specialties
    if (activeFilters?.medicalSpecialty?.length > 0) {
      activeFilters?.medicalSpecialty?.forEach(specialty => {
        chips?.push({
          key: 'medicalSpecialty',
          label: specialty?.charAt(0)?.toUpperCase() + specialty?.slice(1),
          value: specialty
        });
      });
    }

    // Urgency levels
    if (activeFilters?.urgency?.length > 0) {
      activeFilters?.urgency?.forEach(urgency => {
        chips?.push({
          key: 'urgency',
          label: `${urgency?.charAt(0)?.toUpperCase() + urgency?.slice(1)} Priority`,
          value: urgency
        });
      });
    }

    // Verification status
    if (activeFilters?.verificationStatus?.length > 0) {
      activeFilters?.verificationStatus?.forEach(status => {
        chips?.push({
          key: 'verificationStatus',
          label: status?.charAt(0)?.toUpperCase() + status?.slice(1),
          value: status
        });
      });
    }

    // Funding range
    if (activeFilters?.fundingRange) {
      const rangeLabels = {
        '0-1000': 'Under 1K ADA',
        '1000-5000': '1K-5K ADA',
        '5000-10000': '5K-10K ADA',
        '10000-25000': '10K-25K ADA',
        '25000+': 'Over 25K ADA'
      };
      chips?.push({
        key: 'fundingRange',
        label: rangeLabels?.[activeFilters?.fundingRange] || activeFilters?.fundingRange,
        value: activeFilters?.fundingRange
      });
    }

    // Custom amount range
    if (activeFilters?.minAmount || activeFilters?.maxAmount) {
      const min = activeFilters?.minAmount || '0';
      const max = activeFilters?.maxAmount || '∞';
      chips?.push({
        key: 'customRange',
        label: `${min} - ${max} ADA`,
        value: 'customRange'
      });
    }

    // Timeframe
    if (activeFilters?.timeframe && activeFilters?.timeframe !== 'all') {
      const timeframeLabels = {
        '1': 'Ending in 1 day',
        '7': 'Ending in 1 week',
        '30': 'Ending in 1 month',
        '90': 'Ending in 3 months'
      };
      chips?.push({
        key: 'timeframe',
        label: timeframeLabels?.[activeFilters?.timeframe] || `${activeFilters?.timeframe} days`,
        value: activeFilters?.timeframe
      });
    }

    // Location
    if (activeFilters?.location) {
      chips?.push({
        key: 'location',
        label: `Location: ${activeFilters?.location}`,
        value: activeFilters?.location
      });
    }

    // Additional options
    if (activeFilters?.hasVerification) {
      chips?.push({
        key: 'hasVerification',
        label: 'Verified Only',
        value: true
      });
    }

    if (activeFilters?.isEmergency) {
      chips?.push({
        key: 'isEmergency',
        label: 'Emergency Cases',
        value: true
      });
    }

    return chips;
  };

  const filterChips = getFilterChips();

  if (filterChips?.length === 0) {
    return null;
  }

  const handleRemoveChip = (chip) => {
    if (chip?.key === 'customRange') {
      onRemoveFilter('minAmount', '');
      onRemoveFilter('maxAmount', '');
    } else if (Array.isArray(activeFilters?.[chip?.key])) {
      const updatedArray = activeFilters?.[chip?.key]?.filter(item => item !== chip?.value);
      onRemoveFilter(chip?.key, updatedArray);
    } else {
      onRemoveFilter(chip?.key, chip?.key === 'timeframe' ? 'all' : '');
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Icon name="Filter" size={16} />
        <span>Active filters:</span>
      </div>
      {filterChips?.map((chip, index) => (
        <div
          key={`${chip?.key}-${chip?.value}-${index}`}
          className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20"
        >
          <span>{chip?.label}</span>
          <button
            onClick={() => handleRemoveChip(chip)}
            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors duration-200"
            aria-label={`Remove ${chip?.label} filter`}
          >
            <Icon name="X" size={12} />
          </button>
        </div>
      ))}
      {filterChips?.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          iconName="X"
          iconPosition="left"
          className="text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};

export default FilterChips;