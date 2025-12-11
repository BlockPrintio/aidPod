import React, { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import TransactionMonitor from '../TransactionMonitor';

const RefundInterface = ({
  campaign,
  contribution,
  onRefund,
  walletConnected = false,
  onConnectWallet
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const isRefundable = () => {
    const current = Date.now();
    const gracePeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    return (
      campaign.status === 'Cancelled' ||
      (current > campaign.deadline + gracePeriod &&
       campaign.current_funds < campaign.total_goal)
    );
  };

  const handleRefund = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await onRefund({
        campaignId: campaign.id,
        amount: contribution.amount
      });
      
      setTxHash(result.txHash);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRefundStatus = () => {
    if (campaign.status === 'Cancelled') {
      return {
        canRefund: true,
        message: 'Campaign was cancelled. You can request a refund.'
      };
    }

    const current = Date.now();
    const gracePeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    if (current <= campaign.deadline) {
      return {
        canRefund: false,
        message: 'Campaign is still active. Refunds not available yet.'
      };
    }

    if (current <= campaign.deadline + gracePeriod) {
      return {
        canRefund: false,
        message: `Refunds will be available after ${new Date(campaign.deadline + gracePeriod).toLocaleDateString()}`
      };
    }

    if (campaign.current_funds >= campaign.total_goal) {
      return {
        canRefund: false,
        message: 'Campaign reached its goal. Refunds not available.'
      };
    }

    return {
      canRefund: true,
      message: 'Campaign did not reach its goal. You can request a refund.'
    };
  };

  const refundStatus = getRefundStatus();

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-medical p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Contribution Details
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Contributed:</span>
            <span className="font-medium">{contribution.amount / 1_000_000} ADA</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contribution Date:</span>
            <span className="font-medium">
              {new Date(contribution.date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span 
              className={`font-medium ${
                refundStatus.canRefund ? 'text-warning' : 'text-muted-foreground'
              }`}
            >
              {refundStatus.message}
            </span>
          </div>
        </div>

        {refundStatus.canRefund && (
          <div className="mt-4">
            <Button
              variant="warning"
              onClick={handleRefund}
              loading={isProcessing}
              disabled={!walletConnected || isProcessing}
              iconName="RefreshCcw"
              iconPosition="left"
              className="w-full"
            >
              {!walletConnected 
                ? 'Connect Wallet to Request Refund'
                : isProcessing
                ? 'Processing Refund...'
                : `Request Refund of ${contribution.amount / 1_000_000} ADA`
              }
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-medical p-4">
          <div className="flex items-center space-x-2 text-error">
            <Icon name="AlertTriangle" size={16} />
            <span className="font-medium">Refund Failed</span>
          </div>
          <p className="mt-1 text-sm text-error">{error}</p>
        </div>
      )}

      {txHash && (
        <TransactionMonitor
          txHash={txHash}
          onConfirmation={() => {
            // Handle successful refund confirmation
            setTxHash(null);
          }}
        />
      )}
    </div>
  );
};

export default RefundInterface;