import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCampaignTransactions } from '../hooks/useCampaignTransactions';
import { getCampaignStatusText } from '../lib/datum-helpers';
import Button from './ui/Button';
import Icon from './AppIcon';

// Stub functions for pause and cancel (not yet implemented)
const buildPauseCampaignTx = async () => {
  throw new Error('Pause campaign functionality is not yet implemented');
};

const buildCancelCampaignTx = async () => {
  throw new Error('Cancel campaign functionality is not yet implemented');
};

export function CampaignManagement({ wallet, connected, campaignId, campaignUtxo, currentDatum }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePause = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const unsignedTx = await buildPauseCampaignTx(wallet, campaignId, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      alert(`Campaign paused! Transaction: ${txHash}`);
    } catch (err) {
      console.error('Failed to pause campaign:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Resume is similar to pause but sets status to 0 (Active)
      const updatedDatum = {
        ...currentDatum,
        status: 0, // Active
        last_updated: Date.now()
      };
      
      // For now, we'll use the pause transaction builder with modified datum
      // In a real implementation, you'd have a separate resume transaction builder
      alert('Resume functionality needs to be implemented with proper redeemer');
    } catch (err) {
      console.error('Failed to resume campaign:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    if (!confirm('Are you sure you want to cancel this campaign? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const medicalAuthorityAddress = currentDatum.verification_required 
        ? currentDatum.medical_authority 
        : undefined;
      
      const unsignedTx = await buildCancelCampaignTx(wallet, campaignId, campaignUtxo, currentDatum, medicalAuthorityAddress);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      alert(`Campaign cancelled! Transaction: ${txHash}`);
    } catch (err) {
      console.error('Failed to cancel campaign:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    const allMilestonesClaimed = currentDatum.milestones.every((m) => m.claimed);
    if (!allMilestonesClaimed) {
      alert('All milestones must be claimed before completing the campaign');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Complete campaign functionality would be implemented here
      alert('Complete campaign functionality needs to be implemented');
    } catch (err) {
      console.error('Failed to complete campaign:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-medical-md p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Icon name="Settings" size={20} className="text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Campaign Management</h3>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Current Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentDatum.status === 0 ? 'bg-green-100 text-green-800' :
            currentDatum.status === 1 ? 'bg-yellow-100 text-yellow-800' :
            currentDatum.status === 2 ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {getCampaignStatusText(currentDatum.status)}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Last updated: {new Date(currentDatum.last_updated).toLocaleString()}
        </p>
      </div>
      
      <div className="space-y-3">
        {currentDatum.status === 0 && ( // Active
          <>
            <Button
              onClick={handlePause}
              disabled={loading}
              variant="outline"
              className="w-full"
              iconName={loading ? "Loader" : "Pause"}
              iconPosition="left"
            >
              {loading ? 'Processing...' : 'Pause Campaign'}
            </Button>
            
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="destructive"
              className="w-full"
              iconName={loading ? "Loader" : "X"}
              iconPosition="left"
            >
              {loading ? 'Processing...' : 'Cancel Campaign'}
            </Button>
            
            {currentDatum.current_funds >= currentDatum.total_goal && (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="w-full"
                iconName={loading ? "Loader" : "CheckCircle"}
                iconPosition="left"
              >
                {loading ? 'Processing...' : 'Complete Campaign'}
              </Button>
            )}
          </>
        )}
        
        {currentDatum.status === 1 && ( // Paused
          <>
            <Button
              onClick={handleResume}
              disabled={loading}
              className="w-full"
              iconName={loading ? "Loader" : "Play"}
              iconPosition="left"
            >
              {loading ? 'Processing...' : 'Resume Campaign'}
            </Button>
            
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="destructive"
              className="w-full"
              iconName={loading ? "Loader" : "X"}
              iconPosition="left"
            >
              {loading ? 'Processing...' : 'Cancel Campaign'}
            </Button>
          </>
        )}
        
        {(currentDatum.status === 2 || currentDatum.status === 3) && (
          <div className="text-center py-4">
            <Icon name="Info" size={24} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              This campaign is {getCampaignStatusText(currentDatum.status).toLowerCase()} and cannot be modified.
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {!connected && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Wallet Required</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Connect your wallet to manage this campaign.
          </p>
        </div>
      )}
    </motion.div>
  );
}
