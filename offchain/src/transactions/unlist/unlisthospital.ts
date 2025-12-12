import { Deploy } from "../deploy";
import { admin_token } from "../../lib/config";
import { mConStr0, MeshTxBuilder, stringToHex } from "@meshsdk/core";
import { provider, wallet } from "../../lib/utils";

/**
 * Burn a hospital authentication token
 * Anyone can burn their own tokens
 */
export const burnHospitalToken = async (hospitalName: string) => {
  const changeAddress = await wallet.getChangeAddress();
  const utxos = await wallet.getUtxos();
  const collateral = (await wallet.getCollateral())[0];

  const script = new Deploy(0);
  const { hospital_policyid, cbor } = await script.hospital_registry(admin_token);

  const tokenName = stringToHex(hospitalName + "HOSPITAL");
  const asset = hospital_policyid + tokenName;

  // Find UTxO with the hospital token to burn
  const tokenUtxo = utxos.find((utxo) =>
    utxo.output.amount.some((a) => a.unit === asset)
  );

  if (!tokenUtxo) {
    throw new Error(`Hospital token not found: ${asset}`);
  }

  // BurnAuth redeemer (no parameters)
  const redeemer = mConStr0([]);

  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });

  const unsignedTx = await txBuilder
    // Burn the hospital token (negative amount)
    .mintPlutusScriptV3()
    .mint("-1", hospital_policyid, tokenName)
    .mintingScript(cbor)
    .mintRedeemerValue(redeemer, "Mesh")

    // Include the UTxO with the token to burn
    .txIn(
      tokenUtxo.input.txHash,
      tokenUtxo.input.outputIndex,
      tokenUtxo.output.amount,
      tokenUtxo.output.address
    )

    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await provider.submitTx(signedTx);

  console.log("Hospital token burned successfully!");
  console.log("Transaction hash:", txHash);

  return txHash;
};

/**
 * Register a new patient by minting a patient authentication token
 * 
 * Validator checks:
 * 1. Admin token must be present in transaction inputs
 * 2. Admin token must be in a wallet (not script)
 * 3. Exactly one token must be minted
 * 4. Token name must match pattern: {patient_name}PATIENT
 */
export const registerPatient = async (patientName: string) => {
  const changeAddress = await wallet.getChangeAddress();
  const utxos = await wallet.getUtxos();
  const collateral = (await wallet.getCollateral())[0];

  // Get the patient campaign validator script
  const script = new Deploy(0);
  const { policyid, cbor } = await script.patient_registry(admin_token);

  // Construct token name: {patient_name}PATIENT
  // Example: "Emmanuel" -> "EmmanuelPATIENT"
  const tokenName = stringToHex(patientName + "PATIENT");
  const asset = policyid + tokenName;

  // Build redeemer: MintAuth { patient_name: "Emmanuel" }
  // The patient_name is just "Emmanuel" (without "PATIENT" suffix)
  const patientNameHex = stringToHex(patientName);
  const redeemer = mConStr0([patientNameHex]);

  // CRITICAL: Find UTxO with admin token
  // The validator requires admin token to be present in inputs
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
    // Mint the patient token
    .mintPlutusScriptV3()
    .mint("-1", policyid, tokenName)
    .mintingScript(cbor)
    .mintRedeemerValue(redeemer, "Mesh")

    // CRITICAL: Include the admin token UTxO as input
    // This satisfies the validator's requirement
    .txIn(
      adminUtxo.input.txHash,
      adminUtxo.input.outputIndex,
      adminUtxo.output.amount,
      adminUtxo.output.address
    )

    // Send the minted patient token to change address
    .txOut(changeAddress, [{ unit: asset, quantity: "1" }])

    // Return admin token to change address
    .changeAddress(changeAddress)

    // Collateral for script execution
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)

    // Select remaining UTxOs for fees
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

