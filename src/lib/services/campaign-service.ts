import { provider } from '../mesh-config';
import { getAllCampaigns } from '../queries/campaign-queries';
import { lovelaceToAda } from '../datum-helpers';
import { campaignStorage } from '../storage/campaign-storage';
import type { CampaignData, UTxO, CampaignDatum } from '../../types/mesh';

interface DisplayCampaign {
  id: number | string;
  title?: string;
  patientName?: string;
  age?: number;
  medicalCondition?: string;
  urgency?: string;
  image?: string;
  storyPreview?: string;
  currentAmount: number;
  targetAmount: number;
  donorCount: number;
  daysRemaining: number;
  location?: string;
  verificationStatus?: string;
  verifierName?: string;
  verificationDate?: string;
  status: string;
  createdAt: string;
  isBlockchain: boolean;
  utxo?: UTxO;
  datum?: CampaignDatum;
  milestones?: CampaignDatum['milestones'];
  transactionHash?: string;
  durationDays?: number;
  goalAda?: number;
}

class CampaignService {
  private mockCampaigns: DisplayCampaign[];

  constructor() {
    this.mockCampaigns = [
      {
        id: 1,
        title: "Emergency Heart Surgery for Sarah",
        patientName: "Sarah Johnson",
        age: 34,
        medicalCondition: "Cardiac Arrhythmia",
        urgency: "critical",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        storyPreview: "Sarah is a loving mother of two who was diagnosed with a severe cardiac arrhythmia that requires immediate surgical intervention.",
        currentAmount: 15750,
        targetAmount: 25000,
        donorCount: 127,
        daysRemaining: 18,
        location: "Phoenix, AZ",
        verificationStatus: "verified",
        verifierName: "Phoenix Heart Institute",
        verificationDate: "2025-08-10",
        status: "active",
        createdAt: "2025-08-01",
        isBlockchain: false // Mock campaign
      },
      {
        id: 2,
        title: "Cancer Treatment Support for Michael",
        patientName: "Michael Rodriguez",
        age: 42,
        medicalCondition: "Acute Lymphoblastic Leukemia",
        urgency: "urgent",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop",
        storyPreview: "Michael was recently diagnosed with acute lymphoblastic leukemia and needs immediate chemotherapy treatment.",
        currentAmount: 8200,
        targetAmount: 40000,
        donorCount: 89,
        daysRemaining: 45,
        location: "Denver, CO",
        verificationStatus: "verified",
        verifierName: "Denver Cancer Center",
        verificationDate: "2025-08-08",
        status: "active",
        createdAt: "2025-07-28",
        isBlockchain: false // Mock campaign
      }
    ];
  }

