import { MeshTxBuilder } from '@meshsdk/core';
import { provider, VALIDATOR_SCRIPT, SCRIPT_ADDRESS } from '../mesh-config';
import { encodeCampaignDatum, encodeRedeemer } from '../datum-helpers';
import type { MeshWallet, UTxO, CampaignDatum } from '../../types/mesh';

export async function buildCancelCampaignTx(
  wallet: MeshWallet,
  campaignId: number,
  campaignUtxo: UTxO,
  currentCampaignDatum: CampaignDatum,
  medicalAuthorityAddress: string
): Promise<string> {
  // 1) Gather wallet inputs
  const utxos = await wallet.getUtxos();
  const changeAddress = await wallet.getChangeAddress();

  // 2) Create updated datum with Cancelled status
  const updatedDatum: CampaignDatum = {
    ...currentCampaignDatum,
    status: 3, // Cancelled
    last_updated: Date.now()
  };

  // 3) Create redeemer
  const redeemer = encodeRedeemer(campaignId, 'CancelCampaign', {});

  // 4) Build transaction
  const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
  
  const builder = txBuilder
    // Spend campaign UTxO
    .spendingPlutusScript(VALIDATOR_SCRIPT)
    .txIn(campaignUtxo.input.txHash, campaignUtxo.input.outputIndex, campaignUtxo.output.amount, campaignUtxo.output.address)
    .txInInlineDatum(campaignUtxo.output.plutusData)
    .txInRedeemerValue(redeemer)
    
    // Send updated campaign UTxO back to script
    .txOut(SCRIPT_ADDRESS, campaignUtxo.output.amount)
    .txOutInlineDatum(encodeCampaignDatum(updatedDatum))
    
    // Set required signers (creator required)
    .requiredSignerHash(changeAddress);

  // Add medical authority signature if verification required
  if (currentCampaignDatum.verification_required && medicalAuthorityAddress) {
    builder.requiredSignerHash(medicalAuthorityAddress);
  }

  const unsignedTx = await builder
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .complete();

  return unsignedTx;
}

