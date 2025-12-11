import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({
  selectedRequests = [],
  onBulkAction,
  onClearSelection,
  className = ''
}) => {
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const actionOptions = [
    { value: '', label: 'Select bulk action...' },
    { value: 'approve', label: 'Approve Selected' },
    { value: 'reject', label: 'Reject Selected' },
    { value: 'mark_priority', label: 'Mark as Priority' },
    { value: 'assign_reviewer', label: 'Assign Reviewer' },
    { value: 'export', label: 'Export Data' }
  ];

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRequests?.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onBulkAction(bulkAction, selectedRequests);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedRequests?.length === 0) return null;

  return (
    <div className={`bg-primary/5 border border-primary/20 rounded-medical p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-medical flex items-center justify-center text-sm font-medium">
              {selectedRequests?.length}
            </div>
            <span className="text-sm font-medium text-card-foreground">
              {selectedRequests?.length} request{selectedRequests?.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              options={actionOptions}
              value={bulkAction}
              onChange={setBulkAction}
              placeholder="Choose action"
              className="min-w-48"
            />
            
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAction}
              loading={isProcessing}
              disabled={!bulkAction}
              iconName="Play"
              iconPosition="left"
            >
              Apply
            </Button>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
        >
          Clear Selection
        </Button>
      </div>
      {bulkAction && (
        <div className="mt-3 p-3 bg-muted/30 rounded-medical">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-card-foreground">
              {bulkAction === 'approve' && (
                <span>This will approve all selected campaigns and send notifications to patients.</span>
              )}
              {bulkAction === 'reject' && (
                <span>This will reject all selected campaigns. Patients will be notified with rejection reasons.</span>
              )}
              {bulkAction === 'mark_priority' && (
                <span>Selected campaigns will be marked as high priority for faster processing.</span>
              )}
              {bulkAction === 'assign_reviewer' && (
                <span>Assign selected campaigns to a specific reviewer for processing.</span>
              )}
              {bulkAction === 'export' && (
                <span>Export selected campaign data to CSV format for external analysis.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;