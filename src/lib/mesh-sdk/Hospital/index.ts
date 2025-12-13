import { Deploy } from "../deploy";
import {
  mConStr0,
  MeshTxBuilder,
  deserializeAddress,
  stringToHex,
  IWallet,
} from "@meshsdk/core";
import { provider } from "../config";
import { admin_token } from "../config";

/**
 * Hospital claims a single donation UTxO from campaign
 */
export const claimCampaignFunds = async (
  campaignTxHash: string,
  hospitalName: string,
  wallet: IWallet
) => {
  const changeAddress = await wallet?.getChangeAddress();
  const utxos = await wallet?.getUtxos();
  const collateral = (await wallet?.getCollateral())[0];

  const script = new Deploy(0);
  const { cbor: campaign_cbor } = await script.hospital_claim(admin_token);
  const { hospital_policyid } = await script.hospital_registry(admin_token);

  const hospitalTokenName = stringToHex(hospitalName + "HOSPITAL");
  const hospitalAsset = hospital_policyid + hospitalTokenName;

  console.log("Finding hospital UTxO with token:", hospitalAsset);

  const hospitalUtxo = utxos.find((utxo) =>
    utxo.output.amount.some((a) => a.unit === hospitalAsset)
  );

  if (!hospitalUtxo) {
    throw new Error(`Hospital auth token not found: ${hospitalAsset}`);
  }
  const campaignUtxos = await provider.fetchUTxOs(campaignTxHash);
  if (campaignUtxos.length === 0) {
    throw new Error("Campaign UTxO not found");
  }

  const campaignUtxo = campaignUtxos[0];

  const campaignScriptAddress = campaignUtxo.output.address;
  const campaignScriptUtxos = await provider.fetchAddressUTxOs(
    campaignScriptAddress
  );
  const markerUtxo = campaignScriptUtxos.find(
    (utxo) => utxo.output.plutusData !== undefined
  );

  if (!markerUtxo) {
    throw new Error("Campaign marker UTxO not found");
  }

  const redeemer = mConStr0([]);
  const { pubKeyHash } = deserializeAddress(changeAddress);

  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });

  const unsignedTx = await txBuilder
    .spendingPlutusScriptV3()
    .txIn(markerUtxo.input.txHash, markerUtxo.input.outputIndex)
    .spendingReferenceTxInInlineDatumPresent()
    .spendingReferenceTxInRedeemerValue(redeemer)
    .txInScript(campaign_cbor)

    .spendingPlutusScriptV3()
    .txIn(campaignUtxo.input.txHash, campaignUtxo.input.outputIndex)
    .spendingReferenceTxInInlineDatumPresent()
    .spendingReferenceTxInRedeemerValue(redeemer)
    .txInScript(campaign_cbor)

    .txIn(hospitalUtxo.input.txHash, hospitalUtxo.input.outputIndex)
    .requiredSignerHash(pubKeyHash)

    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();

  // Return unsigned transaction for external signing and submission
  return unsignedTx;
};
