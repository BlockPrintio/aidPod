import React from 'react';
import MilestoneConfiguration from '../../../components/MilestoneConfiguration';
import { validateCampaignParameters } from '../../../services/transactionBuilder';

const CampaignConfigurationStep = ({ 
  formData, 
  updateFormData, 
  errors = {}
}) => {
  const handleGoalUpdate = (value) => {
    const numValue = parseInt(value);
    if (numValue < validateCampaignParameters.goal.min) {
      updateFormData('errors', {
        ...errors,
        fundingGoal: `Minimum goal is ${validateCampaignParameters.goal.min / 1_000_000} ADA`
      });
    } else if (numValue > validateCampaignParameters.goal.max) {
      updateFormData('errors', {
        ...errors,
        fundingGoal: `Maximum goal is ${validateCampaignParameters.goal.max / 1_000_000} ADA`
      });
    } else {
      updateFormData('fundingGoal', numValue);
      // Clear error if valid
      const { fundingGoal, ...remainingErrors } = errors;
      updateFormData('errors', remainingErrors);
    }
  };

  const handleDurationUpdate = (value) => {
    const durationMs = parseInt(value) * 24 * 60 * 60 * 1000; // Convert days to ms
    if (durationMs < validateCampaignParameters.duration.min) {
      updateFormData('errors', {
        ...errors,
        duration: 'Minimum duration is 7 days'
      });
    } else if (durationMs > validateCampaignParameters.duration.max) {
      updateFormData('errors', {
        ...errors,
        duration: 'Maximum duration is 365 days'
      });
    } else {
      updateFormData('duration', durationMs);
      // Clear error if valid
      const { duration, ...remainingErrors } = errors;
      updateFormData('errors', remainingErrors);
    }
  };

  const handleMinContributionUpdate = (value) => {
    const numValue = parseInt(value);
    const maxContribution = formData.fundingGoal * (validateCampaignParameters.contribution.maxPercent / 100);
    
    if (numValue < validateCampaignParameters.contribution.min) {
      updateFormData('errors', {
        ...errors,
        minContribution: `Minimum contribution is ${validateCampaignParameters.contribution.min / 1_000_000} ADA`
      });
    } else if (numValue > maxContribution) {
      updateFormData('errors', {
        ...errors,
        minContribution: `Maximum contribution cannot exceed ${validateCampaignParameters.contribution.maxPercent}% of goal`
      });
    } else {
      updateFormData('minContribution', numValue);
      // Clear error if valid
      const { minContribution, ...remainingErrors } = errors;
      updateFormData('errors', remainingErrors);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Campaign Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Funding Goal */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Funding Goal (ADA)
            </label>
            <input
              type="number"
              min={validateCampaignParameters.goal.min / 1_000_000}
              max={validateCampaignParameters.goal.max / 1_000_000}
              value={formData.fundingGoal / 1_000_000 || ''}
              onChange={(e) => handleGoalUpdate(e.target.value * 1_000_000)}
              className="w-full px-3 py-2 bg-input border border-border rounded-medical"
            />
            {errors.fundingGoal && (
              <p className="mt-1 text-sm text-error">{errors.fundingGoal}</p>
            )}
          </div>

          {/* Campaign Duration */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Campaign Duration (Days)
            </label>
            <input
              type="number"
              min={validateCampaignParameters.duration.min / (24 * 60 * 60 * 1000)}
              max={validateCampaignParameters.duration.max / (24 * 60 * 60 * 1000)}
              value={formData.duration ? formData.duration / (24 * 60 * 60 * 1000) : ''}
              onChange={(e) => handleDurationUpdate(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-medical"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-error">{errors.duration}</p>
            )}
          </div>

          {/* Minimum Contribution */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Minimum Contribution (ADA)
            </label>
            <input
              type="number"
              min={validateCampaignParameters.contribution.min / 1_000_000}
              value={formData.minContribution / 1_000_000 || ''}
              onChange={(e) => handleMinContributionUpdate(e.target.value * 1_000_000)}
              className="w-full px-3 py-2 bg-input border border-border rounded-medical"
            />
            {errors.minContribution && (
              <p className="mt-1 text-sm text-error">{errors.minContribution}</p>
            )}
          </div>

          {/* Verification Required */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Require Medical Authority Verification
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.verification_required}
                onChange={(e) => updateFormData('verification_required', e.target.checked)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">
                Requires medical authority signature for milestone claims
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Configuration */}
      <div className="border-t border-border pt-6">
        <MilestoneConfiguration
          milestones={formData.milestones || []}
          onUpdate={(milestones) => updateFormData('milestones', milestones)}
          errors={errors.milestones}
        />
      </div>
    </div>
  );
};

export default CampaignConfigurationStep;