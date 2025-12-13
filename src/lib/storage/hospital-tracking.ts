/**
 * Hospital Tracking Storage System
 * Tracks published campaigns and donations for hospital verification dashboard
 */

const STORAGE_KEY = 'aidpod_hospital_tracking';

interface PublishedCampaign {
  campaignId: string;
  patientName: string;
  hospitalName: string;
  targetAmount: number;
  currentAmount: number;
  donorCount: number;
  publishedDate: string;
  verifiedBy: string;
  verificationRequestId?: string;
  transactionHash?: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface DonationRecord {
  donationId: string;
  campaignId: string;
  amount: number;
  donorAddress: string;
  transactionHash: string;
  timestamp: string;
}

interface HospitalTrackingData {
  publishedCampaigns: PublishedCampaign[];
  donations: DonationRecord[];
}

class HospitalTrackingStorage {
  private data: HospitalTrackingData;

  constructor() {
    this.data = this.loadData();
  }

  // Load data from localStorage
  private loadData(): HospitalTrackingData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { publishedCampaigns: [], donations: [] };
    } catch (error) {
      console.error('Error loading hospital tracking data:', error);
      return { publishedCampaigns: [], donations: [] };
    }
  }

  // Save data to localStorage
  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving hospital tracking data:', error);
    }
  }

  // Track published campaign
  trackPublishedCampaign(
    campaignId: string,
    patientName: string,
    hospitalName: string,
    targetAmount: number,
    verifiedBy: string,
    verificationRequestId?: string,
    transactionHash?: string
  ): PublishedCampaign {
    // Check if campaign already exists
    const existing = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (existing) {
      console.log('Campaign already tracked:', campaignId);
      return existing;
    }

    const campaign: PublishedCampaign = {
      campaignId,
      patientName,
      hospitalName,
      targetAmount,
      currentAmount: 0,
      donorCount: 0,
      publishedDate: new Date().toISOString(),
      verifiedBy,
      verificationRequestId,
      transactionHash,
      status: 'active'
    };

    this.data.publishedCampaigns.push(campaign);
    this.saveData();
    
    console.log('✅ Published campaign tracked:', campaignId);
    return campaign;
  }

  // Track donation
  trackDonation(
    campaignId: string,
    amount: number,
    donorAddress: string,
    transactionHash: string
  ): DonationRecord {
    const donation: DonationRecord = {
      donationId: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId,
      amount,
      donorAddress,
      transactionHash,
      timestamp: new Date().toISOString()
    };

    this.data.donations.push(donation);

    // Update campaign stats
    const campaign = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (campaign) {
      campaign.currentAmount += amount;
      campaign.donorCount += 1;
    }

    this.saveData();
    
    console.log('✅ Donation tracked:', donation.donationId);
    return donation;
  }

  // Get all published campaigns
  getPublishedCampaigns(): PublishedCampaign[] {
    return this.data.publishedCampaigns;
  }

  // Get campaigns by hospital
  getCampaignsByHospital(hospitalName: string): PublishedCampaign[] {
    return this.data.publishedCampaigns.filter(c => 
      c.hospitalName.toLowerCase() === hospitalName.toLowerCase()
    );
  }

  // Get all donations
  getDonations(): DonationRecord[] {
    return this.data.donations;
  }

  // Get donations by campaign
  getDonationsByCampaign(campaignId: string): DonationRecord[] {
    return this.data.donations.filter(d => d.campaignId === campaignId);
  }

  // Get statistics
  getStatistics() {
    const totalCampaigns = this.data.publishedCampaigns.length;
    const activeCampaigns = this.data.publishedCampaigns.filter(c => c.status === 'active').length;
    const totalRaised = this.data.publishedCampaigns.reduce((sum, c) => sum + c.currentAmount, 0);
    const totalDonations = this.data.donations.length;
    const totalDonors = new Set(this.data.donations.map(d => d.donorAddress)).size;

    return {
      totalCampaigns,
      activeCampaigns,
      totalRaised,
      totalDonations,
      totalDonors
    };
  }

  // Update campaign status
  updateCampaignStatus(campaignId: string, status: 'active' | 'completed' | 'cancelled'): void {
    const campaign = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (campaign) {
      campaign.status = status;
      this.saveData();
    }
  }

  // Update campaign claim
  updateCampaignClaim(campaignId: string, claimAmount: number, transactionHash: string): PublishedCampaign | null {
    const campaign = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (campaign) {
      campaign.totalClaimed = (campaign.totalClaimed || 0) + claimAmount;
      (campaign as any).lastClaimDate = new Date().toISOString();
      (campaign as any).lastClaimTx = transactionHash;
      this.saveData();
      console.log(`✅ Claimed ${claimAmount} ADA from campaign ${campaignId}`);
      return campaign;
    }
    return null;
  }

  // Sync with campaign storage (called when campaigns are published or donations are made)
  syncFromCampaignStorage(campaigns: any[], donations: any[]): void {
    // This will be called periodically to sync data
    campaigns.forEach(campaign => {
      if (!this.data.publishedCampaigns.find(c => c.campaignId === campaign.id)) {
        // Campaign exists but not tracked, add it
        this.trackPublishedCampaign(
          campaign.id,
          campaign.patientName || 'Unknown',
          campaign.hospitalName || 'Unknown Hospital',
          campaign.goalAda || campaign.targetAmount || 0,
          'System',
          undefined,
          campaign.transactionHash
        );
      }
    });

    // Sync donations
    donations.forEach(donation => {
      if (!this.data.donations.find(d => d.transactionHash === donation.transactionHash)) {
        this.trackDonation(
          donation.campaignId,
          donation.amount,
          donation.donorAddress,
          donation.transactionHash
        );
      }
    });
  }
}

// Export singleton instance
export const hospitalTracking = new HospitalTrackingStorage();
export default hospitalTracking;

