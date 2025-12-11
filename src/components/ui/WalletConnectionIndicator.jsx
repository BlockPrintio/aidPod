import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const WalletConnectionIndicator = ({
  isConnected = false,
  balance = 0,
  walletAddress = '',
  isConnecting = false,
  onConnect = () => {},
  onDisconnect = () => {},
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })?.format(balance);
  };

  if (!isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onConnect}
        loading={isConnecting}
        iconName="Wallet"
        iconPosition="left"
        className={className}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center space-x-2 bg-success/10 text-success px-3 py-2 rounded-medical cursor-pointer hover:bg-success/20 transition-colors duration-200"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="font-mono text-sm font-medium">
            {formatBalance(balance)} ADA
          </span>
        </div>
        <Icon 
          name="ChevronDown" 
          size={14} 
          className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
        />
      </div>
      {showDetails && (
        <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-medical shadow-medical-lg z-dropdown">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-popover-foreground">Wallet Connected</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Active</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Address</label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-sm text-popover-foreground">
                    {formatAddress(walletAddress)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(walletAddress)}
                    className="p-1 hover:bg-muted rounded transition-colors duration-200"
                    title="Copy address"
                  >
                    <Icon name="Copy" size={12} />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Balance</label>
                <div className="font-mono text-lg font-semibold text-popover-foreground mt-1">
                  {formatBalance(balance)} ADA
                </div>
                <div className="text-xs text-muted-foreground">
                  ≈ ${(balance * 0.35)?.toFixed(2)} USD
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                iconName="LogOut"
                iconPosition="left"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectionIndicator;