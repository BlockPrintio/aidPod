import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCampaignTransactions } from '../hooks/useCampaignTransactions';
import { canRequestRefund, lovelaceToAda, adaToLovelace } from '../lib/datum-helpers';
import { buildRefundTx } from '../lib/transactions/refund';
import Button from './ui/Button';
import Icon from './AppIcon';

export function RequestRefund({ 
  wallet, 
  connected, 
  campaignId, 
  campaignUtxo, 
  currentDatum, 
  userContributionAmount = 0 // User's total contribution in lovelace
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refundAmount, setRefundAmount] = useState(lovelaceToAda(userContributionAmount));

  const isRefundable = canRequestRefund(
    currentDatum.status,
    currentDatum.deadline,
    currentDatum.current_funds,
    currentDatum.total_goal
  );

  const handleRefund = async () => {
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    if (!isRefundable) {
      alert('Refunds are not available for this campaign');
      return;
    }

    if (refundAmount > lovelaceToAda(userContributionAmount)) {
      alert('Refund amount cannot exceed your contribution');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const amountLovelace = adaToLovelace(refundAmount);
      const unsignedTx = await buildRefundTx(wallet, campaignId, amountLovelace, campaignUtxo, currentDatum);
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      alert(`Refund successful! Transaction: ${txHash}`);
    } catch (err) {
      console.error('Failed to process refund:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isRefundable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-xl border border-gray-200 p-6"
      >
        <div className="text-center">
          <Icon name="Info" size={24} className="text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Refunds Not Available</h3>
          <p className="text-sm text-gray-600">
            Refunds are only available for cancelled campaigns or campaigns that didn't reach their goal after the deadline.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-medical-md p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Icon name="RefreshCw" size={20} className="text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Request Refund</h3>
      </div>

      {/* Refund Eligibility Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-orange-800 mb-2">
          <Icon name="AlertTriangle" size={16} />
          <span className="text-sm font-medium">Refund Available</span>
        </div>
        <p className="text-sm text-orange-700">
          {currentDatum.status === 3 
            ? 'This campaign has been cancelled. You can request a refund of your contribution.'
            : 'This campaign did not reach its funding goal within the deadline. Refunds are now available.'
          }
        </p>
      </div>

      {/* Contribution Summary */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Your Contribution</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Contributed:</span>
            <span className="text-lg font-semibold text-gray-900">
              {lovelaceToAda(userContributionAmount).toLocaleString()} ADA
            </span>
          </div>
        </div>
      </div>

      {/* Refund Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Refund Amount (ADA)
        </label>
        <div className="relative">
          <input
            type="number"
            max={lovelaceToAda(userContributionAmount)}
            min="0.1"
            step="0.1"
            value={refundAmount}
            onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
            placeholder="Refund amount in ADA"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            ADA
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Maximum refund: {lovelaceToAda(userContributionAmount).toLocaleString()} ADA
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => setRefundAmount(lovelaceToAda(userContributionAmount) * 0.25)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          25%
        </button>
        <button
          onClick={() => setRefundAmount(lovelaceToAda(userContributionAmount) * 0.5)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          50%
        </button>
        <button
          onClick={() => setRefundAmount(lovelaceToAda(userContributionAmount))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          100%
        </button>
      </div>

      {/* Request Refund Button */}
      <Button
        onClick={handleRefund}
        disabled={loading || !connected || refundAmount <= 0 || refundAmount > lovelaceToAda(userContributionAmount)}
        className="w-full"
        iconName={loading ? "Loader" : "RefreshCw"}
        iconPosition="left"
      >
        {loading ? 'Processing...' : `Request ${refundAmount || 0} ADA Refund`}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Connection Status */}
      {!connected && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-sm font-medium">Wallet Required</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Connect your wallet to request a refund.
          </p>
        </div>
      )}

      {/* Refund Process Info */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Refund Process</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={12} />
            <span>Refunds are processed immediately on-chain</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={12} />
            <span>Secure smart contract execution</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={12} />
            <span>Funds returned to your wallet address</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
