// MeshJS compatible datum encoding for Aiken validator
// Using constructor/fields approach that works with current MeshJS version

export function encodeCampaignDatum(datum) {
  try {
    console.log('🔧 Encoding campaign datum for Aiken validator...');
    console.log('🔍 Input datum:', datum);
    
    // Validate all fields and provide safe defaults
    const safeEncode = (value, defaultValue, type = 'any') => {
      if (value === undefined || value === null) {
        console.warn(`⚠️ Using default for undefined value: ${defaultValue}`);
        return defaultValue;
      }
      
      if (type === 'number' && (isNaN(value) || !isFinite(value))) {
        console.warn(`⚠️ Invalid number, using default: ${defaultValue}`);
        return defaultValue;
      }
      
      return value;
    };
    
    // Create datum using MeshJS-compatible structure
    // This matches your Aiken MedicalCampaignDatum structure
    const campaignDatum = {
      constructor: 0, // MedicalCampaignDatum constructor
      fields: [
        // campaign_id: Int
        safeEncode(datum.campaign_id, Date.now(), 'number'),
        
        // title: ByteArray (as string)
        safeEncode(datum.title, "Medical Campaign"),
        
        // description: ByteArray (as string)
        safeEncode(datum.description, "Medical treatment needed"),
        
        // total_goal: Int (in lovelace)
        safeEncode(datum.total_goal, 1000000000, 'number'),
        
        // creator: VerificationKeyHash (as string)
        safeEncode(datum.creator, "addr_test1qdefault"),
        
        // beneficiary: VerificationKeyHash (as string)
        safeEncode(datum.beneficiary, "addr_test1qdefault"),
        
        // medical_authority: VerificationKeyHash (as string)
        safeEncode(datum.medical_authority, "addr_test1qdefault"),
        
        // current_funds: Int
        safeEncode(datum.current_funds, 0, 'number'),
        
        // total_claimed: Int
        safeEncode(datum.total_claimed, 0, 'number'),
        
        // deadline: Int
        safeEncode(datum.deadline, Date.now() + 30 * 24 * 60 * 60 * 1000, 'number'),
        
        // status: CampaignStatus (Active = 0)
        { constructor: 0, fields: [] },
        
        // milestones: List<FundingMilestone> (empty for now)
        [],
        
        // min_contribution: Int
        safeEncode(datum.min_contribution, 1000000, 'number'),
        
        // verification_required: Bool (True = 1)
        { constructor: 1, fields: [] },
        
        // emergency_contact: VerificationKeyHash (as string)
        safeEncode(datum.emergency_contact, "addr_test1qdefault"),
        
        // created_at: Int
        safeEncode(datum.created_at, Date.now(), 'number'),
        
        // last_updated: Int
        safeEncode(datum.last_updated, Date.now(), 'number')
      ]
    };

    console.log('✅ Campaign datum encoded for Aiken validator');
    console.log('📄 Final encoded datum:', campaignDatum);
    return campaignDatum;
    
  } catch (error) {
    console.error('❌ Error encoding campaign datum:', error);
    // Return basic structure as fallback
    return {
      campaign_id: datum.campaign_id || 0,
      title: datum.title || "",
      description: datum.description || "",
      total_goal: datum.total_goal || 0,
      creator: datum.creator || "",
      beneficiary: datum.beneficiary || "",
      current_funds: datum.current_funds || 0
    };
  }
}

export function encodeRedeemer(campaignId, action, actionData = {}) {
  try {
    console.log('🔧 Encoding redeemer for Aiken validator...');
    
    // Map action strings to your Aiken MedicalAction constructors
    const getActionConstructor = (actionName) => {
      switch (actionName) {
        case "CreateCampaign":
          return { constructor: 0, fields: [] }; // CreateCampaign
        case "ContributeFunds":
          return { 
            constructor: 1, 
            fields: [
              actionData.amount || 0,
              actionData.contributor || ""
            ]
          }; // ContributeFunds
        case "ClaimMilestoneFunds":
          return { 
            constructor: 2, 
            fields: [actionData.milestone_percentage || 25]
          }; // ClaimMilestoneFunds
        case "RefundContributor":
          return { 
            constructor: 3, 
            fields: [
              actionData.contributor || "",
              actionData.amount || 0
            ]
          }; // RefundContributor
        case "PauseCampaign":
          return { constructor: 4, fields: [] }; // PauseCampaign
        case "ResumeCampaign":
          return { constructor: 5, fields: [] }; // ResumeCampaign
        case "CancelCampaign":
          return { constructor: 6, fields: [] }; // CancelCampaign
        case "CompleteCampaign":
          return { constructor: 7, fields: [] }; // CompleteCampaign
        default:
          return { constructor: 0, fields: [] }; // Default to CreateCampaign
      }
    };
    
    // Encode according to your Aiken validator's MedicalRedeemer schema
    const redeemer = {
      constructor: 0, // MedicalRedeemer constructor
      fields: [
        campaignId || 0, // campaign_id: Int
        getActionConstructor(action) // action: MedicalAction
      ]
    };

    console.log('✅ Redeemer encoded for Aiken validator');
    console.log('📄 Action:', action, '→', getActionConstructor(action));
    return redeemer;
    
  } catch (error) {
    console.error('❌ Error encoding redeemer:', error);
    // Fallback to simple structure
    return {
      constructor: 0,
      fields: [
        campaignId || 0,
        { constructor: 0, fields: [] } // Default to CreateCampaign
      ]
    };
  }
}

