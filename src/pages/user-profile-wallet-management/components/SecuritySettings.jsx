import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const SecuritySettings = ({ user, onUpdateSecurity = () => {} }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loginHistory = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: "New York, NY, USA",
      device: "Chrome on Windows",
      ipAddress: "192.168.1.1",
      status: "success",
      isCurrent: true
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: "New York, NY, USA",
      device: "Safari on iPhone",
      ipAddress: "192.168.1.2",
      status: "success",
      isCurrent: false
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: "Boston, MA, USA",
      device: "Chrome on Windows",
      ipAddress: "10.0.0.1",
      status: "success",
      isCurrent: false
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      location: "Unknown Location",
      device: "Unknown Device",
      ipAddress: "203.0.113.1",
      status: "failed",
      isCurrent: false
    }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm?.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm?.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm?.newPassword?.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm?.newPassword !== passwordForm?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onUpdateSecurity({
        type: 'password',
        data: passwordForm
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!twoFactorEnabled) {
      setShowQRCode(true);
    } else {
      setIsLoading(true);
      try {
        await onUpdateSecurity({
          type: 'disable_2fa'
        });
        setTwoFactorEnabled(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTwoFactorVerification = async () => {
    if (!verificationCode || verificationCode?.length !== 6) {
      setErrors({ verificationCode: 'Please enter a valid 6-digit code' });
      return;
    }
    
    setIsLoading(true);
    try {
      await onUpdateSecurity({
        type: 'enable_2fa',
        data: { verificationCode }
      });
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? 'CheckCircle' : 'XCircle';
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-success' : 'text-error';
  };

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm?.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
            error={errors?.currentPassword}
            required
          />
          
          <Input
            label="New Password"
            type="password"
            value={passwordForm?.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
            error={errors?.newPassword}
            description="Must be at least 8 characters long"
            required
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm?.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
          />
          
          <Button
            type="submit"
            loading={isLoading}
            iconName="Lock"
            iconPosition="left"
          >
            Update Password
          </Button>
        </form>
      </div>
      {/* Two-Factor Authentication */}
      <div className="bg-card border border-border rounded-medical p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {twoFactorEnabled && (
              <div className="flex items-center space-x-1 text-success">
                <Icon name="Shield" size={16} />
                <span className="text-sm font-medium">Enabled</span>
              </div>
            )}
            <Button
              variant={twoFactorEnabled ? "destructive" : "default"}
              size="sm"
              onClick={handleTwoFactorToggle}
              loading={isLoading}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </Button>
          </div>
        </div>

        {showQRCode && (
          <div className="border border-border rounded-medical p-4 bg-muted/50">
            <h4 className="font-medium text-foreground mb-3">Set up Two-Factor Authentication</h4>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">1. Install an authenticator app like Google Authenticator or Authy</p>
                <p className="mb-2">2. Scan this QR code with your authenticator app:</p>
              </div>
              
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white border border-border rounded-medical flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Icon name="QrCode" size={64} className="mx-auto mb-2" />
                    <p className="text-xs">QR Code would appear here</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">3. Enter the 6-digit code from your authenticator app:</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e?.target?.value?.replace(/\D/g, '')?.slice(0, 6))}
                  error={errors?.verificationCode}
                  className="w-32"
                />
                <Button
                  onClick={handleTwoFactorVerification}
                  loading={isLoading}
                  disabled={verificationCode?.length !== 6}
                >
                  Verify
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Login History */}
      <div className="bg-card border border-border rounded-medical p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Login History</h3>
          <Button
            variant="outline"
            size="sm"
            iconName="RefreshCw"
          >
            Refresh
          </Button>
        </div>
        
        <div className="space-y-3">
          {loginHistory?.map((login) => (
            <div
              key={login?.id}
              className={`flex items-center justify-between p-4 rounded-medical border ${
                login?.isCurrent 
                  ? 'border-primary bg-primary/5' :'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  name={getStatusIcon(login?.status)}
                  size={20}
                  className={getStatusColor(login?.status)}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      {login?.location}
                    </span>
                    {login?.isCurrent && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-medical">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {login?.device} • {login?.ipAddress}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-foreground">
                  {formatDate(login?.timestamp)}
                </div>
                {login?.status === 'failed' && (
                  <div className="text-xs text-error">
                    Failed login attempt
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing recent login attempts</span>
            <Button
              variant="ghost"
              size="sm"
              iconName="ExternalLink"
            >
              View All
            </Button>
          </div>
        </div>
      </div>
      {/* Account Security Status */}
      <div className="bg-card border border-border rounded-medical p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Lock" size={20} className="text-success" />
              <div>
                <div className="font-medium text-foreground">Strong Password</div>
                <div className="text-sm text-muted-foreground">Your password meets security requirements</div>
              </div>
            </div>
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className={twoFactorEnabled ? 'text-success' : 'text-warning'} />
              <div>
                <div className="font-medium text-foreground">Two-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">
                  {twoFactorEnabled ? 'Enabled for enhanced security' : 'Recommended for better security'}
                </div>
              </div>
            </div>
            <Icon 
              name={twoFactorEnabled ? "CheckCircle" : "AlertCircle"} 
              size={20} 
              className={twoFactorEnabled ? 'text-success' : 'text-warning'} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} className="text-success" />
              <div>
                <div className="font-medium text-foreground">Email Verified</div>
                <div className="text-sm text-muted-foreground">Your email address is verified</div>
              </div>
            </div>
            <Icon name="CheckCircle" size={20} className="text-success" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="Smartphone" size={20} className="text-warning" />
              <div>
                <div className="font-medium text-foreground">Phone Verification</div>
                <div className="text-sm text-muted-foreground">Add phone number for account recovery</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Add Phone
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;