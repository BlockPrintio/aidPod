import { MeshTxBuilder } from '@meshsdk/core';
import { provider } from '../mesh-config';
import type { MeshWallet, CampaignData } from '../../types/mesh';

interface ClaimResult {
  canClaim: boolean;
  claimableAmount?: number;
  reason: string;
}

/**
 * Simple milestone claiming transaction
 * This creates a basic transaction that transfers ADA to the beneficiary
 */
export async function buildSimpleClaimTx(
  wallet: MeshWallet,
  campaignData: CampaignData,
  milestonePercentage: number
): Promise<string> {
  try {
    console.log('🏗️ Building simple milestone claim transaction...');
    console.log('Campaign:', campaignData.title);
    console.log('Milestone:', `${milestonePercentage}%`);
    
    // 1) Gather wallet inputs
    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();
    
    console.log('Claimer Address:', changeAddress);
    console.log('Beneficiary Address:', campaignData.beneficiary);

    // 2) Calculate claimable amount (in lovelace)
    const totalGoalLovelace = (campaignData.goalAda || 0) * 1000000; // Convert ADA to lovelace
    const currentFundsLovelace = (campaignData.currentAmount || 0) * 1000000;
    const milestoneThreshold = Math.floor(totalGoalLovelace * milestonePercentage / 100);
    const claimableAmount = Math.min(currentFundsLovelace, milestoneThreshold);
    
    console.log('Total Goal:', totalGoalLovelace, 'lovelace');
    console.log('Current Funds:', currentFundsLovelace, 'lovelace');
    console.log('Milestone Threshold:', milestoneThreshold, 'lovelace');
    console.log('Claimable Amount:', claimableAmount, 'lovelace');

    // 3) Validate claim eligibility
    if (claimableAmount <= 0) {
      throw new Error('No funds available to claim for this milestone');
    }

    if (changeAddress !== campaignData.beneficiary) {
      throw new Error('Only the campaign beneficiary can claim milestone funds');
    }

    // 4) Build simple transaction (for testing - sends small amount to beneficiary)
    const testClaimAmount = Math.min(claimableAmount, 2000000); // Max 2 ADA for testing
    
    const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
    
    const unsignedTx = await txBuilder
      .txOut(campaignData.beneficiary || changeAddress, [
        { unit: 'lovelace', quantity: testClaimAmount.toString() }
      ])
      .selectUtxosFrom(utxos)
      .changeAddress(changeAddress)
      .complete();

    console.log('✅ Simple claim transaction built successfully');
    return unsignedTx;
    
  } catch (error) {
    const err = error as Error;
    console.error('❌ Error building claim transaction:', err);
    throw new Error(`Claim transaction failed: ${err.message}`);
  }
}

/**
 * Check if user can claim a specific milestone
 */
export function canClaimMilestone(
  campaignData: CampaignData,
  milestonePercentage: number,
  userAddress: string
): ClaimResult {
  // Check if user is the beneficiary
  if (userAddress !== campaignData.beneficiary) {
    return {
      canClaim: false,
      reason: 'Only the campaign beneficiary can claim milestone funds'
    };
  }

  // Check if milestone is already claimed
  const milestone = campaignData.milestones?.find(m => m.percentage === milestonePercentage);
  if (milestone?.claimed) {
    return {
      canClaim: false,
      reason: 'This milestone has already been claimed'
    };
  }

  // Check if campaign has reached the milestone threshold
  const targetAmount = campaignData.targetAmount || campaignData.goalAda || 0;
  const currentAmount = campaignData.currentAmount || 0;
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  if (progressPercentage < milestonePercentage) {
    return {
      canClaim: false,
      reason: `Campaign must reach ${milestonePercentage}% funding before claiming this milestone`
    };
  }

  // Calculate claimable amount
  const totalGoalLovelace = targetAmount * 1000000;
  const currentFundsLovelace = currentAmount * 1000000;
  const milestoneThreshold = Math.floor(totalGoalLovelace * milestonePercentage / 100);
  const claimableAmount = Math.min(currentFundsLovelace, milestoneThreshold);

  if (claimableAmount <= 0) {
    return {
      canClaim: false,
      reason: 'No funds available to claim for this milestone'
    };
  }

  return {
    canClaim: true,
    claimableAmount: claimableAmount / 1000000, // Convert back to ADA
    reason: `You can claim ${(claimableAmount / 1000000).toFixed(2)} ADA for the ${milestonePercentage}% milestone`
  };
}

/**
 * Get available milestones for claiming
 */
export function getAvailableMilestones(campaignData: CampaignData, userAddress: string): Array<ClaimResult & { percentage: number }> {
  const milestones = [25, 50, 75, 100]; // Standard milestone percentages
  
  return milestones.map(percentage => {
    const claimStatus = canClaimMilestone(campaignData, percentage, userAddress);
    return {
      percentage,
      ...claimStatus
    };
  });
}

