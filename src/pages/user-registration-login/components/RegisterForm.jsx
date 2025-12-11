import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import UserTypeSelector from './UserTypeSelector';
import HospitalCredentialsForm from './HospitalCredentialsForm';

const RegisterForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    userType: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
    // Hospital specific fields
    hospitalName: '',
    licenseNumber: '',
    department: '',
    position: '',
    verificationDocument: null
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.userType) {
      newErrors.userType = 'Please select your user type';
    }
    
    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/?.test(formData?.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData?.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms of service';
    }
    
    if (!formData?.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the privacy policy';
    }

    // Hospital specific validation
    if (formData?.userType === 'hospital') {
      if (!formData?.hospitalName?.trim()) {
        newErrors.hospitalName = 'Hospital name is required';
      }
      if (!formData?.licenseNumber?.trim()) {
        newErrors.licenseNumber = 'Medical license number is required';
      }
      if (!formData?.department?.trim()) {
        newErrors.department = 'Department is required';
      }
      if (!formData?.position?.trim()) {
        newErrors.position = 'Position is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] : value
    }));
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUserTypeChange = (type) => {
    setFormData(prev => ({ ...prev, userType: type }));
    if (errors?.userType) {
      setErrors(prev => ({ ...prev, userType: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <UserTypeSelector
        selectedType={formData?.userType}
        onTypeChange={handleUserTypeChange}
        error={errors?.userType}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          name="firstName"
          value={formData?.firstName}
          onChange={handleChange}
          placeholder="Enter first name"
          error={errors?.firstName}
          required
        />
        <Input
          label="Last Name"
          type="text"
          name="lastName"
          value={formData?.lastName}
          onChange={handleChange}
          placeholder="Enter last name"
          error={errors?.lastName}
          required
        />
      </div>
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData?.email}
        onChange={handleChange}
        placeholder="Enter your email"
        error={errors?.email}
        required
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData?.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          error={errors?.password}
          description="Must contain uppercase, lowercase, number, and special character"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
        </button>
      </div>
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData?.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          error={errors?.confirmPassword}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-8 text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} />
        </button>
      </div>
      {formData?.userType === 'hospital' && (
        <HospitalCredentialsForm
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />
      )}
      <div className="space-y-3">
        <Checkbox
          label={
            <span className="text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:text-primary/80 transition-colors duration-200">
                Terms of Service
              </a>
            </span>
          }
          name="acceptTerms"
          checked={formData?.acceptTerms}
          onChange={handleChange}
          error={errors?.acceptTerms}
          required
        />
        <Checkbox
          label={
            <span className="text-sm">
              I accept the{' '}
              <a href="/privacy" className="text-primary hover:text-primary/80 transition-colors duration-200">
                Privacy Policy
              </a>
            </span>
          }
          name="acceptPrivacy"
          checked={formData?.acceptPrivacy}
          onChange={handleChange}
          error={errors?.acceptPrivacy}
          required
        />
      </div>
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        iconName="UserPlus"
        iconPosition="left"
        className="mt-6"
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;