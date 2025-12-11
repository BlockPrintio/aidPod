import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserWallet } from '@meshsdk/core';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [error, setError] = useState(null);

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
        await connect(savedWallet, false);
      } catch (error) {
        console.error('Failed to reconnect saved wallet:', error);
        localStorage.removeItem('aidpod_connected_wallet');
      }
    }
  };

  const connect = async (walletName, saveConnection = true) => {
    setIsLoading(true);
    setError(null);
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
      
      if (saveConnection) {
        localStorage.setItem('aidpod_connected_wallet', walletName);
      }
      
      console.log(`Connected to ${walletName}:`, info);
      return walletInstance;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(`Failed to connect to ${walletName}. Please make sure the wallet is installed and unlocked.`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
    setWalletInfo(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('aidpod_connected_wallet');
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

  const value = {
    wallet,
    walletInfo,
    isConnected,
    isLoading,
    availableWallets,
    error,
    connect,
    disconnect,
    formatAddress,
    formatBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
