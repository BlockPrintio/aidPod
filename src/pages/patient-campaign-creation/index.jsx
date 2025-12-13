import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useWallet } from '@meshsdk/react';
import { createCampaign } from '../../lib/mesh-sdk/campaign/createCampaign';
import { campaignStorage } from '../../lib/storage/campaign-storage';
import { adaToLovelace } from '../../lib/datum-helpers';
import StepIndicator from './components/StepIndicator';
import BasicInformationStep from './components/BasicInformationStep';
import MedicalDocumentationStep from './components/MedicalDocumentationStep';
import CampaignStoryStep from './components/CampaignStoryStep';
import HospitalVerificationStep from './components/HospitalVerificationStep';
import ReviewPreviewStep from './components/ReviewPreviewStep';
import DraftSaveIndicator from './components/DraftSaveIndicator';

const PatientCampaignCreation = () => {
  const { wallet, connected } = useWallet();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isAuthenticated] = useState(true);
  const [userRole] = useState('patient');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', component: BasicInformationStep },
    { id: 2, title: 'Documents', component: MedicalDocumentationStep },
    { id: 3, title: 'Story', component: CampaignStoryStep },
    { id: 4, title: 'Verification', component: HospitalVerificationStep },
    { id: 5, title: 'Review', component: ReviewPreviewStep }
  ];

  const totalSteps = steps?.length;

  useEffect(() => {
    // Load any existing draft on component mount
    const savedDraft = localStorage.getItem('aidpod_campaign_draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData?.patientName) newErrors.patientName = 'Patient name is required';
        if (!formData?.patientAge) newErrors.patientAge = 'Patient age is required';
        if (!formData?.contactEmail) newErrors.contactEmail = 'Contact email is required';
        if (!formData?.contactPhone) newErrors.contactPhone = 'Contact phone is required';
        if (!formData?.medicalCondition) newErrors.medicalCondition = 'Medical condition is required';
        if (!formData?.diagnosis) newErrors.diagnosis = 'Specific diagnosis is required';
        if (!formData?.urgency) newErrors.urgency = 'Treatment urgency is required';
        if (!formData?.fundingGoal) newErrors.fundingGoal = 'Funding goal is required';
        if (formData?.fundingGoal && formData?.fundingGoal < 1000) newErrors.fundingGoal = 'Minimum funding goal is 1,000 ADA';
        if (!formData?.campaignDuration) newErrors.campaignDuration = 'Campaign duration is required';
        if (!formData?.costBreakdown) newErrors.costBreakdown = 'Cost breakdown is required';
        break;

      case 2: // Medical Documentation
        // All documents are optional - no validation required
        // Users are encouraged but not required to upload documents
        break;

      case 3: // Campaign Story
        if (!formData?.campaignTitle) newErrors.campaignTitle = 'Campaign title is required';
        if (!formData?.campaignStory) newErrors.campaignStory = 'Campaign story is required';
        if (formData?.campaignStory && formData?.campaignStory?.length < 200) {
          newErrors.campaignStory = 'Campaign story must be at least 200 characters';
        }
        break;

      case 4: // Hospital Verification
        if (!formData?.selectedHospital) newErrors.selectedHospital = 'Please select a hospital for verification';
        break;

      case 5: // Review
        // All validations from previous steps
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber <= currentStep || validateStep(currentStep)) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSaveDraft = (draftData) => {
    setFormData(draftData);
  };

  const handleLoadDraft = (draftData) => {
    setFormData(draftData);
  };

  const handlePublishCampaign = async() => {
    // Check if wallet is connected
    if (!connected || !wallet) {
      setErrors({
        publish: 'Please connect your wallet first to publish the campaign'
      });
      return;
    }

    setIsPublishing(true);
    try {
      // Create campaign on blockchain
      const campaignId = `campaign_${Date.now()}`;
      
      console.log('🔗 Wallet connected, building transaction...');
      const unsignedTx = await createCampaign(formData?.hospitalName || 'unilag-medicalcenter', "2000000", wallet);
      
      console.log('✍️ Requesting signature...');
      const signedTx = await wallet.signTx(unsignedTx);
      
      console.log('📤 Submitting transaction...');
      const txHash = await wallet.submitTx(signedTx);

      const cardanoScanLink = `https://preprod.cardanoscan.io/transaction/${txHash}`;
      
      // Get wallet address for creator
      const creatorAddress = await wallet.getChangeAddress();
      
      // Prepare campaign data for storage
      const campaignDataForStorage = {
        title: formData?.campaignTitle || formData?.title || 'Untitled Campaign',
        description: formData?.campaignStory || formData?.description || '',
        goalAda: formData?.fundingGoal ? parseFloat(formData.fundingGoal) : 0,
        creator: creatorAddress,
        beneficiary: formData?.beneficiaryAddress || creatorAddress,
        medicalAuthority: formData?.medicalAuthorityAddress || formData?.selectedHospital || '',
        currentAmount: 0,
        donorCount: 0,
        status: 'active',
        patientName: formData?.patientName,
        patientAge: formData?.patientAge ? parseInt(formData.patientAge) : undefined,
        medicalCondition: formData?.medicalCondition,
        urgency: formData?.urgency,
        location: formData?.location,
        durationDays: formData?.campaignDuration ? parseInt(formData.campaignDuration) : 30,
        verificationRequired: formData?.verificationRequired !== false
      };

      // Save campaign to localStorage using campaignStorage
      const savedCampaign = campaignStorage.addCampaign(campaignDataForStorage, txHash);
      
      // Track published campaign in hospital tracking storage
      try {
        const { hospitalTracking } = await import('../../lib/storage/hospital-tracking');
        hospitalTracking.trackPublishedCampaign(
          savedCampaign.id,
          formData?.patientName || 'Unknown Patient',
          formData?.selectedHospital || formData?.hospitalName || 'Unknown Hospital',
          formData?.fundingGoal ? parseFloat(formData.fundingGoal) : 0,
          'System', // Verified by system when published
          undefined,
          txHash
        );
      } catch (error) {
        console.warn('Could not track published campaign:', error);
      }
      
      // Also save full campaign data with blockchain info for reference
      const fullCampaignData = {
        ...formData,
        id: campaignId,
        status: 'active',
        createdAt: new Date()?.toISOString(),
        currentAmount: 0,
        donorCount: 0,
        blockchain: {
          txHash: txHash,
          explorerLink: cardanoScanLink,
          network: 'preprod',
          confirmedAt: new Date()?.toISOString()
        }
      };
      
      // Store txHash and explorer link for success modal
      setFormData(prev => ({
        ...prev,
        ...fullCampaignData,
        blockchain: {
          txHash: txHash,
          explorerLink: cardanoScanLink,
          network: 'preprod',
          confirmedAt: new Date().toISOString()
        }
      }));
      
      // Clear draft
      localStorage.removeItem('aidpod_campaign_draft');
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Campaign creation failed:', error);
      setErrors({
        publish: `Failed to create campaign: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to dashboard - it will automatically load the new campaign from localStorage
    navigate('/campaign-discovery-dashboard');
  };

  const CurrentStepComponent = steps?.[currentStep - 1]?.component;

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        walletConnected={true}
        walletBalance={1250.75}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Plus" size={24} className="text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Create Medical Campaign</h1>
          </div>
          <p className="text-muted-foreground">
            Create a verified medical fundraising campaign with hospital verification and blockchain transparency.
          </p>
        </div>

        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={steps}
        />

        <DraftSaveIndicator
          formData={formData}
          onSave={handleSaveDraft}
          onLoad={handleLoadDraft}
        />

        <div className="mt-6">
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            onPublish={handlePublishCampaign}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {currentStep < totalSteps ? (
            <Button
              variant="default"
              onClick={handleNext}
              iconName="ArrowRight"
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => validateStep(currentStep) && handlePublishCampaign()}
              iconName="Send"
              iconPosition="left"
              disabled={isPublishing || !connected}
            >
              {!connected 
                ? 'Connect Wallet to Publish' 
                : isPublishing 
                  ? 'Publishing to Blockchain...' 
                  : 'Publish Campaign'}
            </Button>
          )}
        </div>

        {/* Wallet Connection Warning */}
        {!connected && currentStep === totalSteps && (
          <div className="mt-4 bg-warning/10 border border-warning/20 rounded-medical p-4">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Wallet Not Connected</p>
                <p className="text-xs text-warning/80 mt-1">Please connect your Cardano wallet to publish this campaign to the blockchain.</p>
              </div>
            </div>
          </div>
        )}

        {/* Publish Error Display */}
        {errors?.publish && (
          <div className="mt-6 bg-error/10 border border-error/20 rounded-medical p-4">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error">Failed to Publish Campaign</p>
                <p className="text-xs text-error/80 mt-1">{errors?.publish}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-medical p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Campaign Created Successfully!
              </h3>
              
              <p className="text-muted-foreground mb-4">
                Your medical campaign has been submitted for review and recorded on the Cardano blockchain.
              </p>

              {/* Blockchain Transaction Info */}
              {formData?.blockchain && (
                <div className="bg-primary/5 border border-primary/20 rounded-medical p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Icon name="Link" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary">Blockchain Transaction</span>
                  </div>
                  <div className="text-xs text-muted-foreground break-all mb-2">
                    {formData?.blockchain?.txHash}
                  </div>
                  <a
                    href={formData?.blockchain?.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>View on Cardano Explorer</span>
                    <Icon name="ExternalLink" size={14} />
                  </a>
                </div>
              )}

              <div className="space-y-3 text-sm text-left bg-muted rounded-medical p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} className="text-primary" />
                  <span>Campaign review: 24 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={16} className="text-secondary" />
                  <span>Hospital verification: 2-3 business days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Globe" size={16} className="text-accent" />
                  <span>Campaign goes live after verification</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/user-profile-wallet-management')}
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button
                  variant="default"
                  onClick={handleSuccessModalClose}
                  className="flex-1"
                >
                  Browse Campaigns
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCampaignCreation;