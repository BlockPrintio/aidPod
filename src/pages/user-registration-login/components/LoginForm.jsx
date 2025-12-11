import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const mockCredentials = [
    { email: "patient@medchain.com", password: "Patient123!", type: "patient" },
    { email: "donor@medchain.com", password: "Donor123!", type: "donor" },
    { email: "hospital@medchain.com", password: "Hospital123!", type: "hospital" }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const validCredential = mockCredentials?.find(
        cred => cred?.email === formData?.email && cred?.password === formData?.password
      );
      
      if (validCredential) {
        onSubmit({ ...formData, userType: validCredential?.type });
      } else {
        setErrors({ 
          general: 'Invalid email or password. Please check your credentials and try again.' 
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors?.general && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-medical">
          <p className="text-sm text-error">{errors?.general}</p>
        </div>
      )}
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
          placeholder="Enter your password"
          error={errors?.password}
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
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          name="rememberMe"
          checked={formData?.rememberMe}
          onChange={handleChange}
        />
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary/80 transition-colors duration-200"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        variant="default"
        fullWidth
        loading={isLoading}
        iconName="LogIn"
        iconPosition="left"
        className="mt-6"
      >
        Sign In
      </Button>
      {/* Mock Credentials Helper */}
      <div className="mt-6 p-4 bg-muted/50 rounded-medical">
        <h4 className="text-sm font-medium text-foreground mb-2">Demo Credentials:</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {mockCredentials?.map((cred, index) => (
            <div key={index} className="flex justify-between">
              <span className="capitalize">{cred?.type}:</span>
              <span className="font-mono">{cred?.email} / {cred?.password}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default LoginForm;