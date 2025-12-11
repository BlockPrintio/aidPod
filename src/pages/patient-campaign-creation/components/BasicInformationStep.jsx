import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BasicInformationStep = ({ formData, updateFormData, errors }) => {
  const medicalConditions = [
    { value: 'cancer', label: 'Cancer Treatment' },
    { value: 'heart', label: 'Heart Surgery' },
    { value: 'kidney', label: 'Kidney Treatment' },
    { value: 'liver', label: 'Liver Treatment' },
    { value: 'brain', label: 'Brain Surgery' },
    { value: 'orthopedic', label: 'Orthopedic Surgery' },
    { value: 'emergency', label: 'Emergency Treatment' },
    { value: 'chronic', label: 'Chronic Illness' },
    { value: 'other', label: 'Other Medical Condition' }
  ];

  const urgencyLevels = [
    { value: 'immediate', label: 'Immediate (Within 1 week)' },
    { value: 'urgent', label: 'Urgent (Within 1 month)' },
    { value: 'moderate', label: 'Moderate (Within 3 months)' },
    { value: 'planned', label: 'Planned (More than 3 months)' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Patient Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Patient Full Name"
            type="text"
            placeholder="Enter patient's full name"
            value={formData?.patientName || ''}
            onChange={(e) => updateFormData('patientName', e?.target?.value)}
            error={errors?.patientName}
            required
          />
          
          <Input
            label="Patient Age"
            type="number"
            placeholder="Enter age"
            value={formData?.patientAge || ''}
            onChange={(e) => updateFormData('patientAge', e?.target?.value)}
            error={errors?.patientAge}
            required
            min="1"
            max="120"
          />
          
          <Input
            label="Contact Email"
            type="email"
            placeholder="patient@example.com"
            value={formData?.contactEmail || ''}
            onChange={(e) => updateFormData('contactEmail', e?.target?.value)}
            error={errors?.contactEmail}
            required
            description="This email will be used for campaign updates"
          />
          
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData?.contactPhone || ''}
            onChange={(e) => updateFormData('contactPhone', e?.target?.value)}
            error={errors?.contactPhone}
            required
          />
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Medical Condition</h3>
        
        <div className="space-y-4">
          <Select
            label="Primary Medical Condition"
            options={medicalConditions}
            value={formData?.medicalCondition || ''}
            onChange={(value) => updateFormData('medicalCondition', value)}
            error={errors?.medicalCondition}
            required
            placeholder="Select medical condition"
          />
          
          <Input
            label="Specific Diagnosis"
            type="text"
            placeholder="Provide specific medical diagnosis"
            value={formData?.diagnosis || ''}
            onChange={(e) => updateFormData('diagnosis', e?.target?.value)}
            error={errors?.diagnosis}
            required
            description="Enter the exact medical diagnosis from your doctor"
          />
          
          <Select
            label="Treatment Urgency"
            options={urgencyLevels}
            value={formData?.urgency || ''}
            onChange={(value) => updateFormData('urgency', value)}
            error={errors?.urgency}
            required
            placeholder="Select treatment urgency"
          />
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Funding Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Funding Goal (ADA)"
            type="number"
            placeholder="50000"
            value={formData?.fundingGoal || ''}
            onChange={(e) => updateFormData('fundingGoal', e?.target?.value)}
            error={errors?.fundingGoal}
            required
            min="1000"
            description="Minimum goal is 1,000 ADA"
          />
          
          <Input
            label="Campaign Duration (Days)"
            type="number"
            placeholder="60"
            value={formData?.campaignDuration || ''}
            onChange={(e) => updateFormData('campaignDuration', e?.target?.value)}
            error={errors?.campaignDuration}
            required
            min="7"
            max="365"
            description="Campaign duration between 7-365 days"
          />
          
          <div className="md:col-span-2">
            <Input
              label="Treatment Cost Breakdown"
              type="text"
              placeholder="Surgery: 30,000 ADA, Medication: 15,000 ADA, Recovery: 5,000 ADA"
              value={formData?.costBreakdown || ''}
              onChange={(e) => updateFormData('costBreakdown', e?.target?.value)}
              error={errors?.costBreakdown}
              required
              description="Provide detailed breakdown of medical expenses"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationStep;