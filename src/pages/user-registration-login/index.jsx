import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SocialAuthOptions from './components/SocialAuthOptions';
import TrustSignals from './components/TrustSignals';
import LanguageSelector from './components/LanguageSelector';

const UserRegistrationLogin = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user data in localStorage (mock authentication)
      localStorage.setItem('medchain_user', JSON.stringify({
        email: formData?.email,
        userType: formData?.userType,
        isAuthenticated: true,
        loginTime: new Date()?.toISOString()
      }));

      setSuccessMessage(`Welcome back! Redirecting to your ${formData?.userType} dashboard...`);
      
      // Redirect based on user type
      setTimeout(() => {
        switch (formData?.userType) {
          case 'patient': navigate('/patient-campaign-creation');
            break;
          case 'donor':
            navigate('/campaign-discovery-dashboard');
            break;
          case 'hospital': navigate('/hospital-verification-dashboard');
            break;
          default:
            navigate('/campaign-discovery-dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store user data in localStorage (mock registration)
      localStorage.setItem('medchain_user', JSON.stringify({
        email: formData?.email,
        firstName: formData?.firstName,
        lastName: formData?.lastName,
        userType: formData?.userType,
        isAuthenticated: true,
        registrationTime: new Date()?.toISOString(),
        verificationStatus: formData?.userType === 'hospital' ? 'pending' : 'verified'
      }));

      const welcomeMessage = formData?.userType === 'hospital' ?'Account created! Your hospital credentials are being verified. You\'ll receive an email update within 2-3 business days.'
        : `Welcome to MedChain, ${formData?.firstName}! Your account has been created successfully.`;
      
      setSuccessMessage(welcomeMessage);
      
      // Redirect based on user type
      setTimeout(() => {
        switch (formData?.userType) {
          case 'patient': navigate('/patient-campaign-creation');
            break;
          case 'donor':
            navigate('/campaign-discovery-dashboard');
            break;
          case 'hospital': navigate('/hospital-verification-dashboard');
            break;
          default:
            navigate('/campaign-discovery-dashboard');
        }
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    try {
      // Simulate social auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Authenticating with ${provider}...`);
      // In real implementation, this would redirect to OAuth provider
    } catch (error) {
      console.error('Social auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-medical flex items-center justify-center">
                <Icon name="Heart" size={20} color="white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                  MedChain
                </span>
                <span className="text-xs text-muted-foreground -mt-1">
                  Trusted Medical Funding
                </span>
              </div>
            </Link>

            {/* Language Selector */}
            <LanguageSelector />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-medical">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-success" />
                <p className="text-sm text-success font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Auth Card */}
          <div className="bg-card border border-border rounded-medical shadow-medical-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-card-foreground mb-2">
                {activeTab === 'login' ? 'Welcome Back' : 'Join MedChain'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'login' ?'Sign in to access your medical fundraising account' :'Create your account to start helping medical causes'
                }
              </p>
            </div>

            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'login' ? (
              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            ) : (
              <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
            )}

            <div className="mt-6">
              <SocialAuthOptions onSocialAuth={handleSocialAuth} isLoading={isLoading} />
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 bg-card border border-border rounded-medical shadow-medical-sm p-6">
            <TrustSignals />
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors duration-200">
                About Us
              </Link>
              <Link to="/how-it-works" className="hover:text-foreground transition-colors duration-200">
                How It Works
              </Link>
              <Link to="/support" className="hover:text-foreground transition-colors duration-200">
                Support
              </Link>
              <Link to="/contact" className="hover:text-foreground transition-colors duration-200">
                Contact
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date()?.getFullYear()} MedChain. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserRegistrationLogin;