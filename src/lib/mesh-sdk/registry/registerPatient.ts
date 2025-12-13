import { Deploy } from "../deploy";
import { admin_token } from "../config";
import { mConStr0, MeshTxBuilder, stringToHex, IWallet } from "@meshsdk/core";
import { provider } from "../config";

/**
 * Register a new patient by minting a patient authentication token
 *
 * Validator checks:
 * 1. Admin token must be present in transaction inputs
 * 2. Admin token must be in a wallet (not script)
 * 3. Exactly one token must be minted
 * 4. Token name must match pattern: {patient_name}PATIENT
 */
export const registerPatient = async (patientName: string, wallet: IWallet) => {
  const changeAddress = await wallet?.getChangeAddress();
  const utxos = await wallet?.getUtxos();
  const collateral = (await wallet.getCollateral())[0];

  const script = new Deploy(0);
  const { policyid, cbor } = await script.patient_registry(admin_token);

  const tokenName = stringToHex(patientName + "PATIENT");
  const asset = policyid + tokenName;
  const patientNameHex = stringToHex(patientName);
  const redeemer = mConStr0([patientNameHex]);
  const adminUtxo = utxos.find((utxo) =>
    utxo.output.amount.some(
      (a) => a.unit === admin_token.policy + admin_token.name
    )
  );

  if (!adminUtxo) {
    throw new Error(
      `Admin token not found in wallet. Required: ${admin_token.policy}${admin_token.name}`
    );
  }

  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });

  const unsignedTx = await txBuilder
    .txIn(adminUtxo.input.txHash, adminUtxo.input.outputIndex)
    .mintPlutusScriptV3()
    .mint("1", policyid, tokenName)
    .mintingScript(cbor)
    .mintRedeemerValue(redeemer, "Mesh")
    .txOut(changeAddress, [{ unit: asset, quantity: "1" }])
    .changeAddress(changeAddress)
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
    .selectUtxosFrom(utxos)

    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await provider.submitTx(signedTx);

  return {
    txHash,
    policyId: policyid,
    tokenName: patientName + "PATIENT",
    asset,
  };
};
