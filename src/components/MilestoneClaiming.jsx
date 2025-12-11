import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCampaignTransactions } from '../hooks/useCampaignTransactions';
import { useWallet } from '../hooks/useWallet';
import Button from './ui/Button';
import Icon from './AppIcon';

export function MilestoneClaiming({ campaign }) {
  const { wallet, walletInfo, isConnected } = useWallet();
  const { claimMilestone, getAvailableMilestones, loading, error } = useCampaignTransactions();
  
  const [availableMilestones, setAvailableMilestones] = useState([]);
  const [claimingMilestone, setClaimingMilestone] = useState(null);

  // Check available milestones when component mounts or wallet changes
  useEffect(() => {
    if (isConnected && walletInfo && campaign) {
      const milestones = getAvailableMilestones(campaign, walletInfo.address);
      setAvailableMilestones(milestones);
    }
  }, [isConnected, walletInfo, campaign, getAvailableMilestones]);

  const handleClaimMilestone = async (milestonePercentage) => {
    if (!isConnected || !wallet) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setClaimingMilestone(milestonePercentage);
      
      const txHash = await claimMilestone(wallet, campaign, milestonePercentage);
      
      // Show success with testnet explorer link
      const testnetExplorerUrl = `https://preprod.cardanoscan.io/transaction/${txHash}`;
      alert(`🎉 Milestone ${milestonePercentage}% claimed successfully!\n\nTransaction Hash: ${txHash}\n\nView on Testnet Explorer:\n${testnetExplorerUrl}`);
      
      // Refresh available milestones
      const updatedMilestones = getAvailableMilestones(campaign, walletInfo.address);
      setAvailableMilestones(updatedMilestones);
      
    } catch (err) {
      console.error('Claim failed:', err);
      alert(`Failed to claim milestone: ${err.message}`);
    } finally {
      setClaimingMilestone(null);
    }
  };

  if (!campaign) {
    return null;
  }

  // Check if user is the beneficiary
  const userIsBeneficiary = isConnected && walletInfo && 
    walletInfo.address === campaign.beneficiary;

  if (!userIsBeneficiary) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Icon name="Award" className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600">Milestone Claiming</h3>
        </div>
        <p className="text-gray-500">
          Only the campaign beneficiary can claim milestone funds.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="Award" className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Claim Milestones</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {availableMilestones.map((milestone) => (
          <div
            key={milestone.percentage}
            className={`p-4 rounded-lg border-2 transition-colors ${
              milestone.canClaim
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    {milestone.percentage}% Milestone
                  </span>
                  {milestone.canClaim && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Available
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {milestone.reason}
                </p>
                
                {milestone.claimableAmount && (
                  <p className="text-sm font-medium text-green-600">
                    Claimable: {milestone.claimableAmount.toFixed(2)} ADA
                  </p>
                )}
              </div>

              <div className="ml-4">
                {milestone.canClaim ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleClaimMilestone(milestone.percentage)}
                    disabled={loading || claimingMilestone === milestone.percentage}
                    iconName={claimingMilestone === milestone.percentage ? "Loader" : "Download"}
                    iconPosition="left"
                  >
                    {claimingMilestone === milestone.percentage ? 'Claiming...' : 'Claim'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    iconName="Lock"
                    iconPosition="left"
                  >
                    Locked
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">How Milestone Claiming Works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Milestones unlock as your campaign reaches funding targets</li>
              <li>Only the beneficiary can claim milestone funds</li>
              <li>Claimed funds are sent directly to your wallet</li>
              <li>Each milestone can only be claimed once</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MilestoneClaiming;
