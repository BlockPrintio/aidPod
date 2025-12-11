import { MeshTxBuilder } from '@meshsdk/core';
import { provider, VALIDATOR_SCRIPT, SCRIPT_ADDRESS } from '../mesh-config';
import { encodeCampaignDatum, encodeRedeemer } from '../datum-helpers';

export async function buildContributeTx(wallet, campaignId, contributionAmount, campaignUtxo, currentCampaignDatum) {
  // 1) Gather wallet inputs
  const utxos = await wallet.getUtxos();
  const changeAddress = await wallet.getChangeAddress();

  // 2) Create updated datum
  const updatedDatum = {
    ...currentCampaignDatum,
    current_funds: currentCampaignDatum.current_funds + contributionAmount,
    last_updated: Date.now()
  };

  // 3) Create redeemer
  const redeemer = encodeRedeemer(campaignId, 'ContributeFunds', {
    amount: contributionAmount,
    contributor: changeAddress
  });

  // 4) Calculate new UTxO value
  const currentLovelace = parseInt(campaignUtxo.output.amount.find(a => a.unit === 'lovelace')?.quantity || '0');
  const newLovelaceAmount = currentLovelace + contributionAmount;

  // 5) Build transaction
  const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
  
  const unsignedTx = await txBuilder
    // Spend the campaign UTxO
    .spendingPlutusScript(VALIDATOR_SCRIPT)
    .txIn(campaignUtxo.input.txHash, campaignUtxo.input.outputIndex, campaignUtxo.output.amount, campaignUtxo.output.address)
    .txInDatumValue(campaignUtxo.output.plutusData || encodeCampaignDatum(currentCampaignDatum))
    .txInRedeemerValue(redeemer)
    
    // Send updated campaign UTxO back to script
    .txOut(SCRIPT_ADDRESS, [
      { unit: 'lovelace', quantity: newLovelaceAmount.toString() }
    ])
    .txOutDatumHashValue(encodeCampaignDatum(updatedDatum))
    
    // Create contributor tracking output
    .txOut(changeAddress, [
      { unit: 'lovelace', quantity: '2000000' }
    ])
    
    // Set required signers
    .requiredSignerHash(changeAddress)
    
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .complete();

  return unsignedTx;
}
