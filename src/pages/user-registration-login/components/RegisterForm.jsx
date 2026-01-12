import React, { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import UserTypeSelector from './UserTypeSelector';
import HospitalCredentialsForm from './HospitalCredentialsForm';
import { registerHospital } from '../../../lib/mesh-sdk/registry/registerHospital';
import { registerPatient } from '../../../lib/mesh-sdk/registry/registerPatient';

const RegisterForm = ({ onSubmit, isLoading }) => {
  const { wallet, connected } = useWallet();
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }

    // Check if wallet is connected for blockchain registration
    if (!connected || !wallet) {
      setErrors({
        blockchain: 'Please connect your Cardano wallet to register on the blockchain'
      });
      return;
    }

    setIsRegistering(true);
    setErrors({});

    try {
      let registrationResult;
      const firstName = formData?.firstName?.trim();
      
      if (!firstName) {
        throw new Error('First name is required for blockchain registration');
      }
      
      console.log(`🔗 Registering ${formData?.userType} on blockchain...`);
      
      if (formData?.userType === 'hospital') {
        // Register hospital
        const hospitalName = formData?.hospitalName || firstName;
        registrationResult = await registerHospital(hospitalName, wallet);
        
        console.log('✅ Hospital registered on blockchain:', registrationResult);
      } else if (formData?.userType === 'patient') {
        // Register patient
        registrationResult = await registerPatient(firstName, wallet);
        
        console.log('✅ Patient registered on blockchain:', registrationResult);
      } else {
        throw new Error('Invalid user type selected');
      }

      // Create Cardano explorer link
      const cardanoScanLink = `https://preprod.cardanoscan.io/transaction/${registrationResult.txHash}`;
      
      // Store registration data with blockchain info
      const registrationData = {
        ...formData,
        blockchain: {
          txHash: registrationResult.txHash,
          explorerLink: cardanoScanLink,
          network: 'preprod',
          registeredAt: new Date().toISOString(),
          tokenInfo: {
            policyId: registrationResult.policyId,
            tokenName: registrationResult.tokenName,
            asset: registrationResult.asset
          }
        }
      };

      // Show success
      setRegistrationSuccess({
        txHash: registrationResult.txHash,
        explorerLink: cardanoScanLink,
        userType: formData?.userType,
        tokenName: registrationResult.tokenName
      });

      // Call parent onSubmit with registration data
      onSubmit(registrationData);
      
    } catch (error) {
      console.error('❌ Blockchain registration failed:', error);
      setErrors({
        blockchain: `Failed to register on blockchain: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsRegistering(false);
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
      {/* Wallet Connection Warning */}
      {!connected && (
        <div className="bg-warning/10 border border-warning/20 rounded-medical p-4">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Wallet Not Connected</p>
              <p className="text-xs text-warning/80 mt-1">
                Please connect your Cardano wallet to register on the blockchain. This is required for account creation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Registration Error */}
      {errors?.blockchain && (
        <div className="bg-error/10 border border-error/20 rounded-medical p-4">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error">Registration Failed</p>
              <p className="text-xs text-error/80 mt-1">{errors?.blockchain}</p>
            </div>
          </div>
        </div>
      )}

      {/* Registration Success Modal */}
      {registrationSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-medical p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Registration Successful!
              </h3>
              
              <p className="text-muted-foreground mb-4">
                Your {registrationSuccess.userType} account has been registered on the Cardano blockchain.
              </p>

              {/* Blockchain Transaction Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-medical p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Icon name="Link" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">Blockchain Transaction</span>
                </div>
                <div className="text-xs text-muted-foreground break-all mb-2">
                  {registrationSuccess.txHash}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Token: {registrationSuccess.tokenName}
                </div>
                <a
                  href={registrationSuccess.explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <span>View on Cardano Explorer</span>
                  <Icon name="ExternalLink" size={14} />
                </a>
              </div>

              <Button
                variant="default"
                onClick={() => setRegistrationSuccess(null)}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading || isRegistering}
        disabled={!connected}
        iconName="UserPlus"
        iconPosition="left"
        className="mt-6"
      >
        {!connected 
          ? 'Connect Wallet to Register' 
          : isRegistering 
            ? 'Registering on Blockchain...' 
            : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;