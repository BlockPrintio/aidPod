import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const WalletSection = ({ 
  wallets = [], 
  onConnectWallet = () => {},
  onDisconnectWallet = () => {},
  onSwitchWallet = () => {}
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);

  const supportedWallets = [
    {
      id: 'nami',
      name: 'Nami',
      icon: 'Wallet',
      description: 'Popular Cardano wallet with easy-to-use interface'
    },
    {
      id: 'eternl',
      name: 'Eternl',
      icon: 'Shield',
      description: 'Advanced features and multi-account support'
    },
    {
      id: 'lace',
      name: 'Lace',
      icon: 'Layers',
      description: 'IOG\'s official light wallet for Cardano'
    },
    {
      id: 'typhon',
      name: 'Typhon',
      icon: 'Zap',
      description: 'Feature-rich wallet with DeFi integration'
    }
  ];

  const handleConnectWallet = async (walletId) => {
    setIsConnecting(true);
    setConnectingWallet(walletId);
    try {
      await onConnectWallet(walletId);
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address?.slice(0, 8)}...${address?.slice(-8)}`;
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })?.format(balance);
  };

  const connectedWallets = wallets?.filter(w => w?.isConnected);
  const primaryWallet = connectedWallets?.find(w => w?.isPrimary) || connectedWallets?.[0];

  return (
    <div className="space-y-6">
      {/* Connected Wallets */}
      {connectedWallets?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Connected Wallets</h3>
          
          {/* Primary Wallet Display */}
          {primaryWallet && (
            <div className="bg-gradient-trust border border-border rounded-medical p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-medical flex items-center justify-center">
                    <Icon name="Wallet" size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{primaryWallet?.name}</div>
                    <div className="text-sm text-muted-foreground">Primary Wallet</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-success font-medium">Connected</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Balance</label>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {formatBalance(primaryWallet?.balance)} ADA
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ ${(primaryWallet?.balance * 0.35)?.toFixed(2)} USD
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Address</label>
                  <div className="font-mono text-sm text-foreground">
                    {formatAddress(primaryWallet?.address)}
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(primaryWallet?.address)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                  >
                    Copy full address
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Last synced: {new Date(primaryWallet.lastSync)?.toLocaleTimeString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="RefreshCw"
                    iconPosition="left"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ExternalLink"
                    iconPosition="left"
                  >
                    View on Explorer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Connected Wallets */}
          {connectedWallets?.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Other Connected Wallets</h4>
              {connectedWallets?.filter(w => !w?.isPrimary)?.map((wallet) => (
                <div key={wallet?.id} className="bg-card border border-border rounded-medical p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-medical flex items-center justify-center">
                        <Icon name="Wallet" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{wallet?.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {formatAddress(wallet?.address)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-mono text-sm font-medium">
                          {formatBalance(wallet?.balance)} ADA
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSwitchWallet(wallet?.id)}
                      >
                        Set Primary
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Connect New Wallet */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Connect Wallet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportedWallets?.map((wallet) => {
            const isConnected = connectedWallets?.some(w => w?.id === wallet?.id);
            const isConnectingThis = connectingWallet === wallet?.id;
            
            return (
              <div
                key={wallet?.id}
                className={`bg-card border rounded-medical p-4 transition-all duration-200 ${
                  isConnected 
                    ? 'border-success bg-success/5' :'border-border hover:border-primary/50 hover:shadow-medical-sm'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-medical flex items-center justify-center ${
                    isConnected ? 'bg-success/10' : 'bg-muted'
                  }`}>
                    <Icon 
                      name={wallet?.icon} 
                      size={20} 
                      className={isConnected ? 'text-success' : 'text-muted-foreground'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{wallet?.name}</div>
                    <div className="text-sm text-muted-foreground">{wallet?.description}</div>
                  </div>
                </div>
                {isConnected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-success">
                      <Icon name="CheckCircle" size={16} />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDisconnectWallet(wallet?.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    loading={isConnectingThis}
                    onClick={() => handleConnectWallet(wallet?.id)}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    {isConnectingThis ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Wallet Security Tips */}
      <div className="bg-warning/5 border border-warning/20 rounded-medical p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-2">Wallet Security Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Never share your seed phrase or private keys</li>
              <li>• Always verify transaction details before signing</li>
              <li>• Keep your wallet software updated</li>
              <li>• Use hardware wallets for large amounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSection;