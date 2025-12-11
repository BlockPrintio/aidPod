import React, { useState } from 'react';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import TransactionMonitor from '../TransactionMonitor';

const MilestoneClaimInterface = ({
  campaign,
  userRole,
  onClaim,
  walletConnected = false,
  onConnectWallet
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const canClaimMilestone = (milestone) => {
    const current = Date.now();
    const lastClaimTime = getLastMilestoneClaimTime(campaign.milestones);
    const minInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
    const milestoneThreshold = Math.floor(campaign.total_goal * milestone.percentage / 100);
    
    return (
      campaign.status === 'Active' &&
      !milestone.claimed &&
      current >= lastClaimTime + minInterval &&
      campaign.current_funds >= milestoneThreshold &&
      (userRole === 'creator' || userRole === 'beneficiary') &&
      (!campaign.verification_required || userRole === 'medical_authority')
    );
  };

  const getLastMilestoneClaimTime = (milestones) => {
    return milestones.reduce((latest, milestone) => {
      if (milestone.claimed && milestone.claim_date > latest) {
        return milestone.claim_date;
      }
      return latest;
    }, 0);
  };

  const handleClaim = async () => {
    if (!selectedMilestone || !walletConnected) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await onClaim({
        campaignId: campaign.id,
        milestonePercentage: selectedMilestone.percentage
      });
      
      setTxHash(result.txHash);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateClaimableAmount = (milestone) => {
    const milestoneThreshold = Math.floor(campaign.total_goal * milestone.percentage / 100);
    const previousMilestones = campaign.milestones.filter(m => 
      m.claimed && m.percentage < milestone.percentage
    );
    const previousClaimed = previousMilestones.reduce((sum, m) => sum + m.amount_claimed, 0);
    
    return Math.min(
      campaign.current_funds,
      milestoneThreshold - previousClaimed
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-medical p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Funding Milestones
        </h3>

        <div className="space-y-3">
          {campaign.milestones.map((milestone, index) => {
            const isClaimable = canClaimMilestone(milestone);
            const claimableAmount = calculateClaimableAmount(milestone);
            
            return (
              <div 
                key={index}
                className={`p-4 rounded-medical border ${
                  milestone.claimed
                    ? 'bg-success/10 border-success/20'
                    : isClaimable
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {milestone.claimed ? (
                      <Icon name="CheckCircle" size={16} className="text-success" />
                    ) : (
                      <Icon name="Circle" size={16} className="text-muted-foreground" />
                    )}
                    <span className="font-medium">
                      {milestone.percentage}% Milestone
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {(milestone.percentage * campaign.total_goal / 100 / 1_000_000).toFixed(2)} ADA
                  </span>
                </div>

                {milestone.claimed ? (
                  <div className="text-sm text-muted-foreground">
                    Claimed {(milestone.amount_claimed / 1_000_000).toFixed(2)} ADA 
                    on {new Date(milestone.claim_date).toLocaleDateString()}
                  </div>
                ) : isClaimable ? (
                  <div className="space-y-2">
                    <div className="text-sm text-primary">
                      {(claimableAmount / 1_000_000).toFixed(2)} ADA available to claim
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedMilestone(milestone)}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Claim Funds
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {campaign.current_funds < milestone.percentage * campaign.total_goal / 100
                      ? 'Insufficient funds raised'
                      : 'Previous milestone must be claimed first'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
          <div className="bg-card border border-border rounded-medical p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Claim Milestone Funds
            </h3>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-medical p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Milestone:</span>
                  <span className="font-medium">{selectedMilestone.percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount to Claim:</span>
                  <span className="font-medium">
                    {(calculateClaimableAmount(selectedMilestone) / 1_000_000).toFixed(2)} ADA
                  </span>
                </div>
                {campaign.verification_required && (
                  <div className="text-sm text-warning">
                    Requires medical authority signature
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-error/10 border border-error/20 rounded-medical p-4">
                  <div className="flex items-center space-x-2 text-error">
                    <Icon name="AlertTriangle" size={16} />
                    <span className="font-medium">Claim Failed</span>
                  </div>
                  <p className="mt-1 text-sm text-error">{error}</p>
                </div>
              )}

              {txHash && (
                <TransactionMonitor
                  txHash={txHash}
                  onConfirmation={() => {
                    setSelectedMilestone(null);
                    setTxHash(null);
                  }}
                />
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMilestone(null)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleClaim}
                  loading={isProcessing}
                  disabled={!walletConnected || isProcessing}
                  className="flex-1"
                >
                  {!walletConnected 
                    ? 'Connect Wallet'
                    : isProcessing
                    ? 'Processing...'
                    : 'Confirm Claim'
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneClaimInterface;