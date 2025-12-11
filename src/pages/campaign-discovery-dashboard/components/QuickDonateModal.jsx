import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import CampaignProgressIndicator from '../../../components/ui/CampaignProgressIndicator';

const QuickDonateModal = ({ 
  campaign, 
  isOpen, 
  onClose, 
  onDonate,
  walletConnected = false,
  onConnectWallet = () => {}
}) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const suggestedAmounts = [
    { value: '10', label: '10 ADA' },
    { value: '25', label: '25 ADA' },
    { value: '50', label: '50 ADA' },
    { value: '100', label: '100 ADA' },
    { value: '250', label: '250 ADA' },
    { value: 'custom', label: 'Custom Amount' }
  ];

  const handleAmountSelect = (amount) => {
    if (amount !== 'custom') {
      setDonationAmount(amount);
    }
  };

  const handleDonate = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      return;
    }

    setIsProcessing(true);
    
    try {
      await onDonate({
        campaignId: campaign?.id,
        amount: parseFloat(donationAmount),
        message: donationMessage,
        isAnonymous
      });
      
      // Reset form
      setDonationAmount('');
      setDonationMessage('');
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      console.error('Donation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateImpact = () => {
    const amount = parseFloat(donationAmount) || 0;
    const remaining = campaign?.targetAmount - campaign?.currentAmount;
    const percentage = (amount / remaining) * 100;
    return Math.min(percentage, 100);
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
      <div className="bg-card border border-border rounded-medical shadow-medical-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon name="Heart" size={24} className="text-primary" />
            <h2 className="text-xl font-semibold text-card-foreground">Quick Donate</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Campaign Summary */}
        <div className="p-6 border-b border-border">
          <div className="flex space-x-4">
            <div className="w-20 h-20 rounded-medical overflow-hidden flex-shrink-0">
              <Image
                src={campaign?.image}
                alt={campaign?.patientName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-card-foreground line-clamp-2">
                {campaign?.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="User" size={14} />
                <span>{campaign?.patientName}</span>
                <span>•</span>
                <span>{campaign?.medicalCondition}</span>
              </div>
              <CampaignProgressIndicator
                currentAmount={campaign?.currentAmount}
                targetAmount={campaign?.targetAmount}
                donorCount={campaign?.donorCount}
                daysRemaining={campaign?.daysRemaining}
                size="sm"
                showDetails={false}
              />
            </div>
          </div>
        </div>

        {/* Donation Form */}
        <div className="p-6 space-y-6">
          {/* Wallet Connection Status */}
          {!walletConnected && (
            <div className="bg-warning/10 border border-warning/20 rounded-medical p-4">
              <div className="flex items-center space-x-2 text-warning mb-2">
                <Icon name="Wallet" size={16} />
                <span className="font-medium">Wallet Not Connected</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Connect your Cardano wallet to make a donation
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onConnectWallet}
                iconName="Wallet"
                iconPosition="left"
              >
                Connect Wallet
              </Button>
            </div>
          )}

          {/* Suggested Amounts */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-3">
              Choose Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suggestedAmounts?.map((amount) => (
                <button
                  key={amount?.value}
                  onClick={() => handleAmountSelect(amount?.value)}
                  className={`p-3 rounded-medical border text-sm font-medium transition-all duration-200 ${
                    donationAmount === amount?.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  {amount?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <Input
              label="Donation Amount (ADA)"
              type="number"
              placeholder="Enter custom amount"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e?.target?.value)}
              min="1"
              step="0.01"
            />
            {donationAmount && (
              <div className="mt-2 text-sm text-muted-foreground">
                ≈ ${(parseFloat(donationAmount) * 0.35)?.toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Impact Visualization */}
          {donationAmount && parseFloat(donationAmount) > 0 && (
            <div className="bg-success/10 border border-success/20 rounded-medical p-4">
              <div className="flex items-center space-x-2 text-success mb-2">
                <Icon name="Target" size={16} />
                <span className="font-medium">Your Impact</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your donation of {donationAmount} ADA will contribute{' '}
                <span className="font-medium text-success">
                  {calculateImpact()?.toFixed(1)}%
                </span>{' '}
                towards reaching the funding goal.
              </p>
            </div>
          )}

          {/* Donation Message */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Message of Support (Optional)
            </label>
            <textarea
              value={donationMessage}
              onChange={(e) => setDonationMessage(e?.target?.value)}
              placeholder="Share words of encouragement with the patient and family..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-medical text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {donationMessage?.length}/500 characters
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e?.target?.checked)}
              className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="anonymous" className="text-sm text-card-foreground">
              Make this donation anonymous
            </label>
          </div>

          {/* Donation Summary */}
          {donationAmount && (
            <div className="bg-muted/50 rounded-medical p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Donation Amount:</span>
                <span className="font-medium">{donationAmount} ADA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee:</span>
                <span className="font-medium">~0.17 ADA</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>{(parseFloat(donationAmount) + 0.17)?.toFixed(2)} ADA</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDonate}
              loading={isProcessing}
              disabled={!donationAmount || parseFloat(donationAmount) <= 0}
              iconName="Heart"
              iconPosition="left"
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Donate ${donationAmount || '0'} ADA`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickDonateModal;