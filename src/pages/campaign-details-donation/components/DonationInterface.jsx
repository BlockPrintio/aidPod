import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DonationInterface = ({ campaign, onDonate, isDonating = false, walletConnected = false }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const presetAmounts = [50, 100, 250, 500, 1000, 2500];
  const ngnRate = 1600; // approximate NGN per ADA (placeholder)
  const walletBalance = 15420.75; // Mock balance - in real app, get from wallet

  const handleDonate = async () => {
    console.log('🎯 DonationInterface handleDonate called');
    console.log('Donation amount:', donationAmount);
    console.log('isDonating:', isDonating);
    console.log('walletConnected:', walletConnected);
    console.log('onDonate function:', typeof onDonate);

    // Validate donation amount
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) {
      console.warn('❌ Invalid donation amount:', amount);
      return;
    }

    // Check if already processing
    if (isDonating) {
      console.warn('❌ Donation already in progress');
      return;
    }

    // Check if onDonate function is provided
    if (!onDonate || typeof onDonate !== 'function') {
      console.error('❌ onDonate function not provided or invalid');
      return;
    }

    // Prepare donation data
    const donationData = {
      amount: amount,
      message: donationMessage,
      anonymous: isAnonymous,
      campaignId: campaign?.id
    };

    console.log('📤 Calling onDonate with data:', donationData);

    // Call parent's onDonate handler
    try {
      await onDonate(donationData);
      console.log('✅ onDonate completed');
      
      // Reset form on success
      setDonationAmount('');
      setDonationMessage('');
      setShowCustomAmount(false);
    } catch (error) {
      console.error('❌ Error calling onDonate:', error);
    }
  };

  const formatNGN = (adaAmount) => {
    const ngn = adaAmount * ngnRate;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(ngn);
  };

  const isValidAmount = () => {
    const amount = parseFloat(donationAmount);
    return amount > 0 && amount <= walletBalance;
  };

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden sticky top-4">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Support This Campaign</h3>
          <p className="text-sm text-muted-foreground">
            Help {campaign?.patientName} reach their medical funding goal
          </p>
        </div>

        {/* Wallet Connection Status */}
        {walletConnected ? (
          <div className="bg-success/10 border border-success/20 p-4 rounded-medical">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-success">Wallet Connected</span>
              </div>
              <span className="font-mono text-sm text-success">
                {walletBalance?.toLocaleString()} ADA
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-warning/10 border border-warning/20 p-4 rounded-medical">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Please connect your wallet to donate</span>
            </div>
          </div>
        )}

        {/* Donation Amount Selection */}
        {walletConnected && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Choose Donation Amount
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {presetAmounts?.map((amount) => (
                  <Button
                    key={amount}
                    variant={donationAmount === amount?.toString() ? "default" : "outline"}
                    onClick={() => {
                      setDonationAmount(amount?.toString());
                      setShowCustomAmount(false);
                    }}
                    className={`h-auto py-3 flex-col space-y-1 ${donationAmount !== amount?.toString()
                      ? 'hover:bg-primary/5 hover:text-foreground border-border'
                      : ''
                      }`}
                  >
                    <div className="font-semibold">{amount} ADA</div>
                    <div className="text-xs opacity-80">≈ {formatNGN(amount)}</div>
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCustomAmount(!showCustomAmount)}
                iconName={showCustomAmount ? "Minus" : "Plus"}
                iconPosition="left"
              >
                Custom Amount
              </Button>
            </div>

            {/* Custom Amount Input */}
            {showCustomAmount && (
              <div className="space-y-2">
                <Input
                  type="number"
                  label="Custom Amount (ADA)"
                  placeholder="Enter amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e?.target?.value)}
                  min="1"
                  max={walletBalance}
                />
                {donationAmount && (
                  <p className="text-sm text-muted-foreground">
                    ≈ {formatNGN(parseFloat(donationAmount) || 0)}
                  </p>
                )}
              </div>
            )}

            {/* Donation Message */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Message of Support (Optional)
              </label>
              <textarea
                value={donationMessage}
                onChange={(e) => setDonationMessage(e?.target?.value)}
                placeholder="Share words of encouragement..."
                className="w-full p-3 border border-border rounded-medical bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {donationMessage?.length}/200 characters
              </p>
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
              <label htmlFor="anonymous" className="text-sm text-foreground">
                Donate anonymously
              </label>
            </div>

            {/* Donation Summary */}
            {donationAmount && (
              <div className="bg-muted/50 p-4 rounded-medical space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Donation Amount:</span>
                  <span className="font-medium text-foreground">
                    {parseFloat(donationAmount)?.toLocaleString()} ADA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NGN Equivalent:</span>
                  <span className="font-medium text-foreground">
                    {formatNGN(parseFloat(donationAmount))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee:</span>
                  <span className="font-medium text-foreground">~0.17 ADA</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-medium text-foreground">Total:</span>
                  <span className="font-bold text-foreground">
                    {(parseFloat(donationAmount) + 0.17)?.toFixed(2)} ADA
                  </span>
                </div>
              </div>
            )}

            {/* Donate Button */}
            <Button
              variant="default"
              fullWidth
              disabled={!isValidAmount() || isDonating || !walletConnected}
              onClick={(e) => {
                console.log('🔘 Donate button clicked');
                e.preventDefault();
                handleDonate();
              }}
              iconName={isDonating ? "Loader" : "Heart"}
              iconPosition="left"
              loading={isDonating}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isDonating 
                ? 'Processing Donation...' 
                : walletConnected
                  ? `Donate ${donationAmount ? `${donationAmount} ADA` : 'Now'}`
                  : 'Connect Wallet to Donate'
              }
            </Button>

            {/* Trust Indicators */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Shield" size={16} className="text-success" />
                <span>Secure blockchain transaction</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Eye" size={16} className="text-primary" />
                <span>100% transparent fund tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="RefreshCw" size={16} className="text-warning" />
                <span>Refund available if goal not met</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationInterface;