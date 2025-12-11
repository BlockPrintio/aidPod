import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import type { MeshWallet } from '../types/mesh';

interface WalletInfo {
  name: string;
  address: string;
  balance: string | Array<{ unit: string; quantity: string }>;
  networkId: number;
}

interface WalletContextValue {
  wallet: MeshWallet | null;
  walletInfo: WalletInfo | null;
  isConnected: boolean;
  isLoading: boolean;
  availableWallets: string[];
  error: string | null;
  connect: (walletName: string, saveConnection?: boolean) => Promise<MeshWallet>;
  disconnect: () => void;
  formatAddress: (address: string | null | undefined) => string;
  formatBalance: (balance: Array<{ unit: string; quantity: string }> | null | undefined) => string;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [wallet, setWallet] = useState<MeshWallet | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAvailableWallets();
    checkExistingConnection();
  }, []);

  const checkAvailableWallets = (): void => {
    try {
      const wallets = BrowserWallet.getInstalledWallets();
      // Extract wallet names from wallet objects
      const walletNames = wallets.map(wallet => {
        if (typeof wallet === 'string') {
          return wallet;
        } else if (wallet && typeof wallet === 'object' && 'name' in wallet) {
          return wallet.name as string;
        } else if (wallet && typeof wallet === 'object' && 'id' in wallet && wallet.id) {
          return String(wallet.id);
        }
        return String(wallet);
      });
      setAvailableWallets(walletNames);
    } catch (error) {
      console.error('Error checking available wallets:', error);
      setAvailableWallets([]);
    }
  };

  const checkExistingConnection = async (): Promise<void> => {
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

  const connect = async (walletName: string, saveConnection: boolean = true): Promise<MeshWallet> => {
    setIsLoading(true);
    setError(null);
    try {
      const walletInstance = await BrowserWallet.enable(walletName) as unknown as MeshWallet;
      
      // Get wallet information
      const address = await walletInstance.getChangeAddress();
      const balance = await walletInstance.getBalance();
      const networkId = await walletInstance.getNetworkId();
      
      const info: WalletInfo = {
        name: walletName,
        address: address,
        balance: Array.isArray(balance) ? formatBalance(balance) : balance,
        networkId: networkId as number
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to connect to ${walletName}. Please make sure the wallet is installed and unlocked.`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = (): void => {
    setWallet(null);
    setWalletInfo(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem('aidpod_connected_wallet');
  };

  const formatAddress = (address: string | null | undefined): string => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatBalance = (balance: Array<{ unit: string; quantity: string }> | null | undefined): string => {
    if (!balance || !Array.isArray(balance)) return '0';
    const lovelaceAmount = balance.find(asset => asset.unit === 'lovelace');
    if (!lovelaceAmount) return '0';
    return (parseInt(lovelaceAmount.quantity) / 1_000_000).toFixed(2);
  };

  const value: WalletContextValue = {
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