  // Fetch campaigns from blockchain
  async getBlockchainCampaigns(): Promise<DisplayCampaign[]> {
    try {
      // Check if Blockfrost API key is configured
      const apiKey = import.meta.env.VITE_BLOCKFROST_PROJECT_ID;
      if (!apiKey || apiKey === 'your_blockfrost_project_id_here') {
        console.warn('⚠️ Blockfrost API key not configured. Using mock data only.');
        console.warn('📖 See BLOCKCHAIN_SETUP.md for setup instructions.');
        return [];
      }

      console.log('🔍 Fetching campaigns from blockchain...');
      
      // Fetch REAL campaigns from script address UTxOs
      console.log('🔍 Fetching campaigns from script address:', import.meta.env.VITE_CAMPAIGN_SCRIPT_ADDRESS);
      const campaignData = await getAllCampaigns(provider);
      
      return campaignData.map(({ utxo, datum }) => ({
        id: datum.campaign_id || 0,
        title: datum.title,
        patientName: datum.creator,
        medicalCondition: "Medical Campaign",
        urgency: this.getUrgencyFromDeadline(datum.deadline || 0),
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        storyPreview: datum.description,
        currentAmount: lovelaceToAda(datum.current_funds || 0),
        targetAmount: lovelaceToAda(datum.total_goal || 0),
        donorCount: 0, // Would need separate tracking
        daysRemaining: this.getDaysRemaining(datum.deadline || 0),
        location: "Blockchain",
        verificationStatus: datum.verification_required ? "verified" : "pending",
        verifierName: datum.medical_authority,
        verificationDate: datum.created_at ? new Date(datum.created_at).toISOString().split('T')[0] : undefined,
        status: this.getStatusText(datum.status),
        createdAt: datum.created_at ? new Date(datum.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isBlockchain: true,
        utxo, // Store UTxO for transactions
        datum, // Store full datum
        milestones: datum.milestones // Include milestone data
      }));
    } catch (error) {
      console.error('Error fetching blockchain campaigns:', error);
      return [];
    }
  }

  // Fetch campaigns from local storage (created via simple transactions)
  async fetchSimpleTransactionCampaigns(): Promise<DisplayCampaign[]> {
    const storedCampaigns = campaignStorage.getAllCampaigns();
    
    console.log(`📦 Found ${storedCampaigns.length} campaigns in local storage`);
    
    return storedCampaigns.map(campaign => ({
      id: campaign.id || '',
      title: campaign.title,
      patientName: campaign.creator || "Anonymous",
      medicalCondition: "Medical Campaign",
      urgency: this.getUrgencyFromGoal(campaign.goalAda || 0),
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      storyPreview: campaign.description,
      currentAmount: campaign.currentAmount,
      targetAmount: campaign.goalAda || 0,
      donorCount: campaign.donorCount,
      daysRemaining: this.getDaysRemainingFromCreated(campaign.createdAt || '', campaign.durationDays),
      location: "Blockchain",
      verificationStatus: "verified",
      verifierName: "Blockchain Verified",
      verificationDate: campaign.createdAt ? campaign.createdAt.split('T')[0] : undefined,
      status: campaign.status || 'active',
      createdAt: campaign.createdAt ? campaign.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      isBlockchain: true,
      transactionHash: campaign.transactionHash
    }));
  }

  // Add method to save new campaign
  saveCampaign(campaignData: CampaignData, transactionHash: string) {
    return campaignStorage.addCampaign(campaignData, transactionHash);
  }

  // Get all campaigns (mock + blockchain)
  async getAllCampaigns(): Promise<DisplayCampaign[]> {
    const [blockchainCampaigns, mockCampaigns] = await Promise.all([
      this.getBlockchainCampaigns(),
      Promise.resolve(this.mockCampaigns)
    ]);

    return [...blockchainCampaigns, ...mockCampaigns];
  }

  // Get single campaign by ID
  async getCampaignById(id: string | number): Promise<DisplayCampaign | undefined> {
    const allCampaigns = await this.getAllCampaigns();
    const idNum = typeof id === 'string' ? parseInt(id) : id;
    return allCampaigns.find(campaign => campaign.id === idNum);
  }

  // Helper methods
  private getUrgencyFromDeadline(deadline: number): string {
    const now = Date.now();
    const daysRemaining = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 7) return 'critical';
    if (daysRemaining <= 30) return 'urgent';
    return 'moderate';
  }

  private getDaysRemaining(deadline: number): number {
    const now = Date.now();
    const daysRemaining = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  private getStatusText(status: number | { constructor: number; fields: unknown[] } | undefined): string {
    const statusMap: Record<number, string> = {
      0: 'active',
      1: 'paused',
      2: 'completed',
      3: 'cancelled'
    };
    
    if (typeof status === 'number') {
      return statusMap[status] || 'active';
    }
    
    if (typeof status === 'object' && status && 'constructor' in status) {
      return statusMap[status.constructor] || 'active';
    }
    
    return 'active';
  }

  private getUrgencyFromGoal(goalAda: number): string {
    if (goalAda >= 10000) return 'critical';
    if (goalAda >= 5000) return 'urgent';
    return 'moderate';
  }

  private getDaysRemainingFromCreated(createdAt: string, durationDays: number = 30): number {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }
}

export const campaignService = new CampaignService();
export default campaignService;

