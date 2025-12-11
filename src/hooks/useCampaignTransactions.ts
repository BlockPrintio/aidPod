import { useState } from 'react';
import { buildCreateCampaignTx } from '../lib/transactions/create-campaign';
import { testWalletConnection } from '../lib/transactions/create-campaign-simple';
import { buildSimpleClaimTx, canClaimMilestone, getAvailableMilestones } from '../lib/transactions/claim-milestone-simple';
import { campaignService } from '../lib/services/campaign-service';
import { campaignStorage } from '../lib/storage/campaign-storage';
import { buildContributeTx } from '../lib/transactions/contribute-funds';
import { buildRefundTx } from '../lib/transactions/refund';
import { buildPauseCampaignTx } from '../lib/transactions/pause-campaign';
import { buildCancelCampaignTx } from '../lib/transactions/cancel-campaign';
import type { MeshWallet, UTxO, CampaignDatum, CampaignData } from '../types/mesh';

interface CreateCampaignData {
  campaignId?: number;
  title?: string;
  description?: string;
  totalGoal?: number;
  beneficiary?: string;
  medicalAuthority?: string;
  deadline?: Date;
  minContribution?: number;
  verificationRequired?: boolean;
  emergencyContact?: string;
}

export function useCampaignTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCampaign = async (wallet: MeshWallet, campaignData: CreateCampaignData): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // First test wallet connection
      console.log('🔍 Testing wallet connection...');
      const walletTest = await testWalletConnection(wallet);
      if (!walletTest.isValid) {
        throw new Error(`Wallet test failed: ${walletTest.error}`);
      }
      console.log('✅ Wallet connection test passed');

      // Use PROPER script transaction with validator interaction
      console.log('🏗️ Building SCRIPT campaign transaction with validator...');
      const unsignedTx = await buildCreateCampaignTx(wallet, campaignData);
      
      console.log('✍️ Signing transaction...');
      const signedTx = await wallet.signTx(unsignedTx);
      
      console.log('📤 Submitting transaction...');
      const txHash = await wallet.submitTx(signedTx);
      
      console.log('🎉 Campaign created! Transaction:', txHash);
      
      // Save campaign to local storage for dashboard display
      console.log('💾 Saving campaign to storage...');
      const savedCampaign = campaignService.saveCampaign(campaignData as CampaignData, txHash);
      console.log('✅ Campaign saved:', savedCampaign.id);
      
      return txHash;
    } catch (err) {
      const error = err as Error;
      console.error('❌ Campaign creation failed:', err);
      setError(error.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contributeToCampaign = async (
    wallet: MeshWallet,
    campaignId: number,
    amount: number,
    campaignUtxo: UTxO,
    currentDatum: CampaignDatum
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildContributeTx(wallet, campaignId, amount, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const claimMilestone = async (
    wallet: MeshWallet,
    campaignData: CampaignData,
    milestonePercentage: number
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // First test wallet connection
      console.log('🔍 Testing wallet connection for claim...');
      const walletTest = await testWalletConnection(wallet);
      if (!walletTest.isValid) {
        throw new Error(`Wallet test failed: ${walletTest.error}`);
      }

      // Check if user can claim this milestone
      const userAddress = await wallet.getChangeAddress();
      const claimCheck = canClaimMilestone(campaignData, milestonePercentage, userAddress);
      
      if (!claimCheck.canClaim) {
        throw new Error(claimCheck.reason);
      }

      console.log('✅ Claim eligibility verified');
      console.log('📊 Claimable amount:', claimCheck.claimableAmount, 'ADA');

      // Build simple claim transaction
      console.log('🏗️ Building claim transaction...');
      const unsignedTx = await buildSimpleClaimTx(wallet, campaignData, milestonePercentage);
      
      console.log('✍️ Signing claim transaction...');
      const signedTx = await wallet.signTx(unsignedTx);
      
      console.log('📤 Submitting claim transaction...');
      const txHash = await wallet.submitTx(signedTx);
      
      console.log('🎉 Milestone claimed! Transaction:', txHash);
      
      // Update campaign in storage to mark milestone as claimed
      console.log('💾 Updating campaign milestone status...');
      const claimAmount = claimCheck.claimableAmount || 0;
      const campaignId = typeof campaignData.id === 'string' ? campaignData.id : String(campaignData.id || '');
      campaignStorage.claimMilestone(campaignId, milestonePercentage, claimAmount, txHash);
      
      return txHash;
    } catch (err) {
      const error = err as Error;
      console.error('❌ Milestone claim failed:', err);
      setError(error.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (
    wallet: MeshWallet,
    campaignId: number,
    amount: number,
    campaignUtxo: UTxO,
    currentDatum: CampaignDatum
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildRefundTx(wallet, campaignId, amount, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pauseCampaign = async (
    wallet: MeshWallet,
    campaignId: number,
    campaignUtxo: UTxO,
    currentDatum: CampaignDatum
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildPauseCampaignTx(wallet, campaignId, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelCampaign = async (
    wallet: MeshWallet,
    campaignId: number,
    campaignUtxo: UTxO,
    currentDatum: CampaignDatum,
    medicalAuthorityAddress: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildCancelCampaignTx(wallet, campaignId, campaignUtxo, currentDatum, medicalAuthorityAddress);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCampaign,
    contributeToCampaign,
    claimMilestone,
    requestRefund,
    pauseCampaign,
    cancelCampaign,
    loading,
    error,
    // Utility functions for claiming
    canClaimMilestone,
    getAvailableMilestones
  };
}

