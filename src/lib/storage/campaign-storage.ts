/**
 * Campaign Storage System
 * Handles storing and retrieving campaign data from localStorage
 * This bridges the gap between simple transactions and full script implementation
 */

import type { CampaignData, Milestone } from '../../../types/mesh';

const STORAGE_KEY = 'aidpod_campaigns';

interface StoredCampaign extends CampaignData {
  id: string;
  transactionHash?: string;
  createdAt: string;
  currentAmount: number;
  donorCount: number;
  status: string;
  isBlockchain: boolean;
  milestones: Milestone[];
  totalClaimed?: number;
  lastUpdated?: string;
  durationDays?: number;
  goalAda?: number;
  title?: string;
  description?: string;
  creator?: string;
  lastDonation?: {
    amount: number;
    donorAddress: string;
    transactionHash: string;
    timestamp: string;
  };
  donations?: Array<{
    amount: number;
    donorAddress: string;
    transactionHash: string;
    timestamp: string;
  }>;
}

interface CampaignStatistics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalDonors: number;
}

class CampaignStorage {
  private campaigns: StoredCampaign[];

  constructor() {
    this.campaigns = this.loadCampaigns();
  }

  // Load campaigns from localStorage
  private loadCampaigns(): StoredCampaign[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading campaigns from storage:', error);
      return [];
    }
  }

  // Save campaigns to localStorage
  private saveCampaigns(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.campaigns));
    } catch (error) {
      console.error('Error saving campaigns to storage:', error);
    }
  }

  // Add a new campaign
  addCampaign(campaignData: CampaignData, transactionHash: string): StoredCampaign {
    const campaign: StoredCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaignData,
      transactionHash,
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      donorCount: 0,
      status: 'active',
      isBlockchain: true,
      milestones: [
        { percentage: 25, claimed: false, claimDate: null, amountClaimed: 0, transactionHash: null },
        { percentage: 50, claimed: false, claimDate: null, amountClaimed: 0, transactionHash: null },
        { percentage: 75, claimed: false, claimDate: null, amountClaimed: 0, transactionHash: null },
        { percentage: 100, claimed: false, claimDate: null, amountClaimed: 0, transactionHash: null }
      ]
    };

    this.campaigns.push(campaign);
    this.saveCampaigns();
    
    console.log('✅ Campaign saved to storage:', campaign.id);
    return campaign;
  }

  // Get all campaigns
  getAllCampaigns(): StoredCampaign[] {
    return this.campaigns;
  }

  // Get campaign by ID
  getCampaignById(id: string): StoredCampaign | undefined {
    return this.campaigns.find(campaign => campaign.id === id);
  }

  // Get campaigns by creator address
  getCampaignsByCreator(creatorAddress: string): StoredCampaign[] {
    return this.campaigns.filter(campaign => 
      campaign.creator === creatorAddress
    );
  }

  // Update campaign (for donations, status changes, etc.)
  updateCampaign(id: string, updates: Partial<StoredCampaign>): StoredCampaign | null {
    const index = this.campaigns.findIndex(campaign => campaign.id === id);
    if (index !== -1) {
      this.campaigns[index] = { ...this.campaigns[index], ...updates };
      this.saveCampaigns();
      return this.campaigns[index];
    }
    return null;
  }

  // Add donation to campaign
  addDonation(campaignId: string, amount: number, donorAddress: string, transactionHash: string): StoredCampaign | null {
    const campaign = this.getCampaignById(campaignId);
    if (campaign) {
      // Check if donation already exists
      const existingDonation = campaign.donations?.find(d => d.transactionHash === transactionHash);
      if (existingDonation) {
        console.log('Donation already exists in campaign storage:', transactionHash);
        return campaign;
      }

      // Create donation record
      const donationRecord = {
        amount,
        donorAddress,
        transactionHash,
        timestamp: new Date().toISOString()
      };

      // Add to donations array (initialize if doesn't exist)
      const donations = campaign.donations || [];
      donations.push(donationRecord);

      const updatedCampaign = this.updateCampaign(campaignId, {
        currentAmount: campaign.currentAmount + amount,
        donorCount: campaign.donorCount + 1,
        lastDonation: donationRecord,
        donations: donations
      });
      
      console.log('✅ Donation added to campaign:', campaignId, `Amount: ${amount} ADA`);
      console.log(`📊 Campaign balance: ${updatedCampaign.currentAmount} ADA (${updatedCampaign.donations?.length || 0} donations)`);
      
      // Track donation in hospital tracking storage
      try {
        // Dynamic import to avoid circular dependency
        import('./hospital-tracking').then(({ hospitalTracking }) => {
          hospitalTracking.trackDonation(campaignId, amount, donorAddress, transactionHash);
          console.log('✅ Donation tracked in hospital dashboard');
        }).catch(error => {
          console.warn('Could not track donation in hospital tracking:', error);
        });
      } catch (error) {
        console.warn('Could not track donation in hospital tracking:', error);
      }
      
      return updatedCampaign || null;
    }
    return null;
  }

  // Claim milestone for a campaign
  claimMilestone(campaignId: string, milestonePercentage: number, claimAmount: number, transactionHash: string): StoredCampaign | null {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) {
      console.error('Campaign not found:', campaignId);
      return null;
    }

    // Update milestone status
    const updatedMilestones = campaign.milestones.map(milestone => {
      if (milestone.percentage === milestonePercentage) {
        return {
          ...milestone,
          claimed: true,
          claimDate: new Date().toISOString(),
          amountClaimed: claimAmount,
          transactionHash
        };
      }
      return milestone;
    });

    // Update campaign
    const updatedCampaign = this.updateCampaign(campaignId, {
      milestones: updatedMilestones,
      totalClaimed: (campaign.totalClaimed || 0) + claimAmount,
      lastUpdated: new Date().toISOString()
    });

    console.log(`✅ Milestone ${milestonePercentage}% claimed for campaign:`, campaignId);
    return updatedCampaign || null;
  }

  // Clear all campaigns (for testing)
  clearAllCampaigns(): void {
    this.campaigns = [];
    this.saveCampaigns();
    console.log('🗑️ All campaigns cleared from storage');
  }

  // Get campaign statistics
  getStatistics(): CampaignStatistics {
    const totalCampaigns = this.campaigns.length;
    const activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
    const totalRaised = this.campaigns.reduce((sum, c) => sum + c.currentAmount, 0);
    const totalDonors = this.campaigns.reduce((sum, c) => sum + c.donorCount, 0);

    return {
      totalCampaigns,
      activeCampaigns,
      totalRaised,
      totalDonors
    };
  }
}

// Export singleton instance
export const campaignStorage = new CampaignStorage();
export default campaignStorage;

