import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DonationInterface = ({ campaign, onDonate }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const presetAmounts = [50, 100, 250, 500, 1000, 2500];
  const usdRate = 0.35;

  const walletOptions = [
    { value: 'nami', label: 'Nami Wallet', description: 'Most popular Cardano wallet' },
    { value: 'eternl', label: 'Eternl Wallet', description: 'Advanced features and staking' },
    { value: 'lace', label: 'Lace Wallet', description: 'IOG official wallet' },
    { value: 'flint', label: 'Flint Wallet', description: 'Mobile-first experience' }
  ];

  useEffect(() => {
    // Mock wallet balance
    if (isConnected) {
      setWalletBalance(15420.75);
    }
  }, [isConnected]);

  const handleWalletConnect = async () => {
    if (!selectedWallet) return;
    
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const handleDonate = async () => {
    if (!donationAmount || !isConnected) return;
    
    const donationData = {
      amount: parseFloat(donationAmount),
      message: donationMessage,
      anonymous: isAnonymous,
      wallet: selectedWallet,
      campaignId: campaign?.id
    };
    
    onDonate(donationData);
  };

  const formatUSD = (adaAmount) => {
    return (adaAmount * usdRate)?.toFixed(2);
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

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="space-y-4">
            <Select
              label="Choose Wallet"
              placeholder="Select your Cardano wallet"
              options={walletOptions}
              value={selectedWallet}
              onChange={setSelectedWallet}
              searchable
            />
            <Button
              variant="primary"
              fullWidth
              loading={isConnecting}
              disabled={!selectedWallet}
              onClick={handleWalletConnect}
              iconName="Wallet"
              iconPosition="left"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        ) : (
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
        )}

        {/* Donation Amount Selection */}
        {isConnected && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Choose Donation Amount
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {presetAmounts?.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDonationAmount(amount?.toString());
                      setShowCustomAmount(false);
                    }}
                    className={`p-3 text-center border rounded-medical transition-all duration-200 ${
                      donationAmount === amount?.toString()
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <div className="font-semibold">{amount} ADA</div>
                    <div className="text-xs opacity-80">${formatUSD(amount)}</div>
                  </button>
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
                    ≈ ${formatUSD(parseFloat(donationAmount) || 0)} USD
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
                  <span className="text-muted-foreground">USD Equivalent:</span>
                  <span className="font-medium text-foreground">
                    ${formatUSD(parseFloat(donationAmount))}
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
              disabled={!isValidAmount()}
              onClick={handleDonate}
              iconName="Heart"
              iconPosition="left"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              Donate {donationAmount ? `${donationAmount} ADA` : 'Now'}
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