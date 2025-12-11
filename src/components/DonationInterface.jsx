import React, { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import { validateCampaignParameters } from '../services/transactionBuilder';
import TransactionMonitor from './TransactionMonitor';

const DonationInterface = ({
  campaign,
  onDonate,
  walletConnected = false,
  onConnectWallet
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    const lovelaceValue = Math.floor(numValue * 1_000_000);
    
    if (isNaN(numValue) || numValue <= 0) {
      return 'Please enter a valid amount';
    }

    if (lovelaceValue < campaign.min_contribution) {
      return `Minimum contribution is ${campaign.min_contribution / 1_000_000} ADA`;
    }

    const maxSingleContribution = campaign.total_goal * 0.5; // 50% of goal
    if (lovelaceValue > maxSingleContribution) {
      return `Maximum single contribution is ${maxSingleContribution / 1_000_000} ADA (50% of goal)`;
    }

    const remainingToMax = campaign.total_goal * 1.1 - campaign.current_funds;
    if (lovelaceValue > remainingToMax) {
      return `This contribution would exceed the maximum funding cap (110% of goal)`;
    }

    return null;
  };

  const handleDonate = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await onDonate({
        campaignId: campaign.id,
        amount: Math.floor(parseFloat(amount) * 1_000_000)
      });
      
      setTxHash(result.txHash);
      setAmount(''); // Clear amount after successful donation
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getProgressColor = () => {
    const percentage = (campaign.current_funds / campaign.total_goal) * 100;
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-primary';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="bg-card border border-border rounded-medical p-4 space-y-4">
      {/* Campaign Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">
            {((campaign.current_funds / campaign.total_goal) * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ 
              width: `${Math.min(
                (campaign.current_funds / campaign.total_goal) * 100,
                100
              )}%` 
            }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {(campaign.current_funds / 1_000_000).toFixed(2)} ADA raised
          </span>
          <span className="font-medium">
            {(campaign.total_goal / 1_000_000).toFixed(2)} ADA goal
          </span>
        </div>
      </div>

      {/* Donation Input */}
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          Donation Amount (ADA)
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(validateAmount(e.target.value));
            }}
            placeholder={`Min: ${campaign.min_contribution / 1_000_000} ADA`}
            className="w-full px-3 py-2 bg-input border border-border rounded-medical pr-16"
            min={campaign.min_contribution / 1_000_000}
            step="0.1"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            ADA
          </span>
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[10, 25, 50, 100, 250, 500].map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => {
              setAmount(quickAmount.toString());
              setError(validateAmount(quickAmount));
            }}
            className={`p-2 text-sm font-medium rounded-medical border transition-colors ${
              amount === quickAmount.toString()
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/50'
            }`}
          >
            {quickAmount} ADA
          </button>
        ))}
      </div>

      {/* Action Button */}
      <Button
        variant="default"
        onClick={handleDonate}
        loading={isProcessing}
        disabled={
          !amount || 
          parseFloat(amount) <= 0 || 
          error || 
          isProcessing
        }
        className="w-full"
        iconName={walletConnected ? 'Heart' : 'Wallet'}
        iconPosition="left"
      >
        {!walletConnected 
          ? 'Connect Wallet to Donate'
          : isProcessing
          ? 'Processing...'
          : `Donate ${amount || '0'} ADA`
        }
      </Button>

      {/* Transaction Status */}
      {txHash && (
        <TransactionMonitor
          txHash={txHash}
          onConfirmation={() => {
            setTxHash(null);
            // Optionally refresh campaign data
          }}
        />
      )}

      {/* Campaign Info */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Contributors</span>
          <span className="font-medium">{campaign.donorCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Min. Contribution</span>
          <span className="font-medium">
            {(campaign.min_contribution / 1_000_000).toFixed(2)} ADA
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time Remaining</span>
          <span className="font-medium">
            {Math.max(0, Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24)))} days
          </span>
        </div>
      </div>
    </div>
  );
};

export default DonationInterface;