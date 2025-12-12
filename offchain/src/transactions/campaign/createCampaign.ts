import { Deploy } from "../deploy";
import {
  bool,
  byteString,
  conStr0,
  MeshTxBuilder,
  stringToHex,
} from "@meshsdk/core";
import { provider, wallet } from "../../lib/utils";
import { admin_token } from "../../lib/config";

export const createCampaign = async (
  hospitalName: string,
  initialFunding: string = "2000000" // 2 ADA minimum
) => {
  const changeAddress = await wallet.getChangeAddress();
  const utxos = await wallet.getUtxos();

  const script = new Deploy(0);
  const { script_address } = await script.patient_registry(admin_token);

  const hospitalTokenName = hospitalName + "HOSPITAL";
  const hospitalTokenNameHex = stringToHex(hospitalTokenName);
  const campaignDatum = conStr0([byteString(hospitalTokenNameHex), bool(true)]);

  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });

  const unsignedTx = await txBuilder
    .txOut(script_address, [{ unit: "lovelace", quantity: initialFunding }])
    .txOutInlineDatumValue(campaignDatum, "JSON")
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await provider.submitTx(signedTx);

  return {
    txHash,
    campaignAddress: script_address,
    authorizedHospital: hospitalName,
    campaignActive: true,
    initialFunding,
  };
};
