import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Icon from './AppIcon';

const MilestoneConfiguration = ({ 
  milestones = [], 
  onUpdate,
  errors = {},
  disabled = false
}) => {
  const [localMilestones, setLocalMilestones] = useState(milestones);

  useEffect(() => {
    setLocalMilestones(milestones);
  }, [milestones]);

  const validateMilestones = (milestoneList) => {
    const errors = [];
    
    // Check count
    if (milestoneList.length < 1 || milestoneList.length > 10) {
      errors.push('Must have between 1 and 10 milestones');
    }

    // Check for 100% milestone
    if (!milestoneList.find(m => m.percentage === 100)) {
      errors.push('Must include a 100% milestone');
    }

    // Check sorting and gaps
    for (let i = 1; i < milestoneList.length; i++) {
      const gap = milestoneList[i].percentage - milestoneList[i-1].percentage;
      if (gap < 5) {
        errors.push('Milestones must have at least 5% gap between them');
      }
      if (gap > 50) {
        errors.push('Milestones cannot have more than 50% gap between them');
      }
    }

    return errors;
  };

  const addMilestone = () => {
    if (localMilestones.length >= 10) return;

    const lastPercentage = localMilestones.length > 0 
      ? localMilestones[localMilestones.length - 1].percentage 
      : 0;

    const newMilestone = {
      percentage: Math.min(lastPercentage + 25, 100),
      claimed: false,
      claim_date: 0,
      amount_claimed: 0
    };

    const updatedMilestones = [...localMilestones, newMilestone].sort((a, b) => a.percentage - b.percentage);
    setLocalMilestones(updatedMilestones);
    onUpdate(updatedMilestones);
  };

  const removeMilestone = (index) => {
    const updatedMilestones = localMilestones.filter((_, i) => i !== index);
    setLocalMilestones(updatedMilestones);
    onUpdate(updatedMilestones);
  };

  const updateMilestonePercentage = (index, percentage) => {
    const value = Math.max(0, Math.min(100, percentage));
    const updatedMilestones = localMilestones.map((m, i) => 
      i === index ? { ...m, percentage: value } : m
    ).sort((a, b) => a.percentage - b.percentage);
    
    setLocalMilestones(updatedMilestones);
    onUpdate(updatedMilestones);
  };

  const validationErrors = validateMilestones(localMilestones);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Funding Milestones
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addMilestone}
          disabled={disabled || localMilestones.length >= 10}
          iconName="Plus"
          iconPosition="left"
        >
          Add Milestone
        </Button>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-error/10 border border-error/20 rounded-medical p-3">
          <ul className="list-disc list-inside text-sm text-error">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {localMilestones.map((milestone, index) => (
          <div 
            key={index}
            className="flex items-center space-x-4 p-3 bg-card border border-border rounded-medical"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={milestone.percentage}
                  onChange={(e) => updateMilestonePercentage(index, parseInt(e.target.value))}
                  min="0"
                  max="100"
                  step="5"
                  disabled={disabled}
                  className="w-20 px-2 py-1 bg-input border border-border rounded-medical text-foreground"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <div className="w-32">
              {milestone.percentage === 100 ? (
                <span className="text-sm text-primary font-medium">Final Milestone</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                  disabled={disabled}
                  className="text-error hover:text-error"
                  iconName="Trash"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {localMilestones.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-medical">
          <Icon name="Flag" size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            Add milestones to track funding progress
          </p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Requirements:</p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Between 1-10 milestones</li>
          <li>Must include 100% milestone</li>
          <li>5-50% gap between milestones</li>
          <li>Milestones must be in ascending order</li>
        </ul>
      </div>
    </div>
  );
};

export default MilestoneConfiguration;