// Decode datum from plutus data
export function decodeCampaignDatum(plutusData) {
  try {
    // Simplified decoder - in production, you'd use proper CBOR decoding
    if (typeof plutusData === 'string') {
      return JSON.parse(plutusData);
    }
    
    // Handle MeshJS datum structure
    if (plutusData && plutusData.constructor !== undefined) {
      return plutusData;
    }
    
    return plutusData;
  } catch (error) {
    console.error('Error decoding datum:', error);
    return null;
  }
}

// Utility functions for ADA/Lovelace conversion
export function adaToLovelace(ada) {
  return Math.floor(ada * 1000000);
}

export function lovelaceToAda(lovelace) {
  return lovelace / 1000000;
}

// Campaign status helpers
export function getCampaignStatus(statusConstructor) {
  const statusMap = {
    0: 'Active',
    1: 'Paused', 
    2: 'Completed',
    3: 'Cancelled'
  };
  
  if (typeof statusConstructor === 'object' && statusConstructor.constructor !== undefined) {
    return statusMap[statusConstructor.constructor] || 'Unknown';
  }
  
  return statusMap[statusConstructor] || 'Unknown';
}

// Get campaign status with additional context (alias for getCampaignStatus)
export function getCampaignStatusText(statusConstructor) {
  return getCampaignStatus(statusConstructor);
}

// Get campaign status with color coding for UI
export function getCampaignStatusWithColor(statusConstructor) {
  const status = getCampaignStatus(statusConstructor);
  
  const statusColors = {
    'Active': { text: 'Active', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    'Paused': { text: 'Paused', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    'Completed': { text: 'Completed', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    'Cancelled': { text: 'Cancelled', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    'Unknown': { text: 'Unknown', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
  };
  
  return statusColors[status] || statusColors['Unknown'];
}

// Get campaign funding progress
export function getCampaignProgress(campaign) {
  if (!campaign || !campaign.total_goal || campaign.total_goal === 0) {
    return {
      percentage: 0,
      raised: 0,
      goal: 0,
      remaining: 0,
      isComplete: false,
      raisedAda: 0,
      goalAda: 0,
      remainingAda: 0
    };
  }
  
  const raised = campaign.current_funds || 0;
  const goal = campaign.total_goal;
  const remaining = Math.max(0, goal - raised);
  const percentage = Math.min(100, (raised / goal) * 100);
  const isComplete = percentage >= 100;
  
  return {
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    raised,
    goal,
    remaining,
    isComplete,
    raisedAda: lovelaceToAda(raised),
    goalAda: lovelaceToAda(goal),
    remainingAda: lovelaceToAda(remaining)
  };
}

// Get campaign time progress
export function getCampaignTimeProgress(campaign) {
  if (!campaign || !campaign.deadline) {
    return {
      timeRemaining: 0,
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      timeRemainingText: 'No deadline set'
    };
  }
  
  const now = Date.now();
  const deadline = campaign.deadline;
  const timeRemaining = Math.max(0, deadline - now);
  const isExpired = timeRemaining === 0;
  
  const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
  const hoursRemaining = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  let timeRemainingText;
  if (isExpired) {
    timeRemainingText = 'Campaign ended';
  } else if (daysRemaining > 0) {
    timeRemainingText = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
  } else if (hoursRemaining > 0) {
    timeRemainingText = `${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} remaining`;
  } else {
    const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));
    timeRemainingText = `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} remaining`;
  }
  
  return {
    timeRemaining,
    daysRemaining,
    hoursRemaining,
    isExpired,
    timeRemainingText
  };
}

// Get time remaining (simplified version)
export function getTimeRemaining(campaign) {
  if (!campaign || !campaign.deadline) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      text: 'No deadline set'
    };
  }
  
  const now = Date.now();
  const deadline = campaign.deadline;
  const timeRemaining = Math.max(0, deadline - now);
  const isExpired = timeRemaining === 0;
  
  if (isExpired) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      text: 'Campaign ended'
    };
  }
  
  const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
  
  let text;
  if (days > 0) {
    text = `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s remaining`;
  } else {
    text = `${seconds}s remaining`;
  }
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    text
  };
}

