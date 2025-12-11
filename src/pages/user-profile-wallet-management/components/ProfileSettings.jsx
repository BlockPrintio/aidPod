import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ProfileSettings = ({ user, onUpdateProfile = () => {} }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    emergencyContact: user?.emergencyContact || '',
    medicalConditions: user?.medicalConditions || [],
    institutionName: user?.institutionName || '',
    licenseNumber: user?.licenseNumber || '',
    specialty: user?.specialty || '',
    donationPreferences: user?.donationPreferences || [],
    privacySettings: user?.privacySettings || {
      showProfile: true,
      showDonations: false,
      showMedicalInfo: false,
      allowMessages: true
    },
    notifications: user?.notifications || {
      email: true,
      push: true,
      campaignUpdates: true,
      donationReceipts: true,
      verificationStatus: true,
      marketing: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'in', label: 'India' },
    { value: 'jp', label: 'Japan' }
  ];

  const medicalConditionOptions = [
    { value: 'cancer', label: 'Cancer Treatment' },
    { value: 'cardiac', label: 'Cardiac Care' },
    { value: 'pediatric', label: 'Pediatric Care' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'surgery', label: 'Surgical Procedures' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'chronic', label: 'Chronic Conditions' },
    { value: 'rare_disease', label: 'Rare Diseases' }
  ];

  const specialtyOptions = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'internal', label: 'Internal Medicine' },
    { value: 'psychiatry', label: 'Psychiatry' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (user?.role === 'hospital') {
      if (!formData?.institutionName?.trim()) {
        newErrors.institutionName = 'Institution name is required';
      }
      if (!formData?.licenseNumber?.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onUpdateProfile(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
          />
          
          <Input
            label="Email Address"
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            placeholder="+1 (555) 123-4567"
          />
          
          <Select
            label="Location"
            options={countryOptions}
            value={formData?.location}
            onChange={(value) => handleInputChange('location', value)}
            placeholder="Select your country"
          />
        </div>
        
        <div className="mt-4">
          <Input
            label="Bio"
            type="text"
            value={formData?.bio}
            onChange={(e) => handleInputChange('bio', e?.target?.value)}
            placeholder="Tell us about yourself..."
            description="This will be displayed on your public profile"
          />
        </div>
      </div>
      {/* Role-specific Settings */}
      {user?.role === 'patient' && (
        <div className="bg-card border border-border rounded-medical p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Patient Information</h3>
          
          <Input
            label="Emergency Contact"
            type="text"
            value={formData?.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)}
            placeholder="Name and phone number"
            description="This information is kept private and only used in emergencies"
          />
        </div>
      )}
      {user?.role === 'donor' && (
        <div className="bg-card border border-border rounded-medical p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Donation Preferences</h3>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Medical Conditions You'd Like to Support
            </label>
            <Select
              options={medicalConditionOptions}
              value={formData?.medicalConditions}
              onChange={(value) => handleInputChange('medicalConditions', value)}
              multiple
              searchable
              placeholder="Select conditions..."
              description="This helps us show you relevant campaigns"
            />
          </div>
        </div>
      )}
      {user?.role === 'hospital' && (
        <div className="bg-card border border-border rounded-medical p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Institution Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Institution Name"
              type="text"
              value={formData?.institutionName}
              onChange={(e) => handleInputChange('institutionName', e?.target?.value)}
              error={errors?.institutionName}
              required
            />
            
            <Input
              label="Medical License Number"
              type="text"
              value={formData?.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e?.target?.value)}
              error={errors?.licenseNumber}
              required
            />
          </div>
          
          <div className="mt-4">
            <Select
              label="Primary Specialty"
              options={specialtyOptions}
              value={formData?.specialty}
              onChange={(value) => handleInputChange('specialty', value)}
              placeholder="Select your specialty"
            />
          </div>
        </div>
      )}
      {/* Privacy Settings */}
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Privacy Settings</h3>
        
        <div className="space-y-4">
          <Checkbox
            label="Show my profile publicly"
            description="Allow others to view your profile information"
            checked={formData?.privacySettings?.showProfile}
            onChange={(e) => handleNestedChange('privacySettings', 'showProfile', e?.target?.checked)}
          />
          
          <Checkbox
            label="Show my donation history"
            description="Display your donation activity on your profile"
            checked={formData?.privacySettings?.showDonations}
            onChange={(e) => handleNestedChange('privacySettings', 'showDonations', e?.target?.checked)}
          />
          
          {user?.role === 'patient' && (
            <Checkbox
              label="Share medical information with verifiers"
              description="Allow hospitals to access your medical documents for verification"
              checked={formData?.privacySettings?.showMedicalInfo}
              onChange={(e) => handleNestedChange('privacySettings', 'showMedicalInfo', e?.target?.checked)}
            />
          )}
          
          <Checkbox
            label="Allow messages from other users"
            description="Enable direct messages from campaign creators and donors"
            checked={formData?.privacySettings?.allowMessages}
            onChange={(e) => handleNestedChange('privacySettings', 'allowMessages', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <Checkbox
            label="Email notifications"
            description="Receive important updates via email"
            checked={formData?.notifications?.email}
            onChange={(e) => handleNestedChange('notifications', 'email', e?.target?.checked)}
          />
          
          <Checkbox
            label="Push notifications"
            description="Get instant notifications in your browser"
            checked={formData?.notifications?.push}
            onChange={(e) => handleNestedChange('notifications', 'push', e?.target?.checked)}
          />
          
          <Checkbox
            label="Campaign updates"
            description="Notifications about campaigns you've supported or created"
            checked={formData?.notifications?.campaignUpdates}
            onChange={(e) => handleNestedChange('notifications', 'campaignUpdates', e?.target?.checked)}
          />
          
          <Checkbox
            label="Donation receipts"
            description="Automatic receipts for your donations"
            checked={formData?.notifications?.donationReceipts}
            onChange={(e) => handleNestedChange('notifications', 'donationReceipts', e?.target?.checked)}
          />
          
          <Checkbox
            label="Verification status updates"
            description="Updates about campaign verification status"
            checked={formData?.notifications?.verificationStatus}
            onChange={(e) => handleNestedChange('notifications', 'verificationStatus', e?.target?.checked)}
          />
          
          <Checkbox
            label="Marketing communications"
            description="News, tips, and promotional content"
            checked={formData?.notifications?.marketing}
            onChange={(e) => handleNestedChange('notifications', 'marketing', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Save Button */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location?.reload()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          iconName="Save"
          iconPosition="left"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileSettings;