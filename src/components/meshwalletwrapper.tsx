import { CardanoWallet } from '@meshsdk/react';

/**
 * Mesh Wallet Component Wrapper
 * This component provides the Cardano wallet connection UI
 * The MeshProvider should wrap the entire app (see index.tsx)
 */
const MeshWalletWrapper = () => {
  return <CardanoWallet />;
};

export default MeshWalletWrapper;