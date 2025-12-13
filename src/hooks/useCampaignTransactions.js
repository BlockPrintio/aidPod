import { useState } from 'react';
import { createCampaign } from '../lib/mesh-sdk/campaign/createCampaign';
import { donateToCampaign } from '../lib/mesh-sdk/campaign/donateCampaign';

/**
 * Hook for campaign-related blockchain transactions
 * Simple wrapper around mesh-sdk transaction functions
 */
export function useCampaignTransactions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new campaign on blockchain
   */
  const handleCreateCampaign = async (hospitalName, initialFunding, wallet) => {
    setLoading(true);
    setError(null);
    
    try {
      const unsignedTx = await createCampaign(hospitalName, initialFunding, wallet);
      return unsignedTx;
    } catch (err) {
      console.error('❌ Campaign creation failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Donate to an existing campaign
   */
  const handleDonateToCampaign = async (donationAmount, wallet) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await donateToCampaign(donationAmount, wallet);
      return result;
    } catch (err) {
      console.error('❌ Donation failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Stub functions for components that might still use them
  const contributeToCampaign = async () => {
    console.warn('contributeToCampaign is not implemented yet');
    return '';
  };

  const claimMilestone = async () => {
    console.warn('claimMilestone is not implemented yet');
    return '';
  };

  const requestRefund = async () => {
    console.warn('requestRefund is not implemented yet');
    return '';
  };

  const pauseCampaign = async () => {
    console.warn('pauseCampaign is not implemented yet');
    return '';
  };

  const cancelCampaign = async () => {
    console.warn('cancelCampaign is not implemented yet');
    return '';
  };

  return {
    createCampaign: handleCreateCampaign,
    donateToCampaign: handleDonateToCampaign,
    contributeToCampaign,
    claimMilestone,
    requestRefund,
    pauseCampaign,
    cancelCampaign,
    loading,
    error,
  };
}
