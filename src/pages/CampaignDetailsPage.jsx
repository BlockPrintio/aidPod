import React, { useState } from 'react';
import { CampaignDetails } from '../components/CampaignDetails';

export default function CampaignDetailsPage() {
  const [wallet, setWallet] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleWalletChange = (walletInstance, info) => {
    setWallet(walletInstance);
    setWalletInfo(info);
    setConnected(!!walletInstance);
  };

  return (
    <CampaignDetails 
      wallet={wallet} 
      connected={connected}
      walletInfo={walletInfo}
      onWalletChange={handleWalletChange}
    />
  );
}
