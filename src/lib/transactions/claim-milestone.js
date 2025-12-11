import { MeshTxBuilder } from '@meshsdk/core';
import { provider, VALIDATOR_SCRIPT, SCRIPT_ADDRESS } from '../mesh-config';
import { encodeCampaignDatum, encodeRedeemer } from '../datum-helpers';

export async function buildClaimMilestoneTx(wallet, campaignId, milestonePercentage, campaignUtxo, currentCampaignDatum) {
  // 1) Gather wallet inputs
  const utxos = await wallet.getUtxos();
  const changeAddress = await wallet.getChangeAddress();

  // 2) Calculate claimable amount
  const milestoneThreshold = Math.floor(currentCampaignDatum.total_goal * milestonePercentage / 100);
  const claimableAmount = Math.min(currentCampaignDatum.current_funds, milestoneThreshold);

  // 3) Update milestone as claimed
  const updatedMilestones = currentCampaignDatum.milestones.map(m => 
    m.percentage === milestonePercentage 
      ? { ...m, claimed: true, claim_date: Date.now(), amount_claimed: claimableAmount }
      : m
  );

  const updatedDatum = {
    ...currentCampaignDatum,
    total_claimed: currentCampaignDatum.total_claimed + claimableAmount,
    milestones: updatedMilestones,
    last_updated: Date.now()
  };

  // 4) Create redeemer
  const redeemer = encodeRedeemer(campaignId, 'ClaimMilestoneFunds', {
    milestone_percentage: milestonePercentage
  });

  // 5) Calculate remaining value
  const currentLovelace = parseInt(campaignUtxo.output.amount.find(a => a.unit === 'lovelace')?.quantity || '0');
  const remainingLovelace = currentLovelace - claimableAmount;

  // 6) Build transaction
  const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
  
  const builder = txBuilder
    // Spend campaign UTxO
    .spendingPlutusScript(VALIDATOR_SCRIPT)
    .txIn(campaignUtxo.input.txHash, campaignUtxo.input.outputIndex, campaignUtxo.output.amount, campaignUtxo.output.address)
    .txInInlineDatum(campaignUtxo.output.plutusData)
    .txInRedeemerValue(redeemer)
    
    // Send payment to beneficiary
    .txOut(currentCampaignDatum.beneficiary, [
      { unit: 'lovelace', quantity: claimableAmount.toString() }
    ]);

  // Send remaining funds back to campaign if sufficient
  if (remainingLovelace >= 1000000) {
    builder.txOut(SCRIPT_ADDRESS, [
      { unit: 'lovelace', quantity: remainingLovelace.toString() }
    ])
    .txOutInlineDatum(encodeCampaignDatum(updatedDatum));
  }

  const unsignedTx = await builder
    .requiredSignerHash(changeAddress)
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .complete();

  return unsignedTx;
}
