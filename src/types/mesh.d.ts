// Type definitions for MeshSDK wallet
export interface Asset {
  unit: string;
  quantity: string;
}

export interface UTxO {
  input: {
    txHash: string;
    outputIndex: number;
  };
  output: {
    address: string;
    amount: Array<{ unit: string; quantity: string }>;
    plutusData?: unknown;
  };
}

export interface CampaignDatum {
  campaign_id?: number;
  title?: string;
  description?: string;
  total_goal?: number;
  creator?: string;
  beneficiary?: string;
  medical_authority?: string;
  current_funds?: number;
  total_claimed?: number;
  deadline?: number;
  status?: number | { constructor: number; fields: unknown[] };
  milestones?: Milestone[];
  min_contribution?: number;
  verification_required?: boolean | { constructor: number; fields: unknown[] };
  emergency_contact?: string;
  created_at?: number;
  last_updated?: number;
  [key: string]: unknown;
}

export interface Milestone {
  percentage: number;
  claimed: boolean;
  claimDate?: string | null;
  amountClaimed?: number;
  transactionHash?: string | null;
  claim_date?: number;
}

export interface CampaignData {
  id?: string | number;
  title?: string;
  description?: string;
  goalAda?: number;
  creator?: string;
  beneficiary?: string;
  medicalAuthority?: string;
  currentAmount?: number;
  targetAmount?: number;
  donorCount?: number;
  status?: string;
  milestones?: Milestone[];
  createdAt?: string;
  transactionHash?: string;
  [key: string]: unknown;
}

