import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const HospitalVerificationStep = ({ formData, updateFormData, errors }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);

  const mockHospitals = [
    {
      id: 'hosp_001',
      name: 'St. Mary\'s Medical Center',
      location: 'New York, NY',
      specialties: ['Cardiology', 'Oncology', 'Neurology', 'Emergency Medicine'],
      verificationFee: 50,
      responseTime: '2-3 business days',
      successRate: 98,
      totalVerifications: 1247,
      credentials: {
        license: 'NY-MED-2019-001',
        accreditation: 'Joint Commission Accredited',
        established: '1985'
      },
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'verification@stmarysmc.org'
      },
      rating: 4.9,
      isAvailable: true
    },
    {
      id: 'hosp_002',
      name: 'General Hospital of Excellence',
      location: 'Los Angeles, CA',
      specialties: ['Surgery', 'Pediatrics', 'Orthopedics', 'Internal Medicine'],
      verificationFee: 75,
      responseTime: '1-2 business days',
      successRate: 96,
      totalVerifications: 892,
      credentials: {
        license: 'CA-MED-2020-045',
        accreditation: 'AAAHC Accredited',
        established: '1992'
      },
      contactInfo: {
        phone: '+1 (555) 987-6543',
        email: 'verify@ghexcellence.com'
      },
      rating: 4.8,
      isAvailable: true
    },
    {
      id: 'hosp_003',
      name: 'Metropolitan Health Institute',
      location: 'Chicago, IL',
      specialties: ['Oncology', 'Radiology', 'Pathology', 'Emergency Medicine'],
      verificationFee: 60,
      responseTime: '3-4 business days',
      successRate: 94,
      totalVerifications: 654,
      credentials: {
        license: 'IL-MED-2018-078',
        accreditation: 'NCQA Accredited',
        established: '1978'
      },
      contactInfo: {
        phone: '+1 (555) 456-7890',
        email: 'medical.verification@mhi.org'
      },
      rating: 4.7,
      isAvailable: false
    }
  ];

  const verificationOptions = mockHospitals?.map(hospital => ({
    value: hospital?.id,
    label: `${hospital?.name} - ${hospital?.location}`,
    disabled: !hospital?.isAvailable
  }));

  const handleHospitalSelect = (hospitalId) => {
    const hospital = mockHospitals?.find(h => h?.id === hospitalId);
    setSelectedHospital(hospital);
    updateFormData('selectedHospital', hospitalId);
    setShowHospitalDetails(true);
  };

  const submitVerificationRequest = () => {
    if (!selectedHospital) return;
    
    const verificationRequest = {
      hospitalId: selectedHospital?.id,
      requestDate: new Date()?.toISOString(),
      status: 'pending',
      estimatedCompletion: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000))?.toISOString(),
      verificationFee: selectedHospital?.verificationFee,
      additionalNotes: formData?.verificationNotes || ''
    };
    
    updateFormData('verificationRequest', verificationRequest);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-medical p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Hospital Verification</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-medical p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Why Hospital Verification is Important:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Builds trust with potential donors through medical professional validation</li>
                <li>Verifies the authenticity of your medical condition and treatment needs</li>
                <li>Increases campaign visibility and donation likelihood</li>
                <li>Provides additional credibility through blockchain-recorded verification</li>
              </ul>
            </div>
          </div>
        </div>

        <Select
          label="Select Verification Hospital"
          options={verificationOptions}
          value={formData?.selectedHospital || ''}
          onChange={handleHospitalSelect}
          error={errors?.selectedHospital}
          required
          placeholder="Choose a hospital for verification"
          description="Select a hospital or medical institution to verify your campaign"
        />
      </div>
      {showHospitalDetails && selectedHospital && (
        <div className="bg-card border border-border rounded-medical p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Hospital Details</h4>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              selectedHospital?.isAvailable 
                ? 'bg-success/10 text-success' :'bg-warning/10 text-warning'
            }`}>
              {selectedHospital?.isAvailable ? 'Available' : 'Currently Unavailable'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-foreground mb-2">{selectedHospital?.name}</h5>
                <p className="text-sm text-muted-foreground mb-2">{selectedHospital?.location}</p>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)]?.map((_, i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={14}
                      className={i < Math.floor(selectedHospital?.rating) ? 'text-warning fill-current' : 'text-muted-foreground'}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {selectedHospital?.rating} ({selectedHospital?.totalVerifications} verifications)
                  </span>
                </div>
              </div>

              <div>
                <h6 className="font-medium text-foreground mb-2">Specialties</h6>
                <div className="flex flex-wrap gap-2">
                  {selectedHospital?.specialties?.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-medical"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h6 className="font-medium text-foreground mb-2">Credentials</h6>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>License: {selectedHospital?.credentials?.license}</p>
                  <p>Accreditation: {selectedHospital?.credentials?.accreditation}</p>
                  <p>Established: {selectedHospital?.credentials?.established}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted rounded-medical p-4">
                <h6 className="font-medium text-foreground mb-3">Verification Details</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification Fee:</span>
                    <span className="font-medium text-foreground">{selectedHospital?.verificationFee} ADA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-medium text-foreground">{selectedHospital?.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success Rate:</span>
                    <span className="font-medium text-success">{selectedHospital?.successRate}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="font-medium text-foreground mb-2">Contact Information</h6>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={14} />
                    <span>{selectedHospital?.contactInfo?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={14} />
                    <span>{selectedHospital?.contactInfo?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedHospital && (
        <div className="bg-card border border-border rounded-medical p-6">
          <h4 className="font-medium text-foreground mb-4">Additional Information for Verifier</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                className="w-full min-h-[120px] p-3 border border-border rounded-medical focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                placeholder="Provide any additional context or specific information that might help the hospital verify your campaign more effectively..."
                value={formData?.verificationNotes || ''}
                onChange={(e) => updateFormData('verificationNotes', e?.target?.value)}
                maxLength={1000}
              />
              <div className="text-sm text-muted-foreground mt-1">
                Optional: Any specific details that might help with verification
              </div>
            </div>

            <Input
              label="Preferred Contact Method"
              type="text"
              placeholder="Email, Phone, or Hospital Portal"
              value={formData?.preferredContact || ''}
              onChange={(e) => updateFormData('preferredContact', e?.target?.value)}
              description="How would you prefer the hospital to contact you?"
            />
          </div>
        </div>
      )}
      {selectedHospital && !formData?.verificationRequest && (
        <div className="bg-card border border-border rounded-medical p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Ready to Submit Verification Request?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                This will send your campaign and medical documents to {selectedHospital?.name} for verification.
              </p>
            </div>
            <Button
              variant="default"
              onClick={submitVerificationRequest}
              iconName="Send"
              iconPosition="left"
              disabled={!selectedHospital?.isAvailable}
            >
              Submit Request
            </Button>
          </div>
        </div>
      )}
      {formData?.verificationRequest && (
        <div className="bg-success/5 border border-success/20 rounded-medical p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <h4 className="font-medium text-success">Verification Request Submitted</h4>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">
              Your verification request has been sent to <strong>{selectedHospital?.name}</strong>.
            </p>
            <p className="text-muted-foreground">
              Expected response time: <strong>{selectedHospital?.responseTime}</strong>
            </p>
            <p className="text-muted-foreground">
              Verification fee: <strong>{selectedHospital?.verificationFee} ADA</strong> (will be charged upon verification completion)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalVerificationStep;