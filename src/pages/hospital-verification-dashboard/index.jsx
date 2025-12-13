import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@meshsdk/react';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import { campaignStorage } from '../../lib/storage/campaign-storage';
import { claimCampaignFunds } from '../../lib/mesh-sdk/Hospital';

const HospitalVerificationDashboard = () => {
  const { wallet, connected } = useWallet();
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [publishedCampaigns, setPublishedCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [claimingCampaign, setClaimingCampaign] = useState(null);
  const [claimError, setClaimError] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());

  // Hospital information
  const hospitalInfo = {
    name: "Dr. Ngozi Adebayo",
    title: "Chief Medical Officer",
    institution: "Lagos University Teaching Hospital",
    licenseNumber: "MD-2019-8847",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face"
  };

  useEffect(() => {
    // Load campaigns and donations
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Dynamically import hospitalTracking to avoid static/dynamic import conflicts
        const { hospitalTracking } = await import('../../lib/storage/hospital-tracking');
        
        // Load published campaigns and donations from tracking storage
        const allCampaigns = campaignStorage.getAllCampaigns();
        const trackingCampaigns = hospitalTracking.getPublishedCampaigns();
        const trackingDonations = hospitalTracking.getDonations();

        // Extract ALL donations from campaigns (from donations array)
        const campaignDonations = [];
        allCampaigns.forEach(campaign => {
          if (campaign.donations && Array.isArray(campaign.donations)) {
            campaign.donations.forEach(donation => {
              campaignDonations.push({
                campaignId: campaign.id,
                amount: donation.amount,
                donorAddress: donation.donorAddress,
                transactionHash: donation.transactionHash,
                timestamp: donation.timestamp
              });
            });
          }
          // Also include lastDonation if donations array doesn't exist (backward compatibility)
          else if (campaign.lastDonation && campaign.lastDonation.transactionHash) {
            campaignDonations.push({
              campaignId: campaign.id,
              amount: campaign.lastDonation.amount,
              donorAddress: campaign.lastDonation.donorAddress,
              transactionHash: campaign.lastDonation.transactionHash,
              timestamp: campaign.lastDonation.timestamp
            });
          }
        });

        console.log(`📊 Found ${campaignDonations.length} donations across ${allCampaigns.length} campaigns`);

        // Sync tracking storage with campaign storage
        hospitalTracking.syncFromCampaignStorage(allCampaigns, campaignDonations);

        // Update state
        const campaigns = hospitalTracking.getPublishedCampaigns();
        const donationsList = hospitalTracking.getDonations();
        setPublishedCampaigns(campaigns);
        setDonations(donationsList);

        console.log(`📊 Hospital Dashboard: ${campaigns.length} campaigns, ${donationsList.length} donations tracked`);

        // Calculate statistics
        const trackingStats = hospitalTracking.getStatistics();
        const totalClaimed = campaigns.reduce((sum, c) => sum + (c.totalClaimed || 0), 0);
        const availableToClaim = campaigns.reduce((sum, c) => sum + (c.currentAmount - (c.totalClaimed || 0)), 0);

        setStats({
          ...trackingStats,
          totalClaimed,
          availableToClaim
        });
        
        console.log(`📊 Stats: Total Raised: ${trackingStats.totalRaised} ADA, Total Donations: ${trackingStats.totalDonations}`);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up interval to sync data periodically
    const syncInterval = setInterval(async () => {
      try {
        // Dynamically import hospitalTracking to avoid static/dynamic import conflicts
        const { hospitalTracking } = await import('../../lib/storage/hospital-tracking');
        
        const allCampaigns = campaignStorage.getAllCampaigns();
        
        // Extract ALL donations from campaigns (from donations array)
        const campaignDonations = [];
        allCampaigns.forEach(campaign => {
          if (campaign.donations && Array.isArray(campaign.donations)) {
            campaign.donations.forEach(donation => {
              campaignDonations.push({
                campaignId: campaign.id,
                amount: donation.amount,
                donorAddress: donation.donorAddress,
                transactionHash: donation.transactionHash,
                timestamp: donation.timestamp
              });
            });
          }
          // Also include lastDonation if donations array doesn't exist (backward compatibility)
          else if (campaign.lastDonation && campaign.lastDonation.transactionHash) {
            campaignDonations.push({
              campaignId: campaign.id,
              amount: campaign.lastDonation.amount,
              donorAddress: campaign.lastDonation.donorAddress,
              transactionHash: campaign.lastDonation.transactionHash,
              timestamp: campaign.lastDonation.timestamp
            });
          }
        });
        
        console.log(`🔄 Syncing ${campaignDonations.length} donations from ${allCampaigns.length} campaigns`);
        hospitalTracking.syncFromCampaignStorage(allCampaigns, campaignDonations);
        const campaigns = hospitalTracking.getPublishedCampaigns();
        const donationsList = hospitalTracking.getDonations();
        setPublishedCampaigns(campaigns);
        setDonations(donationsList);

        console.log(`📊 After sync: ${campaigns.length} campaigns, ${donationsList.length} donations`);

        // Update stats
        const trackingStats = hospitalTracking.getStatistics();
        const totalClaimed = campaigns.reduce((sum, c) => sum + (c.totalClaimed || 0), 0);
        const availableToClaim = campaigns.reduce((sum, c) => sum + (c.currentAmount - (c.totalClaimed || 0)), 0);
        setStats({
          ...trackingStats,
          totalClaimed,
          availableToClaim
        });
        
        console.log(`📊 Updated stats: Total Raised: ${trackingStats.totalRaised} ADA, Available: ${availableToClaim} ADA`);
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // Handle fund claiming
  const handleClaimFunds = async (campaignId) => {
    // Check if wallet is connected
    if (!connected || !wallet) {
      setClaimError('Please connect your wallet to claim funds');
      return;
    }

    const campaign = publishedCampaigns.find(c => c.campaignId === campaignId);
    if (!campaign) {
      setClaimError('Campaign not found');
      return;
    }

    const availableAmount = campaign.currentAmount - (campaign.totalClaimed || 0);
    if (availableAmount <= 0) {
      setClaimError('No funds available to claim');
      return;
    }

    // Check if campaign has transaction hash
    if (!campaign.transactionHash) {
      setClaimError('Campaign transaction hash not found');
      return;
    }

    setClaimingCampaign(campaignId);
    setClaimError(null);
    setClaimSuccess(false);

    try {
      console.log('🔗 Wallet connected, building claim transaction...');
      console.log(`💰 Claiming funds from campaign: ${campaignId}`);
      console.log(`📋 Campaign TX Hash: ${campaign.transactionHash}`);
      console.log(`🏥 Hospital Name: ${campaign.hospitalName}`);

      // Build unsigned transaction
      console.log('📝 Building claim transaction...');
      const unsignedTx = await claimCampaignFunds(campaign.transactionHash, campaign.hospitalName, wallet);
      
      console.log('✍️ Requesting signature...');
      const signedTx = await wallet.signTx(unsignedTx);
      
      console.log('📤 Submitting transaction...');
      const txHash = await wallet.submitTx(signedTx);
      
      console.log('✅ Claim transaction submitted:', txHash);

      const cardanoScanLink = `https://preprod.cardanoscan.io/transaction/${txHash}`;
      
      // Dynamically import hospitalTracking
      const { hospitalTracking } = await import('../../lib/storage/hospital-tracking');
      
      // Update campaign in hospital tracking
      const updatedCampaign = hospitalTracking.updateCampaignClaim(
        campaignId,
        availableAmount,
        txHash
      );

      if (updatedCampaign) {
        console.log('✅ Claim saved to localStorage');
        
        // Update local state
        setPublishedCampaigns(prev =>
          prev.map(c =>
            c.campaignId === campaignId
              ? { ...c, totalClaimed: (c.totalClaimed || 0) + availableAmount }
              : c
          )
        );

        // Update stats
        const campaigns = hospitalTracking.getPublishedCampaigns();
        const totalClaimed = campaigns.reduce((sum, c) => sum + (c.totalClaimed || 0), 0);
        const availableToClaim = campaigns.reduce((sum, c) => sum + (c.currentAmount - (c.totalClaimed || 0)), 0);
        setStats(prev => ({
          ...prev,
          totalClaimed,
          availableToClaim
        }));

        setClaimSuccess(true);
        
        // Reset after 5 seconds
        setTimeout(() => {
          setClaimSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Claim failed:', error);
      setClaimError(`Failed to claim funds: ${error.message || 'Unknown error'}`);
    } finally {
      setClaimingCampaign(null);
    }
  };

  // Filter campaigns by search term
  const filteredCampaigns = publishedCampaigns.filter(campaign =>
    campaign.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.campaignId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          userRole="hospital"
          isAuthenticated={true}
          walletConnected={connected}
          walletBalance={1250.75}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-lg font-medium text-foreground">Loading dashboard...</div>
            <div className="text-sm text-muted-foreground">Fetching campaigns and donations</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="hospital"
        isAuthenticated={true}
        walletConnected={connected}
        walletBalance={1250.75}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Hospital Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage published campaigns and claim donated funds
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-card border border-border rounded-medical px-4 py-2">
                <Image
                  src={hospitalInfo?.avatar}
                  alt={hospitalInfo?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <div className="font-medium text-card-foreground">{hospitalInfo?.name}</div>
                  <div className="text-muted-foreground">{hospitalInfo?.institution}</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                iconName="Settings"
                iconPosition="left"
                asChild
              >
                <Link to="/user-profile-wallet-management">
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-medical p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Campaigns</div>
            <div className="text-2xl font-bold text-foreground">{stats.totalCampaigns || 0}</div>
          </div>
          <div className="bg-card border border-border rounded-medical p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Raised</div>
            <div className="text-2xl font-bold text-primary">{(stats.totalRaised || 0).toLocaleString()} ADA</div>
          </div>
          <div className="bg-card border border-border rounded-medical p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Claimed</div>
            <div className="text-2xl font-bold text-success">{(stats.totalClaimed || 0).toLocaleString()} ADA</div>
          </div>
          <div className="bg-card border border-border rounded-medical p-6">
            <div className="text-sm text-muted-foreground mb-1">Available to Claim</div>
            <div className="text-2xl font-bold text-warning">{(stats.availableToClaim || 0).toLocaleString()} ADA</div>
          </div>
        </div>

        {/* Success Banner */}
        {claimSuccess && (
          <div className="bg-success text-success-foreground p-4 rounded-medical mb-6">
            <div className="flex items-center space-x-3">
              <Icon name="CheckCircle" size={20} />
              <span className="font-medium">
                Successfully claimed funds from campaign!
              </span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {claimError && (
          <div className="bg-error text-error-foreground p-4 rounded-medical mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="AlertTriangle" size={20} />
                <span className="font-medium">{claimError}</span>
              </div>
              <button 
                onClick={() => setClaimError(null)}
                className="hover:opacity-80"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search campaigns by patient name, hospital, or campaign ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            iconName="Search"
            iconPosition="left"
          />
        </div>

        {/* Published Campaigns */}
        <div className="space-y-6">
          {filteredCampaigns.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Published Campaigns ({filteredCampaigns.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredCampaigns.map((campaign) => {
                  const campaignDonations = donations.filter(d => d.campaignId === campaign.campaignId);
                  const progress = campaign.targetAmount > 0 
                    ? (campaign.currentAmount / campaign.targetAmount) * 100 
                    : 0;
                  const availableToClaim = campaign.currentAmount - (campaign.totalClaimed || 0);
                  const isClaiming = claimingCampaign === campaign.campaignId;
                  
                  return (
                    <div key={campaign.campaignId} className="bg-card border border-border rounded-medical p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {campaign.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {campaign.hospitalName}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' 
                            ? 'bg-success/10 text-success' 
                            : campaign.status === 'completed'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-error/10 text-error'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">
                            {campaign.currentAmount.toLocaleString()} / {campaign.targetAmount.toLocaleString()} ADA
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {progress.toFixed(1)}% funded
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Donors</div>
                          <div className="text-lg font-semibold text-foreground">{campaign.donorCount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Donations</div>
                          <div className="text-lg font-semibold text-foreground">{campaignDonations.length}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Claimed</div>
                          <div className="text-lg font-semibold text-success">{(campaign.totalClaimed || 0).toLocaleString()} ADA</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Available</div>
                          <div className="text-lg font-semibold text-warning">{availableToClaim.toLocaleString()} ADA</div>
                        </div>
                      </div>

                      {/* Donations List */}
                      <div className="mb-4 pt-4 border-t border-border">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedCampaigns);
                            if (newExpanded.has(campaign.campaignId)) {
                              newExpanded.delete(campaign.campaignId);
                            } else {
                              newExpanded.add(campaign.campaignId);
                            }
                            setExpandedCampaigns(newExpanded);
                          }}
                          className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
                        >
                          <div className="flex items-center space-x-2">
                            <Icon name="Heart" size={16} className="text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              View All Donations ({campaignDonations.length})
                            </span>
                          </div>
                          <Icon 
                            name={expandedCampaigns.has(campaign.campaignId) ? "ChevronUp" : "ChevronDown"} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        </button>

                        {expandedCampaigns.has(campaign.campaignId) && (
                          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                            {campaignDonations.length > 0 ? (
                              <>
                                {/* Sort donations by timestamp (newest first) */}
                                {campaignDonations
                                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                  .map((donation) => {
                                    // Calculate running balance (sum of all donations up to this point)
                                    const sortedDonations = [...campaignDonations].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                                    const donationIndex = sortedDonations.findIndex(d => d.donationId === donation.donationId);
                                    const runningBalance = sortedDonations
                                      .slice(0, donationIndex + 1)
                                      .reduce((sum, d) => sum + d.amount, 0);
                                    
                                    return (
                                      <div 
                                        key={donation.donationId} 
                                        className="bg-muted/50 border border-border rounded-medical p-3"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            <span className="font-semibold text-foreground">
                                              {donation.amount.toLocaleString()} ADA
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(donation.timestamp).toLocaleString()}
                                            </span>
                                          </div>
                                          {donation.transactionHash && (
                                            <a
                                              href={`https://preprod.cardanoscan.io/transaction/${donation.transactionHash}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-primary hover:underline flex items-center space-x-1"
                                            >
                                              <span>View TX</span>
                                              <Icon name="ExternalLink" size={12} />
                                            </a>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="text-xs font-mono text-muted-foreground">
                                            Donor: {donation.donorAddress.substring(0, 12)}...{donation.donorAddress.substring(donation.donorAddress.length - 8)}
                                          </div>
                                          <div className="text-xs font-medium text-primary">
                                            Balance: {runningBalance.toLocaleString()} ADA
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                {/* Total Summary */}
                                <div className="bg-primary/10 border border-primary/20 rounded-medical p-3 mt-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-foreground">Total Donations:</span>
                                    <span className="text-sm font-bold text-primary">
                                      {campaignDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} ADA
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-muted-foreground">Current Balance:</span>
                                    <span className="text-xs font-semibold text-foreground">
                                      {campaign.currentAmount.toLocaleString()} ADA
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-4 text-sm text-muted-foreground">
                                No donations yet
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Published: {new Date(campaign.publishedDate).toLocaleDateString()}
                          {campaign.transactionHash && (
                            <span className="ml-2">
                              TX: {campaign.transactionHash.substring(0, 16)}...
                            </span>
                          )}
                        </div>
                        <Button
                          variant="default"
                          onClick={() => handleClaimFunds(campaign.campaignId)}
                          disabled={availableToClaim <= 0 || isClaiming || !connected}
                          loading={isClaiming}
                          iconName="DollarSign"
                          iconPosition="left"
                        >
                          {isClaiming 
                            ? 'Claiming...' 
                            : availableToClaim > 0
                              ? `Claim ${availableToClaim.toLocaleString()} ADA`
                              : 'No Funds Available'
                          }
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Icon name="Campaign" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No campaigns found' : 'No published campaigns yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Campaigns will appear here once they are published.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalVerificationDashboard;
