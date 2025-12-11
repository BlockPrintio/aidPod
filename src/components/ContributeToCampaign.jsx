import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCampaignTransactions } from '../hooks/useCampaignTransactions';
import { adaToLovelace, lovelaceToAda } from '../lib/datum-helpers';
import Button from './ui/Button';
import Icon from './AppIcon';

export function ContributeToCampaign({ wallet, connected, campaignId, campaignUtxo, currentDatum }) {
  const { contributeToCampaign, loading, error } = useCampaignTransactions();
  const [contributionAmount, setContributionAmount] = useState(0);

  const handleContribute = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    if (contributionAmount < lovelaceToAda(currentDatum.min_contribution)) {
      alert(`Minimum contribution is ${lovelaceToAda(currentDatum.min_contribution)} ADA`);
      return;
    }

    try {
      const amountLovelace = adaToLovelace(contributionAmount);
      const txHash = await contributeToCampaign(wallet, campaignId, amountLovelace, campaignUtxo, currentDatum);
      alert(`Contribution successful! Transaction: ${txHash}`);
      setContributionAmount(0);
    } catch (err) {
      console.error('Failed to contribute:', err);
    }
  };

  const minContribution = lovelaceToAda(currentDatum.min_contribution);
  const progress = ((currentDatum.current_funds / currentDatum.total_goal) * 100).toFixed(1);
  const raised = lovelaceToAda(currentDatum.current_funds);
  const goal = lovelaceToAda(currentDatum.total_goal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-medical-md p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Icon name="Heart" size={20} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Support This Campaign</h3>
      </div>

      {/* Campaign Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">{raised.toLocaleString()} ADA raised</span>
          <span className="text-sm text-gray-600">Goal: {goal.toLocaleString()} ADA</span>
        </div>
      </div>

      {/* Contribution Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contribution Amount (ADA)
          </label>
          <div className="relative">
            <input
              type="number"
              min={minContribution}
              step="0.1"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(parseFloat(e.target.value) || 0)}
              placeholder={`Minimum: ${minContribution} ADA`}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              ADA
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum contribution: {minContribution} ADA
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[10, 25, 50, 100].map(amount => (
            <button
              key={amount}
              onClick={() => setContributionAmount(amount)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {amount} ADA
            </button>
          ))}
        </div>

        {/* Impact Message */}
        {contributionAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 text-blue-800">
              <Icon name="Info" size={16} />
              <span className="text-sm font-medium">Your Impact</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Your {contributionAmount} ADA contribution will help bring this campaign {((contributionAmount / goal) * 100).toFixed(2)}% closer to its goal.
            </p>
          </motion.div>
        )}

        {/* Contribute Button */}
        <Button
          onClick={handleContribute}
          disabled={loading || !connected || contributionAmount < minContribution}
          className="w-full"
          iconName={loading ? "Loader" : "Heart"}
          iconPosition="left"
        >
          {loading ? 'Processing...' : `Contribute ${contributionAmount || 0} ADA`}
        </Button>

        {/* Connection Status */}
        {!connected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Icon name="AlertTriangle" size={16} />
              <span className="text-sm font-medium">Wallet Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Please connect your Cardano wallet to contribute to this campaign.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <Icon name="AlertTriangle" size={16} />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Icon name="Shield" size={12} />
            <span>Secure Transaction</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="CheckCircle" size={12} />
            <span>Verified Campaign</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={12} />
            <span>Instant Processing</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
