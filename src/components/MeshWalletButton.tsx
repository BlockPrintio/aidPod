import { CardanoWallet } from '@meshsdk/react';

/**
 * Mesh Wallet Button Component
 * Use this component anywhere you need wallet connection UI
 * The MeshProvider wraps the entire app in index.tsx
 */
const MeshWalletButton = () => {
  return (
    <div className="mesh-wallet-container">
      <CardanoWallet />
    </div>
  );
};

export default MeshWalletButton;

