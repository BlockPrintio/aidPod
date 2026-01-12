import { conStr0, MeshTxBuilder, none, IWallet } from "@meshsdk/core";
import { provider, admin_token } from "../config";
import { Deploy } from "../deploy";

export const donateToCampaign = async (
  donationAmount: string,
  wallet: IWallet
) => {
  const changeAddress = await wallet.getChangeAddress();
  const utxos = await wallet.getUtxos();
  const collateral = (await wallet.getCollateral())[0];
  const txBuilder = new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });
  const script = new Deploy(0);
  const { script_address } = await script.patient_registry(admin_token);

  const unsignedTx = await txBuilder
    .txOut(script_address, [{ unit: "lovelace", quantity: donationAmount }])
    .txOutInlineDatumValue(conStr0([none()]), "JSON")

    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
    .complete();


  return unsignedTx;
};
