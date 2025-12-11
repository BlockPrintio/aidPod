import { MeshTxBuilder } from '@meshsdk/core';
import { provider, VALIDATOR_SCRIPT, SCRIPT_ADDRESS } from '../mesh-config';
import { encodeCampaignDatum, encodeRedeemer } from '../datum-helpers';

export async function buildRefundTx(wallet, campaignId, refundAmount, campaignUtxo, currentCampaignDatum) {
  // 1) Gather wallet inputs
  const utxos = await wallet.getUtxos();
  const changeAddress = await wallet.getChangeAddress();

  // 2) Create updated datum
  const updatedDatum = {
    ...currentCampaignDatum,
    current_funds: currentCampaignDatum.current_funds - refundAmount,
    last_updated: Date.now()
  };

  // 3) Create redeemer
  const redeemer = encodeRedeemer(campaignId, 'RefundContributor', {
    contributor: changeAddress,
    amount: refundAmount
  });

  // 4) Calculate remaining value
  const currentLovelace = parseInt(campaignUtxo.output.amount.find(a => a.unit === 'lovelace')?.quantity || '0');
  const remainingLovelace = currentLovelace - refundAmount;

  // 5) Build transaction
  const txBuilder = new MeshTxBuilder({ fetcher: provider, verbose: true });
  
  const builder = txBuilder
    // Spend campaign UTxO
    .spendingPlutusScript(VALIDATOR_SCRIPT)
    .txIn(campaignUtxo.input.txHash, campaignUtxo.input.outputIndex, campaignUtxo.output.amount, campaignUtxo.output.address)
    .txInInlineDatum(campaignUtxo.output.plutusData)
    .txInRedeemerValue(redeemer)
    
    // Send refund to contributor
    .txOut(changeAddress, [
      { unit: 'lovelace', quantity: refundAmount.toString() }
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