// Refund eligibility check
export function canRequestRefund(campaign) {
  if (!campaign) return false;
  
  const status = getCampaignStatus(campaign.status);
  const now = Date.now();
  const deadline = campaign.deadline || 0;
  
  // Can request refund if:
  // 1. Campaign is cancelled
  // 2. Campaign deadline has passed and goal not reached
  // 3. Campaign is paused for extended period
  
  return (
    status === 'Cancelled' ||
    (status === 'Active' && now > deadline && campaign.current_funds < campaign.total_goal) ||
    status === 'Paused'
  );
}

// Milestone helpers
export function getNextMilestone(campaign) {
  if (!campaign || !campaign.milestones) return null;
  
  return campaign.milestones.find(milestone => !milestone.claimed);
}

export function getMilestoneProgress(campaign) {
  if (!campaign || !campaign.milestones || campaign.milestones.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  
  const completed = campaign.milestones.filter(m => m.claimed).length;
  const total = campaign.milestones.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return { completed, total, percentage };
}

// Check if milestone can be claimed (based on your Aiken validator logic)
export function canClaimMilestone(campaign, milestonePercentage, currentTime = Date.now()) {
  if (!campaign || !campaign.milestones) return false;
  
  // Find the milestone to claim
  const milestone = campaign.milestones.find(m => m.percentage === milestonePercentage);
  if (!milestone) return false;
  
  // Check if milestone is already claimed
  if (milestone.claimed) return false;
  
  // Check if campaign has reached the funding threshold for this milestone
  const fundingPercentage = (campaign.current_funds / campaign.total_goal) * 100;
  if (fundingPercentage < milestonePercentage) return false;
  
  // Check milestone claim timing (7 days between claims based on your validator)
  const minClaimInterval = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const lastClaimTime = getLastMilestoneClaimTime(campaign.milestones);
  
  if (currentTime < lastClaimTime + minClaimInterval) return false;
  
  // Check if campaign is active
  const status = getCampaignStatus(campaign.status);
  if (status !== 'Active') return false;
  
  // Check if campaign deadline hasn't passed
  if (currentTime > campaign.deadline) return false;
  
  return true;
}

// Get the timestamp of the last milestone claim (matching your Aiken logic)
export function getLastMilestoneClaimTime(milestones) {
  if (!milestones || milestones.length === 0) return 0;
  
  // Find the most recent claim date from claimed milestones
  const claimedMilestones = milestones.filter(m => m.claimed && m.claim_date > 0);
  
  if (claimedMilestones.length === 0) return 0;
  
  return Math.max(...claimedMilestones.map(m => m.claim_date));
}

// Calculate claimable amount for a milestone
export function getClaimableAmount(campaign, milestonePercentage) {
  if (!campaign) return 0;
  
  const milestoneAmount = Math.floor((campaign.total_goal * milestonePercentage) / 100);
  return Math.min(milestoneAmount, campaign.current_funds - campaign.total_claimed);
}

// Get all claimable milestones
export function getClaimableMilestones(campaign, currentTime = Date.now()) {
  if (!campaign || !campaign.milestones) return [];
  
  return campaign.milestones.filter(milestone => 
    canClaimMilestone(campaign, milestone.percentage, currentTime)
  );
}

// Get the next claimable milestone (single milestone)
export function getNextClaimableMilestone(campaign, currentTime = Date.now()) {
  if (!campaign || !campaign.milestones) return null;
  
  // Get all claimable milestones
  const claimableMilestones = getClaimableMilestones(campaign, currentTime);
  
  if (claimableMilestones.length === 0) return null;
  
  // Return the milestone with the lowest percentage (next in sequence)
  return claimableMilestones.reduce((next, current) => 
    current.percentage < next.percentage ? current : next
  );
}

// Address validation helpers
export function isValidCardanoAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Basic Cardano address validation
  // Testnet addresses start with addr_test1
  // Mainnet addresses start with addr1
  return address.startsWith('addr_test1') || address.startsWith('addr1');
}

export function formatAddress(address, length = 12) {
  if (!address) return '';
  if (address.length <= length * 2) return address;
  
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}
