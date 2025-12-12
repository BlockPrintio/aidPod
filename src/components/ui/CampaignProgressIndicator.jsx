import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const CampaignProgressIndicator = ({
  currentAmount = 0,
  targetAmount = 100000,
  currency = 'ADA',
  ngnRate = 1600,
  donorCount = 0,
  daysRemaining = null,
  isLive = true,
  showDetails = true,
  size = 'default', // 'sm', 'default', 'lg'
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showNGN, setShowNGN] = useState(false);

  const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const formatAmount = (amount, showCurrency = true) => {
    const formatted = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })?.format(amount);
    
    return showCurrency ? `${formatted} ${currency}` : formatted;
  };

  const formatNGNAmount = (adaAmount) => {
    const ngnAmount = adaAmount * ngnRate;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(ngnAmount);
  };

  const getProgressColor = () => {
    if (progressPercentage >= 100) return 'bg-success';
    if (progressPercentage >= 75) return 'bg-secondary';
    if (progressPercentage >= 50) return 'bg-primary';
    if (progressPercentage >= 25) return 'bg-warning';
    return 'bg-muted-foreground';
  };

  const getProgressTextColor = () => {
    if (progressPercentage >= 100) return 'text-success';
    if (progressPercentage >= 75) return 'text-secondary';
    if (progressPercentage >= 50) return 'text-primary';
    if (progressPercentage >= 25) return 'text-warning';
    return 'text-muted-foreground';
  };

  const sizeConfig = {
    sm: {
      height: 'h-2',
      textSize: 'text-sm',
      spacing: 'space-y-2'
    },
    default: {
      height: 'h-3',
      textSize: 'text-base',
      spacing: 'space-y-3'
    },
    lg: {
      height: 'h-4',
      textSize: 'text-lg',
      spacing: 'space-y-4'
    }
  };

  const sizeStyles = sizeConfig?.[size];

  return (
    <div className={`${sizeStyles?.spacing} ${className}`}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNGN(!showNGN)}
            className={`font-bold ${sizeStyles?.textSize} ${getProgressTextColor()} hover:opacity-80 transition-opacity duration-200`}
          >
            {showNGN ? formatNGNAmount(currentAmount) : formatAmount(currentAmount)}
          </button>
          {isLive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-breathing"></div>
              <span className="text-xs text-success font-medium">LIVE</span>
            </div>
          )}
        </div>
        <div className={`text-muted-foreground ${sizeStyles?.textSize === 'text-sm' ? 'text-xs' : 'text-sm'}`}>
          {progressPercentage?.toFixed(1)}% of {showNGN ? formatNGNAmount(targetAmount) : formatAmount(targetAmount)}
        </div>
      </div>
      {/* Progress Bar */}
      <div className="relative">
        <div className={`w-full ${sizeStyles?.height} bg-muted rounded-full overflow-hidden`}>
          <div
            className={`${sizeStyles?.height} ${getProgressColor()} rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${animatedProgress}%` }}
          >
            {progressPercentage >= 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            )}
          </div>
        </div>
        
        {/* Progress Milestones */}
        {size !== 'sm' && (
          <div className="absolute top-0 w-full flex justify-between">
            {[25, 50, 75]?.map((milestone) => (
              <div
                key={milestone}
                className={`w-0.5 ${sizeStyles?.height} ${
                  progressPercentage >= milestone ? 'bg-white/50' : 'bg-border'
                }`}
                style={{ marginLeft: `${milestone}%` }}
              ></div>
            ))}
          </div>
        )}
      </div>
      {/* Progress Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{donorCount?.toLocaleString()} donors</span>
            </div>
            {daysRemaining !== null && (
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>
                  {daysRemaining > 0 
                    ? `${daysRemaining} days left`
                    : daysRemaining === 0 
                    ? 'Last day' :'Campaign ended'
                  }
                </span>
              </div>
            )}
          </div>
          
            <div className="text-xs">
            Remaining: {showNGN 
              ? formatNGNAmount(Math.max(0, targetAmount - currentAmount))
              : formatAmount(Math.max(0, targetAmount - currentAmount))
            }
          </div>
        </div>
      )}
      {/* Achievement Badge */}
      {progressPercentage >= 100 && (
        <div className="flex items-center justify-center space-x-2 bg-success/10 text-success px-3 py-2 rounded-medical">
          <Icon name="Trophy" size={16} />
          <span className="text-sm font-medium">Goal Achieved!</span>
          <Icon name="Sparkles" size={16} />
        </div>
      )}
    </div>
  );
};

export default CampaignProgressIndicator;