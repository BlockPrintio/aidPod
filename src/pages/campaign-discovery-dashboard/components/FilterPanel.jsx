import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onClose,
  className = '' 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const medicalSpecialties = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'emergency', label: 'Emergency Care' },
    { value: 'transplant', label: 'Transplant' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'rehabilitation', label: 'Rehabilitation' }
  ];

  const urgencyLevels = [
    { value: 'critical', label: 'Critical' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'routine', label: 'Routine' }
  ];

  const verificationStatuses = [
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending Verification' },
    { value: 'unverified', label: 'Unverified' }
  ];

  const fundingRanges = [
    { value: '0-1000', label: 'Under 1,000 ADA' },
    { value: '1000-5000', label: '1,000 - 5,000 ADA' },
    { value: '5000-10000', label: '5,000 - 10,000 ADA' },
    { value: '10000-25000', label: '10,000 - 25,000 ADA' },
    { value: '25000+', label: 'Over 25,000 ADA' }
  ];

  const timeframes = [
    { value: '1', label: 'Ending in 1 day' },
    { value: '7', label: 'Ending in 1 week' },
    { value: '30', label: 'Ending in 1 month' },
    { value: '90', label: 'Ending in 3 months' },
    { value: 'all', label: 'All timeframes' }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      searchQuery: '',
      medicalSpecialty: [],
      urgency: [],
      verificationStatus: [],
      fundingRange: '',
      timeframe: 'all',
      location: '',
      minAmount: '',
      maxAmount: '',
      hasVerification: false,
      isEmergency: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters?.searchQuery) count++;
    if (localFilters?.medicalSpecialty?.length > 0) count++;
    if (localFilters?.urgency?.length > 0) count++;
    if (localFilters?.verificationStatus?.length > 0) count++;
    if (localFilters?.fundingRange) count++;
    if (localFilters?.timeframe !== 'all') count++;
    if (localFilters?.location) count++;
    if (localFilters?.minAmount || localFilters?.maxAmount) count++;
    if (localFilters?.hasVerification) count++;
    if (localFilters?.isEmergency) count++;
    return count;
  };

  return (
    <div className={`bg-card border border-border rounded-medical shadow-medical-md ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="font-semibold text-card-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>
      </div>
      {/* Filter Content */}
      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Search */}
        <div>
          <Input
            label="Search Campaigns"
            type="search"
            placeholder="Search by patient name, condition, or story..."
            value={localFilters?.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
          />
        </div>

        {/* Medical Specialty */}
        <div>
          <Select
            label="Medical Specialty"
            placeholder="Select specialties..."
            multiple
            searchable
            options={medicalSpecialties}
            value={localFilters?.medicalSpecialty}
            onChange={(value) => handleFilterChange('medicalSpecialty', value)}
          />
        </div>

        {/* Urgency Level */}
        <div>
          <Select
            label="Urgency Level"
            placeholder="Select urgency..."
            multiple
            options={urgencyLevels}
            value={localFilters?.urgency}
            onChange={(value) => handleFilterChange('urgency', value)}
          />
        </div>

        {/* Verification Status */}
        <div>
          <Select
            label="Verification Status"
            placeholder="Select verification status..."
            multiple
            options={verificationStatuses}
            value={localFilters?.verificationStatus}
            onChange={(value) => handleFilterChange('verificationStatus', value)}
          />
        </div>

        {/* Funding Range */}
        <div>
          <Select
            label="Funding Goal Range"
            placeholder="Select funding range..."
            options={fundingRanges}
            value={localFilters?.fundingRange}
            onChange={(value) => handleFilterChange('fundingRange', value)}
          />
        </div>

        {/* Custom Amount Range */}
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Custom Amount Range (ADA)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min amount"
              value={localFilters?.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e?.target?.value)}
            />
            <Input
              type="number"
              placeholder="Max amount"
              value={localFilters?.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e?.target?.value)}
            />
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <Select
            label="Campaign Deadline"
            options={timeframes}
            value={localFilters?.timeframe}
            onChange={(value) => handleFilterChange('timeframe', value)}
          />
        </div>

        {/* Location */}
        <div>
          <Input
            label="Location"
            placeholder="City, State, or Country"
            value={localFilters?.location}
            onChange={(e) => handleFilterChange('location', e?.target?.value)}
          />
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-card-foreground">
            Additional Options
          </label>
          
          <Checkbox
            label="Only verified campaigns"
            description="Show only hospital-verified campaigns"
            checked={localFilters?.hasVerification}
            onChange={(e) => handleFilterChange('hasVerification', e?.target?.checked)}
          />
          
          <Checkbox
            label="Emergency cases only"
            description="Show only critical and urgent cases"
            checked={localFilters?.isEmergency}
            onChange={(e) => handleFilterChange('isEmergency', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Filter Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyFilters}
            iconName="Check"
            iconPosition="left"
            className="flex-1"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;