import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DraftSaveIndicator = ({ formData, onSave, onLoad }) => {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formData)?.length > 0) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, autoSaveEnabled]);

  const handleAutoSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Mock save to localStorage
      localStorage.setItem('medchain_campaign_draft', JSON.stringify({
        ...formData,
        lastSaved: new Date()?.toISOString()
      }));
      
      setTimeout(() => {
        setSaveStatus('saved');
        setLastSaved(new Date());
      }, 1000);
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const handleManualSave = () => {
    handleAutoSave();
  };

  const handleLoadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('medchain_campaign_draft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        onLoad(draftData);
        setLastSaved(new Date(draftData.lastSaved));
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSaved) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return lastSaved?.toLocaleDateString();
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return { name: 'Loader2', className: 'text-primary animate-spin' };
      case 'saved':
        return { name: 'Check', className: 'text-success' };
      case 'error':
        return { name: 'AlertCircle', className: 'text-error' };
      default:
        return { name: 'Save', className: 'text-muted-foreground' };
    }
  };

  const statusIcon = getSaveStatusIcon();

  return (
    <div className="bg-card border border-border rounded-medical p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name={statusIcon?.name} size={16} className={statusIcon?.className} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">
                {saveStatus === 'saving' && 'Saving draft...'}
                {saveStatus === 'saved' && 'Draft saved'}
                {saveStatus === 'error' && 'Save failed'}
              </span>
              {saveStatus === 'saved' && (
                <span className="text-xs text-muted-foreground">
                  Last saved: {formatLastSaved()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <label className="flex items-center space-x-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e?.target?.checked)}
                  className="w-3 h-3 text-primary"
                />
                <span>Auto-save every 30 seconds</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadDraft}
            iconName="Upload"
            iconPosition="left"
            className="text-xs"
          >
            Load Draft
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            loading={saveStatus === 'saving'}
            iconName="Save"
            iconPosition="left"
            className="text-xs"
          >
            Save Now
          </Button>
        </div>
      </div>
      {saveStatus === 'error' && (
        <div className="mt-3 p-2 bg-error/5 border border-error/20 rounded text-xs text-error">
          <div className="flex items-center space-x-1">
            <Icon name="AlertCircle" size={12} />
            <span>Failed to save draft. Please try again or check your connection.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftSaveIndicator;