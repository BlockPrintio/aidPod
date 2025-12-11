import { MeshTxBuilder } from '@meshsdk/core';
import { provider, VALIDATOR_SCRIPT, SCRIPT_ADDRESS } from '../mesh-config';
import { encodeCampaignDatum, encodeRedeemer } from '../datum-helpers';

export async function buildPauseCampaignTx(wallet, campaignId, campaignUtxo, currentCampaignDatum) {
  // 1) Gather wallet inputs
  const utxos = await wallet.getUtxos();
  const changeAddress = await wallet.getChangeAddress();

  // 2) Create updated datum with Paused status
  const updatedDatum = {
    ...currentCampaignDatum,
    status: 1, // Paused
    last_updated: Date.now()
  };

  // 3) Create redeemer
  const redeemer = encodeRedeemer(campaignId, 'PauseCampaign', {});

  // 4) Build transaction
  const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
  
  const unsignedTx = await txBuilder
    // Spend campaign UTxO
    .spendingPlutusScript(VALIDATOR_SCRIPT)
    .txIn(campaignUtxo.input.txHash, campaignUtxo.input.outputIndex, campaignUtxo.output.amount, campaignUtxo.output.address)
    .txInInlineDatum(campaignUtxo.output.plutusData)
    .txInRedeemerValue(redeemer)
    
    // Send updated campaign UTxO back to script
    .txOut(SCRIPT_ADDRESS, campaignUtxo.output.amount)
    .txOutInlineDatum(encodeCampaignDatum(updatedDatum))
    
    // Set required signers (creator, medical authority, or emergency contact)
    .requiredSignerHash(changeAddress)
    
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .complete();

  return unsignedTx;
}
