/**
 * Hospital Tracking Storage System
 * Tracks published campaigns and donations for hospital verification dashboard
 */

const STORAGE_KEY = 'aidpod_hospital_tracking';

class HospitalTrackingStorage {
  constructor() {
    this.data = this.loadData();
  }

  // Load data from localStorage
  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { publishedCampaigns: [], donations: [] };
    } catch (error) {
      console.error('Error loading hospital tracking data:', error);
      return { publishedCampaigns: [], donations: [] };
    }
  }

  // Save data to localStorage
  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving hospital tracking data:', error);
    }
  }

  // Track published campaign
  trackPublishedCampaign(
    campaignId,
    patientName,
    hospitalName,
    targetAmount,
    verifiedBy,
    verificationRequestId,
    transactionHash
  ) {
    // Check if campaign already exists
    const existing = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (existing) {
      console.log('Campaign already tracked:', campaignId);
      return existing;
    }

    const campaign = {
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
  trackDonation(campaignId, amount, donorAddress, transactionHash) {
    // Check if donation already exists (avoid duplicates)
    const existingDonation = this.data.donations.find(
      d => d.transactionHash === transactionHash && d.campaignId === campaignId
    );
    
    if (existingDonation) {
      console.log('Donation already tracked:', transactionHash);
      return existingDonation;
    }

    const donation = {
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
      campaign.lastDonationDate = new Date().toISOString();
    }

    this.saveData();
    
    console.log('✅ Donation tracked in hospital dashboard:', donation.donationId, `Amount: ${amount} ADA`);
    return donation;
  }

  // Get all published campaigns
  getPublishedCampaigns() {
    return this.data.publishedCampaigns;
  }

  // Get campaigns by hospital
  getCampaignsByHospital(hospitalName) {
    return this.data.publishedCampaigns.filter(c => 
      c.hospitalName.toLowerCase() === hospitalName.toLowerCase()
    );
  }

  // Get all donations
  getDonations() {
    return this.data.donations;
  }

  // Get donations by campaign
  getDonationsByCampaign(campaignId) {
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
  updateCampaignStatus(campaignId, status) {
    const campaign = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (campaign) {
      campaign.status = status;
      this.saveData();
    }
  }

  // Update campaign claim
  updateCampaignClaim(campaignId, claimAmount, transactionHash) {
    const campaign = this.data.publishedCampaigns.find(c => c.campaignId === campaignId);
    if (campaign) {
      campaign.totalClaimed = (campaign.totalClaimed || 0) + claimAmount;
      campaign.lastClaimDate = new Date().toISOString();
      campaign.lastClaimTx = transactionHash;
      this.saveData();
      console.log(`✅ Claimed ${claimAmount} ADA from campaign ${campaignId}`);
      return campaign;
    }
    return null;
  }

  // Sync with campaign storage (called when campaigns are published or donations are made)
  syncFromCampaignStorage(campaigns, donations) {
    // Sync campaigns
    campaigns.forEach(campaign => {
      const existingCampaign = this.data.publishedCampaigns.find(c => c.campaignId === campaign.id);
      
      if (!existingCampaign) {
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
      } else {
        // Update campaign amounts from campaign storage
        if (campaign.currentAmount !== undefined) {
          existingCampaign.currentAmount = campaign.currentAmount;
        }
        if (campaign.donorCount !== undefined) {
          existingCampaign.donorCount = campaign.donorCount;
        }
      }

      // Sync all donations from campaign storage
      if (campaign.donations && Array.isArray(campaign.donations)) {
        campaign.donations.forEach(donation => {
          const existingDonation = this.data.donations.find(
            d => d.transactionHash === donation.transactionHash && d.campaignId === campaign.id
          );
          
          if (!existingDonation) {
            // Track this donation
            this.trackDonation(
              campaign.id,
              donation.amount,
              donation.donorAddress,
              donation.transactionHash
            );
          }
        });
      }
    });

    // Sync donations from the donations array parameter
    if (donations && Array.isArray(donations)) {
      donations.forEach(donation => {
        const existingDonation = this.data.donations.find(
          d => d.transactionHash === donation.transactionHash && d.campaignId === donation.campaignId
        );
        
        if (!existingDonation) {
          this.trackDonation(
            donation.campaignId,
            donation.amount,
            donation.donorAddress,
            donation.transactionHash
          );
        }
      });
    }

    this.saveData();
  }
}

// Export singleton instance
export const hospitalTracking = new HospitalTrackingStorage();
export default hospitalTracking;

