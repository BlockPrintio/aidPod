import React, { useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import Button from './ui/Button';
import Icon from './AppIcon';

const WalletConnector = ({ onWalletChange }) => {
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    checkAvailableWallets();
    checkExistingConnection();
  }, []);

  const checkAvailableWallets = () => {
    try {
      const wallets = BrowserWallet.getInstalledWallets();
      // Extract wallet names from wallet objects
      const walletNames = wallets.map(wallet => {
        if (typeof wallet === 'string') {
          return wallet;
        } else if (wallet && wallet.name) {
          return wallet.name;
        } else if (wallet && wallet.id) {
          return wallet.id;
        }
        return wallet;
      });
      setAvailableWallets(walletNames);
    } catch (error) {
      console.error('Error checking available wallets:', error);
      setAvailableWallets([]);
    }
  };

  const checkExistingConnection = async () => {
    const savedWallet = localStorage.getItem('aidpod_connected_wallet');
    if (savedWallet) {
      try {
        await handleConnect(savedWallet, false);
      } catch (error) {
        console.error('Failed to reconnect saved wallet:', error);
        localStorage.removeItem('aidpod_connected_wallet');
      }
    }
  };

  const handleConnect = async (walletName, saveConnection = true) => {
    setIsLoading(true);
    try {
      const walletInstance = await BrowserWallet.enable(walletName);
      
      // Get wallet information
      const address = await walletInstance.getChangeAddress();
      const balance = await walletInstance.getBalance();
      const networkId = await walletInstance.getNetworkId();
      
      const info = {
        name: walletName,
        address: address,
        balance: balance,
        networkId: networkId
      };

      setWallet(walletInstance);
      setWalletInfo(info);
      setIsConnected(true);
      setShowWalletList(false);
      
      if (saveConnection) {
        localStorage.setItem('aidpod_connected_wallet', walletName);
      }
      
      // Notify parent component
      if (onWalletChange) {
        onWalletChange(walletInstance, info);
      }
      
      console.log(`Connected to ${walletName}:`, info);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Failed to connect to ${walletName}. Please make sure the wallet is installed and unlocked.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWallet(null);
    setWalletInfo(null);
    setIsConnected(false);
    setShowWalletList(false);
    localStorage.removeItem('aidpod_connected_wallet');
    
    // Notify parent component
    if (onWalletChange) {
      onWalletChange(null, null);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatBalance = (balance) => {
    if (!balance || !Array.isArray(balance)) return '0';
    const lovelaceAmount = balance.find(asset => asset.unit === 'lovelace');
    if (!lovelaceAmount) return '0';
    return (parseInt(lovelaceAmount.quantity) / 1_000_000).toFixed(2);
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Icon name="Loader" size={16} className="animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (isConnected && walletInfo) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowWalletList(!showWalletList)}
          className="space-x-2"
        >
          <Icon name="Wallet" size={16} />
          <span>{formatBalance(walletInfo.balance)} ADA</span>
          <Icon name={showWalletList ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>

        {showWalletList && (
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4 z-50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Connected to</span>
                <span className="text-sm font-medium capitalize">{walletInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Network</span>
                <span className="text-sm font-medium">
                  {walletInfo.networkId === 0 ? 'Testnet' : 'Mainnet'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Address</span>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {formatAddress(walletInfo.address)}
                  </code>
                  <button 
                    onClick={() => navigator.clipboard.writeText(walletInfo.address)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Icon name="Copy" size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Balance</span>
                <span className="text-sm font-medium">{formatBalance(walletInfo.balance)} ADA</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                className="w-full"
                iconName="LogOut"
                iconPosition="left"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowWalletList(!showWalletList)}
        iconName="Wallet"
        iconPosition="left"
      >
        Connect Wallet
      </Button>

      {showWalletList && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Connect Wallet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select a Cardano wallet to connect
            </p>
          </div>

          <div className="p-2">
            {availableWallets.length > 0 ? (
              availableWallets.map((walletName) => (
                <button
                  key={walletName}
                  onClick={() => handleConnect(walletName)}
                  disabled={isLoading}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="Wallet" size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 capitalize">
                      {walletName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cardano Wallet
                    </div>
                  </div>
                  <div className="text-xs text-green-600">
                    Installed
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center">
                <Icon name="AlertTriangle" size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">No wallets found</p>
                <p className="text-xs text-gray-400">
                  Please install a Cardano wallet like Nami, Eternl, or Flint
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
