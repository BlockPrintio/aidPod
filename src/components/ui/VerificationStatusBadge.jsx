import React, { useState } from 'react';
import Icon from '../AppIcon';

const VerificationStatusBadge = ({
  status = 'unverified', // 'verified', 'pending', 'unverified', 'rejected'
  verifierName = '',
  verificationDate = null,
  credentialDetails = null,
  showTooltip = true,
  size = 'default', // 'sm', 'default', 'lg'
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    verified: {
      icon: 'ShieldCheck',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      label: 'Verified',
      description: 'Medical credentials verified by healthcare institution'
    },
    pending: {
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      label: 'Pending',
      description: 'Verification in progress by medical professionals'
    },
    unverified: {
      icon: 'AlertCircle',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-muted',
      label: 'Unverified',
      description: 'Medical verification not yet completed'
    },
    rejected: {
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
      label: 'Rejected',
      description: 'Verification could not be completed'
    }
  };

  const sizeConfig = {
    sm: {
      iconSize: 14,
      textSize: 'text-xs',
      padding: 'px-2 py-1',
      spacing: 'space-x-1'
    },
    default: {
      iconSize: 16,
      textSize: 'text-sm',
      padding: 'px-3 py-1.5',
      spacing: 'space-x-2'
    },
    lg: {
      iconSize: 18,
      textSize: 'text-base',
      padding: 'px-4 py-2',
      spacing: 'space-x-2'
    }
  };

  const config = statusConfig?.[status];
  const sizeStyles = sizeConfig?.[size];

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const BadgeContent = () => (
    <div
      className={`inline-flex items-center ${sizeStyles?.spacing} ${sizeStyles?.padding} ${config?.bgColor} ${config?.borderColor} border rounded-medical font-medium ${config?.color} ${sizeStyles?.textSize} ${className}`}
      onMouseEnter={() => showTooltip && setShowDetails(true)}
      onMouseLeave={() => showTooltip && setShowDetails(false)}
    >
      <Icon name={config?.icon} size={sizeStyles?.iconSize} />
      <span>{config?.label}</span>
      {status === 'verified' && (
        <div className={`w-2 h-2 ${config?.bgColor?.replace('/10', '')} rounded-full animate-pulse ml-1`}></div>
      )}
    </div>
  );

  if (!showTooltip) {
    return <BadgeContent />;
  }

  return (
    <div className="relative inline-block">
      <BadgeContent />
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-popover border border-border rounded-medical shadow-medical-lg z-dropdown">
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name={config?.icon} size={20} className={config?.color} />
              <div>
                <div className={`font-semibold ${config?.color}`}>{config?.label}</div>
                <div className="text-xs text-muted-foreground">{config?.description}</div>
              </div>
            </div>

            {status === 'verified' && verifierName && (
              <div className="border-t border-border pt-3 space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Verified By</label>
                  <div className="text-sm text-popover-foreground font-medium">{verifierName}</div>
                </div>
                
                {verificationDate && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Verification Date</label>
                    <div className="text-sm text-popover-foreground">{formatDate(verificationDate)}</div>
                  </div>
                )}

                {credentialDetails && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Credentials</label>
                    <div className="text-sm text-popover-foreground">
                      {credentialDetails?.licenseNumber && (
                        <div className="font-mono text-xs">License: {credentialDetails?.licenseNumber}</div>
                      )}
                      {credentialDetails?.institution && (
                        <div>{credentialDetails?.institution}</div>
                      )}
                      {credentialDetails?.specialty && (
                        <div className="text-muted-foreground">{credentialDetails?.specialty}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === 'pending' && (
              <div className="border-t border-border pt-3">
                <div className="flex items-center space-x-2 text-warning">
                  <div className="w-2 h-2 bg-warning rounded-full animate-breathing"></div>
                  <span className="text-sm">Verification in progress...</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Medical professionals are reviewing the submitted documentation
                </div>
              </div>
            )}

            {status === 'rejected' && (
              <div className="border-t border-border pt-3">
                <div className="text-sm text-error">
                  Verification could not be completed. Please contact support for assistance.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatusBadge;