import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCampaignTransactions } from '../hooks/useCampaignTransactions';
import { getNextClaimableMilestone, canClaimMilestone, lovelaceToAda } from '../lib/datum-helpers';
import Button from './ui/Button';
import Icon from './AppIcon';

export function ClaimMilestone({ wallet, connected, campaignId, campaignUtxo, currentDatum }) {
  const { claimMilestone, loading, error } = useCampaignTransactions();
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const nextMilestone = getNextClaimableMilestone(currentDatum.milestones);

  const handleClaim = async (milestonePercentage) => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    if (!canClaimMilestone(currentDatum.milestones, currentDatum.current_funds, currentDatum.total_goal, milestonePercentage)) {
      alert('Cannot claim this milestone yet');
      return;
    }

    try {
      const txHash = await claimMilestone(wallet, campaignId, milestonePercentage, campaignUtxo, currentDatum);
      alert(`Milestone claimed! Transaction: ${txHash}`);
    } catch (err) {
      console.error('Failed to claim milestone:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-medical-md p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon name="Target" size={20} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Claim Milestones</h3>
      </div>
      
      <div className="space-y-4">
        {currentDatum.milestones.map((milestone) => {
          const claimable = canClaimMilestone(
            currentDatum.milestones,
            currentDatum.current_funds,
            currentDatum.total_goal,
            milestone.percentage
          );
          
          const thresholdAda = lovelaceToAda((currentDatum.total_goal * milestone.percentage) / 100);
          const currentAda = lovelaceToAda(currentDatum.current_funds);
          
          return (
            <div key={milestone.percentage} className={`border rounded-lg p-4 ${
              milestone.claimed ? 'bg-green-50 border-green-200' :
              claimable ? 'bg-blue-50 border-blue-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.claimed ? 'bg-green-500' :
                    claimable ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}>
                    {milestone.claimed ? (
                      <Icon name="Check" size={16} className="text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">{milestone.percentage}%</span>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">
                      {milestone.percentage}% Milestone
                    </div>
                    <div className="text-sm text-gray-600">
                      Threshold: {thresholdAda.toLocaleString()} ADA
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {milestone.claimed ? 'Claimed' : claimable ? 'Available' : 'Locked'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Current: {currentAda.toLocaleString()} ADA
                  </div>
                </div>
              </div>
              
              {!milestone.claimed && claimable && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleClaim(milestone.percentage)}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                    iconName={loading ? "Loader" : "Download"}
                    iconPosition="left"
                  >
                    {loading ? 'Claiming...' : `Claim ${milestone.percentage}% Milestone`}
                  </Button>
                </div>
              )}
              
              {milestone.claimed && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center justify-between text-sm text-green-800">
                    <span>Claimed on {new Date(milestone.claim_date).toLocaleDateString()}</span>
                    <span>{lovelaceToAda(milestone.amount_claimed).toLocaleString()} ADA</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
            Connect your wallet to claim milestones.
          </p>
        </div>
      )}
    </motion.div>
  );
}
