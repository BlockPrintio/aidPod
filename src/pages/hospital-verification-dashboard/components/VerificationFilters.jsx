import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const VerificationFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalRequests = 0,
  filteredCount = 0,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const specialtyOptions = [
    { value: 'all', label: 'All Specialties' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyOptions = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'in_review', label: 'In Review' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'urgency', label: 'By Urgency' },
    { value: 'amount_high', label: 'Amount: High to Low' },
    { value: 'amount_low', label: 'Amount: Low to High' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    return Object.entries(filters)?.some(([key, value]) => {
      if (key === 'search') return value?.trim() !== '';
      if (key === 'minAmount' || key === 'maxAmount') return value > 0;
      return value !== 'all' && value !== '';
    });
  };

  return (
    <div className={`bg-card border border-border rounded-medical shadow-medical-sm ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon name="Filter" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">Filters</h3>
            {hasActiveFilters() && (
              <div className="bg-primary/10 text-primary px-2 py-1 rounded-medical text-xs font-medium">
                {filteredCount} of {totalRequests}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                iconName="X"
                iconPosition="left"
              >
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Input
            type="search"
            placeholder="Search campaigns..."
            value={filters?.search || ''}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
          
          <Select
            options={urgencyOptions}
            value={filters?.urgency || 'all'}
            onChange={(value) => handleFilterChange('urgency', value)}
            placeholder="Select urgency"
          />
          
          <Select
            options={statusOptions}
            value={filters?.status || 'all'}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Select status"
          />
          
          <Select
            options={sortOptions}
            value={filters?.sortBy || 'newest'}
            onChange={(value) => handleFilterChange('sortBy', value)}
            placeholder="Sort by"
          />
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                label="Medical Specialty"
                options={specialtyOptions}
                value={filters?.specialty || 'all'}
                onChange={(value) => handleFilterChange('specialty', value)}
              />
              
              <Input
                type="number"
                label="Min Amount (ADA)"
                placeholder="0"
                value={filters?.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', parseFloat(e?.target?.value) || 0)}
              />
              
              <Input
                type="number"
                label="Max Amount (ADA)"
                placeholder="No limit"
                value={filters?.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', parseFloat(e?.target?.value) || 0)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Submitted After"
                value={filters?.submittedAfter || ''}
                onChange={(e) => handleFilterChange('submittedAfter', e?.target?.value)}
              />
              
              <Input
                type="date"
                label="Submitted Before"
                value={filters?.submittedBefore || ''}
                onChange={(e) => handleFilterChange('submittedBefore', e?.target?.value)}
              />
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Info" size={14} />
              <span>
                Showing {filteredCount} of {totalRequests} verification requests
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationFilters;