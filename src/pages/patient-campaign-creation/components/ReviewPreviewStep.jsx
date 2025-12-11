import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CampaignProgressIndicator from '../../../components/ui/CampaignProgressIndicator';
import VerificationStatusBadge from '../../../components/ui/VerificationStatusBadge';

const ReviewPreviewStep = ({ formData, errors, onPublish }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const mockHospitals = [
    {
      id: 'hosp_001',
      name: 'St. Mary\'s Medical Center',
      location: 'New York, NY'
    },
    {
      id: 'hosp_002',
      name: 'General Hospital of Excellence',
      location: 'Los Angeles, CA'
    }
  ];

  const selectedHospital = mockHospitals?.find(h => h?.id === formData?.selectedHospital);

  const formatDate = (days) => {
    const date = new Date();
    date?.setDate(date?.getDate() + parseInt(days || 60));
    return date?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US')?.format(amount || 0);
  };

  const getDocumentCount = () => {
    if (!formData?.documents) return 0;
    return Object.values(formData?.documents)?.reduce((total, docs) => total + (docs?.length || 0), 0);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate campaign creation process
    setTimeout(() => {
      setIsPublishing(false);
      onPublish();
    }, 3000);
  };

  const validationChecks = [
    {
      id: 'basic_info',
      label: 'Basic Information',
      isValid: formData?.patientName && formData?.contactEmail && formData?.medicalCondition && formData?.fundingGoal,
      details: 'Patient details, medical condition, and funding goal'
    },
    {
      id: 'documents',
      label: 'Medical Documentation',
      isValid: getDocumentCount() >= 4,
      details: `${getDocumentCount()} documents uploaded (minimum 4 required)`
    },
    {
      id: 'story',
      label: 'Campaign Story',
      isValid: formData?.campaignTitle && formData?.campaignStory && formData?.campaignStory?.length >= 200,
      details: 'Title and story with minimum 200 characters'
    },
    {
      id: 'verification',
      label: 'Hospital Verification',
      isValid: formData?.selectedHospital && formData?.verificationRequest,
      details: 'Hospital selected and verification request submitted'
    }
  ];

  const allValid = validationChecks?.every(check => check?.isValid);

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Campaign Preview</h3>
          <Button
            variant="outline"
            onClick={() => setShowPreview(false)}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Back to Review
          </Button>
        </div>
        {/* Campaign Preview */}
        <div className="bg-card border border-border rounded-medical overflow-hidden">
          {/* Campaign Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {formData?.campaignTitle || 'Campaign Title'}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="User" size={14} />
                    <span>{formData?.patientName || 'Patient Name'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} />
                    <span>{selectedHospital?.location || 'Location'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={14} />
                    <span>Ends {formatDate(formData?.campaignDuration)}</span>
                  </div>
                </div>
              </div>
              <VerificationStatusBadge
                status="pending"
                verifierName={selectedHospital?.name}
                size="default"
              />
            </div>

            <CampaignProgressIndicator
              currentAmount={0}
              targetAmount={parseInt(formData?.fundingGoal) || 50000}
              donorCount={0}
              daysRemaining={parseInt(formData?.campaignDuration) || 60}
              isLive={true}
              size="lg"
            />
          </div>

          {/* Campaign Images */}
          {formData?.campaignImages && formData?.campaignImages?.length > 0 && (
            <div className="p-6 border-b border-border">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData?.campaignImages?.map((image) => (
                  <img
                    key={image?.id}
                    src={image?.url}
                    alt={image?.name}
                    className="w-full h-32 object-cover rounded-medical"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Campaign Story */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground mb-3">Campaign Story</h3>
            <div className="prose prose-sm max-w-none text-foreground">
              {formData?.campaignStory ? (
                formData?.campaignStory?.split('\n')?.map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground italic">Campaign story will appear here...</p>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground mb-3">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Medical Condition</label>
                <p className="text-foreground">{formData?.medicalCondition || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                <p className="text-foreground">{formData?.diagnosis || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Treatment Urgency</label>
                <p className="text-foreground">{formData?.urgency || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patient Age</label>
                <p className="text-foreground">{formData?.patientAge || 'Not specified'} years</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Treatment Cost Breakdown</h3>
            <p className="text-foreground">{formData?.costBreakdown || 'Cost breakdown not provided'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Review & Publish Campaign</h3>
        
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Campaign Validation</h4>
          
          {validationChecks?.map((check) => (
            <div
              key={check?.id}
              className={`flex items-center justify-between p-3 rounded-medical border ${
                check?.isValid
                  ? 'bg-success/5 border-success/20' :'bg-error/5 border-error/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  name={check?.isValid ? 'CheckCircle' : 'XCircle'}
                  size={20}
                  className={check?.isValid ? 'text-success' : 'text-error'}
                />
                <div>
                  <div className={`font-medium ${check?.isValid ? 'text-success' : 'text-error'}`}>
                    {check?.label}
                  </div>
                  <div className="text-sm text-muted-foreground">{check?.details}</div>
                </div>
              </div>
              {check?.isValid && (
                <Icon name="Check" size={16} className="text-success" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h4 className="font-medium text-foreground mb-4">Campaign Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Campaign Title</label>
              <p className="text-foreground font-medium">{formData?.campaignTitle || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
              <p className="text-foreground">{formData?.patientName || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Medical Condition</label>
              <p className="text-foreground">{formData?.medicalCondition || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Funding Goal</label>
              <p className="text-foreground font-semibold">
                {formatAmount(formData?.fundingGoal)} ADA
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Campaign Duration</label>
              <p className="text-foreground">{formData?.campaignDuration || 60} days</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <p className="text-foreground">{formatDate(formData?.campaignDuration)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Documents Uploaded</label>
              <p className="text-foreground">{getDocumentCount()} files</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Verification Hospital</label>
              <p className="text-foreground">{selectedHospital?.name || 'Not selected'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h4 className="font-medium text-foreground mb-4">Next Steps</h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <Icon name="Clock" size={16} className="text-primary mt-0.5" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Campaign Review:</strong> Your campaign will be reviewed by our team within 24 hours
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Shield" size={16} className="text-secondary mt-0.5" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Hospital Verification:</strong> {selectedHospital?.name} will verify your medical documents
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Globe" size={16} className="text-accent mt-0.5" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Campaign Launch:</strong> Once verified, your campaign will be live and accepting donations
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Bell" size={16} className="text-warning mt-0.5" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Notifications:</strong> You'll receive updates via email and in your dashboard
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between space-x-4">
        <Button
          variant="outline"
          onClick={() => setShowPreview(true)}
          iconName="Eye"
          iconPosition="left"
          disabled={!allValid}
        >
          Preview Campaign
        </Button>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            iconName="Save"
            iconPosition="left"
          >
            Save Draft
          </Button>
          
          <Button
            variant="default"
            onClick={handlePublish}
            loading={isPublishing}
            disabled={!allValid}
            iconName="Send"
            iconPosition="left"
          >
            {isPublishing ? 'Publishing Campaign...' : 'Publish Campaign'}
          </Button>
        </div>
      </div>
      {!allValid && (
        <div className="bg-warning/5 border border-warning/20 rounded-medical p-4">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <p className="text-sm text-warning font-medium">
              Please complete all required sections before publishing your campaign.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPreviewStep;