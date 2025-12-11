import { useState } from 'react';
import { buildCreateCampaignTx } from '../lib/transactions/create-campaign';
import { buildSimpleCampaignTx, testWalletConnection } from '../lib/transactions/create-campaign-simple';
import { buildSimpleClaimTx, canClaimMilestone, getAvailableMilestones } from '../lib/transactions/claim-milestone-simple';
import { campaignService } from '../lib/services/campaign-service';
import { campaignStorage } from '../lib/storage/campaign-storage';
import { buildContributeTx } from '../lib/transactions/contribute-funds';
import { buildClaimMilestoneTx } from '../lib/transactions/claim-milestone';
import { buildRefundTx } from '../lib/transactions/refund';
import { buildPauseCampaignTx } from '../lib/transactions/pause-campaign';
import { buildCancelCampaignTx } from '../lib/transactions/cancel-campaign';

export function useCampaignTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCampaign = async (wallet, campaignData) => {
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
      const savedCampaign = campaignService.saveCampaign(campaignData, txHash);
      console.log('✅ Campaign saved:', savedCampaign.id);
      
      return txHash;
    } catch (err) {
      console.error('❌ Campaign creation failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contributeToCampaign = async (wallet, campaignId, amount, campaignUtxo, currentDatum) => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildContributeTx(wallet, campaignId, amount, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const claimMilestone = async (wallet, campaignData, milestonePercentage) => {
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
      const claimAmount = claimCheck.claimableAmount;
      campaignStorage.claimMilestone(campaignData.id, milestonePercentage, claimAmount, txHash);
      
      return txHash;
    } catch (err) {
      console.error('❌ Milestone claim failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestRefund = async (wallet, campaignId, amount, campaignUtxo, currentDatum) => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildRefundTx(wallet, campaignId, amount, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const pauseCampaign = async (wallet, campaignId, campaignUtxo, currentDatum) => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildPauseCampaignTx(wallet, campaignId, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelCampaign = async (wallet, campaignId, campaignUtxo, currentDatum, medicalAuthorityAddress) => {
    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildCancelCampaignTx(wallet, campaignId, campaignUtxo, currentDatum, medicalAuthorityAddress);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      return txHash;
    } catch (err) {
      setError(err.message);
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
