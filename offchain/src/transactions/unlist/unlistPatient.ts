import { Deploy } from "../deploy";
import { admin_token } from "../../lib/config";
import { mConStr0, MeshTxBuilder, stringToHex } from "@meshsdk/core";
import { provider, wallet } from "../../lib/utils";

/**
 * Burn a patient authentication token
 * Anyone can burn their own tokens
 */
export const burnPatientToken = async (patientName: string) => {
    const changeAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];
  
    const script = new Deploy(0);
    const { policyid, cbor } = await script.patient_registry(admin_token);
  
    const tokenName = stringToHex(patientName + "PATIENT");
    const asset = policyid + tokenName;
  
    const tokenUtxo = utxos.find((utxo) =>
      utxo.output.amount.some((a) => a.unit === asset)
    );
  
    if (!tokenUtxo) {
      throw new Error(`Patient token not found: ${asset}`);
    }
  
    // BurnAuth redeemer (no parameters)
    const redeemer = mConStr0([]);
  
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      submitter: provider,
    });
  
    const unsignedTx = await txBuilder
      .mintPlutusScriptV3()
      .mint("-1", policyid, tokenName)
      .mintingScript(cbor)
      .mintRedeemerValue(redeemer, "Mesh")
  
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
  
    return txHash;
  };