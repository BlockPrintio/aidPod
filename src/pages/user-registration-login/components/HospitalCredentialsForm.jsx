import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const HospitalCredentialsForm = ({ formData, onChange, errors }) => {
  const departments = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'internal', label: 'Internal Medicine' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'administration', label: 'Administration' },
    { value: 'other', label: 'Other' }
  ];

  const positions = [
    { value: 'doctor', label: 'Doctor/Physician' },
    { value: 'nurse', label: 'Registered Nurse' },
    { value: 'administrator', label: 'Hospital Administrator' },
    { value: 'director', label: 'Department Director' },
    { value: 'coordinator', label: 'Medical Coordinator' },
    { value: 'specialist', label: 'Medical Specialist' },
    { value: 'resident', label: 'Medical Resident' },
    { value: 'fellow', label: 'Medical Fellow' },
    { value: 'other', label: 'Other Medical Professional' }
  ];

  return (
    <div className="space-y-4 p-4 bg-accent/5 border border-accent/20 rounded-medical">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-accent rounded-full"></div>
        <h3 className="text-sm font-medium text-accent">Hospital Verification Details</h3>
      </div>
      <Input
        label="Hospital/Clinic Name"
        type="text"
        name="hospitalName"
        value={formData?.hospitalName}
        onChange={onChange}
        placeholder="Enter your institution name"
        error={errors?.hospitalName}
        required
      />
      <Input
        label="Medical License Number"
        type="text"
        name="licenseNumber"
        value={formData?.licenseNumber}
        onChange={onChange}
        placeholder="Enter your medical license number"
        error={errors?.licenseNumber}
        description="Your professional medical license or institutional registration number"
        required
      />
      <Select
        label="Department"
        options={departments}
        value={formData?.department}
        onChange={(value) => onChange({ target: { name: 'department', value } })}
        placeholder="Select your department"
        error={errors?.department}
        searchable
        required
      />
      <Select
        label="Position/Role"
        options={positions}
        value={formData?.position}
        onChange={(value) => onChange({ target: { name: 'position', value } })}
        placeholder="Select your position"
        error={errors?.position}
        searchable
        required
      />
      <Input
        label="Verification Document"
        type="file"
        name="verificationDocument"
        onChange={onChange}
        description="Upload medical license, hospital ID, or other verification document (PDF, JPG, PNG)"
        error={errors?.verificationDocument}
      />
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-medical">
        <p className="font-medium mb-1">Verification Process:</p>
        <ul className="space-y-1">
          <li>• Your credentials will be reviewed by our medical verification team</li>
          <li>• Verification typically takes 2-3 business days</li>
          <li>• You'll receive email updates on your verification status</li>
          <li>• Only verified medical professionals can approve campaigns</li>
        </ul>
      </div>
    </div>
  );
};

export default HospitalCredentialsForm;