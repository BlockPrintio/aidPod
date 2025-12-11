import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import VerificationStatusBadge from '../../../components/ui/VerificationStatusBadge';

const VerificationModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  verifierInfo
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationDecision, setVerificationDecision] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !request) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'FileText' },
    { id: 'documents', label: 'Documents', icon: 'Folder' },
    { id: 'medical', label: 'Medical Details', icon: 'Stethoscope' },
    { id: 'verification', label: 'Verification', icon: 'Shield' }
  ];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerificationSubmit = async (decision) => {
    setIsProcessing(true);
    try {
      if (decision === 'approve') {
        await onApprove(request?.id, verificationNotes);
      } else {
        await onReject(request?.id, verificationNotes);
      }
      onClose();
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Patient Information */}
      <div className="bg-muted/20 p-4 rounded-medical">
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Patient Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <div className="text-base text-card-foreground">{request?.patientName}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Age</label>
            <div className="text-base text-card-foreground">{request?.age} years</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Location</label>
            <div className="text-base text-card-foreground">{request?.location}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contact</label>
            <div className="text-base text-card-foreground">{request?.contactInfo}</div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-muted/20 p-4 rounded-medical">
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Campaign Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Funding Goal</label>
            <div className="text-xl font-bold text-card-foreground">
              {formatAmount(request?.targetAmount)} ADA
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ₦{(request?.targetAmount * 750)?.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Urgency Level</label>
            <div className={`inline-block px-2 py-1 rounded-medical text-sm font-medium ${
              request?.urgency === 'critical' ? 'bg-error/10 text-error' :
              request?.urgency === 'high'? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
            }`}>
              {request?.urgency?.toUpperCase()}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Submitted</label>
            <div className="text-base text-card-foreground">
              {formatDate(request?.submittedDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Condition */}
      <div className="bg-muted/20 p-4 rounded-medical">
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Medical Condition</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Primary Diagnosis</label>
            <div className="text-base text-card-foreground">{request?.condition}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Medical Summary</label>
            <div className="text-base text-card-foreground leading-relaxed">
              {request?.medicalSummary}
            </div>
          </div>
          {request?.treatmentPlan && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Treatment Plan</label>
              <div className="text-base text-card-foreground leading-relaxed">
                {request?.treatmentPlan}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-card-foreground">Medical Documents</h4>
        <div className="text-sm text-muted-foreground">
          {request?.documentsCount} files uploaded
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {request?.documents?.map((doc, index) => (
          <div key={index} className="bg-muted/20 p-4 rounded-medical">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="FileText" size={20} className="text-primary" />
                <div>
                  <div className="font-medium text-card-foreground">{doc?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {doc?.type} • {doc?.size} • Uploaded {formatDate(doc?.uploadDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Eye">
                  View
                </Button>
                <Button variant="outline" size="sm" iconName="Download">
                  Download
                </Button>
              </div>
            </div>
          </div>
        )) || (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FileX" size={48} className="mx-auto mb-4 opacity-50" />
            <p>No documents available for review</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicalTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-medical">
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Medical Assessment</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Diagnosis Code (ICD-10)</label>
            <div className="text-base font-mono text-card-foreground">{request?.diagnosisCode || 'Not provided'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Treating Physician</label>
            <div className="text-base text-card-foreground">{request?.treatingPhysician || 'Not specified'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Hospital/Clinic</label>
            <div className="text-base text-card-foreground">{request?.hospitalName || 'Not specified'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Treatment Timeline</label>
            <div className="text-base text-card-foreground">{request?.treatmentTimeline || 'Not provided'}</div>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 p-4 rounded-medical">
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Cost Breakdown</h4>
        <div className="space-y-3">
          {request?.costBreakdown?.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-card-foreground">{item?.description}</span>
              <span className="font-medium text-card-foreground">{formatAmount(item?.amount)} ADA</span>
            </div>
          )) || (
            <div className="text-muted-foreground">Cost breakdown not provided</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVerificationTab = () => (
    <div className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-medical">
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Verifier Information</h4>
        <div className="flex items-center space-x-4">
          <Image
            src={verifierInfo?.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"}
            alt={verifierInfo?.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-card-foreground">{verifierInfo?.name}</div>
            <div className="text-sm text-muted-foreground">{verifierInfo?.title}</div>
            <div className="text-sm text-muted-foreground">{verifierInfo?.institution}</div>
            <div className="text-xs text-muted-foreground">License: {verifierInfo?.licenseNumber}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Verification Decision
          </label>
          <Select
            options={[
              { value: '', label: 'Select decision...' },
              { value: 'approve', label: 'Approve Campaign' },
              { value: 'reject', label: 'Reject Campaign' },
              { value: 'request_more_info', label: 'Request More Information' }
            ]}
            value={verificationDecision}
            onChange={setVerificationDecision}
            placeholder="Choose verification outcome"
          />
        </div>

        <div>
          <Input
            type="textarea"
            label="Verification Notes"
            description="Provide detailed notes about your verification decision"
            placeholder="Enter your professional assessment and any recommendations..."
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e?.target?.value)}
            required
            className="min-h-32"
          />
        </div>

        <div className="bg-warning/10 border border-warning/20 p-4 rounded-medical">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm text-warning">
              <div className="font-medium mb-1">Important Notice</div>
              <div>
                Your verification decision will be recorded on the blockchain and cannot be modified. 
                Please ensure all information has been thoroughly reviewed before proceeding.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-background border border-border rounded-medical shadow-medical-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Image
              src={request?.patientPhoto}
              alt={request?.patientName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-foreground">{request?.patientName}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Campaign #{request?.campaignId}</span>
                <VerificationStatusBadge status={request?.status} size="sm" />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} iconName="X" />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-0 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
          {activeTab === 'medical' && renderMedicalTab()}
          {activeTab === 'verification' && renderVerificationTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatDate(request?.lastUpdated || request?.submittedDate)}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {activeTab === 'verification' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleVerificationSubmit('reject')}
                  loading={isProcessing}
                  disabled={!verificationNotes?.trim() || !verificationDecision}
                  iconName="X"
                  iconPosition="left"
                >
                  Reject Campaign
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleVerificationSubmit('approve')}
                  loading={isProcessing}
                  disabled={!verificationNotes?.trim() || !verificationDecision}
                  iconName="Check"
                  iconPosition="left"
                >
                  Approve Campaign
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;