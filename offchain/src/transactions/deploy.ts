import {
  applyParamsToScript,
  byteString,
  conStr0,
  PlutusScript,
  resolveScriptHash,
} from "@meshsdk/core";
import { resolvePlutusScriptAddress } from "@meshsdk/core-cst";
import validatorsPlutusScript from "../../plutus.json";

export function patient_script(
  admin_token: { policy: string; name: string },
  hospital_auth_policy: string,
  network: 1 | 0
) {
  const cbor = validatorsPlutusScript.validators.find(
    ({ title }) => title === "patients.patient_campaign.spend"
  )?.compiledCode;
  if (!cbor) {
    throw new Error("Patient registry compiled code not found");
  }
  const appliedParams = applyParamsToScript(
    cbor,
    [
      conStr0([byteString(admin_token.policy), byteString(admin_token.name)]),
      byteString(hospital_auth_policy),
    ],
    "JSON"
  );
  const script: PlutusScript = {
    code: appliedParams,
    version: "V3",
  };
  const policyId = resolveScriptHash(appliedParams, "V3");
  const script_Address = resolvePlutusScriptAddress(script, network);
  return {
    policyid: policyId,
    script_address: script_Address,
    cbor: appliedParams,
  };
}

export class Deploy {
  private network;
  constructor(network: 0 | 1) {
    this.network = network;
  }
  hospital_registry = async (admin_token: { policy: string; name: string }) => {
    const cbor = validatorsPlutusScript.validators.find(
      ({ title }) => title === "hospital.hospital_auth.mint"
    )?.compiledCode;
    if (!cbor) {
      throw new Error("Patient registry compiled code not found");
    }
    const appliedParams = applyParamsToScript(
      cbor,
      [conStr0([byteString(admin_token.policy), byteString(admin_token.name)])],
      "JSON"
    );
    const policyId = resolveScriptHash(appliedParams, "V3");
    return { hospital_policyid: policyId, cbor: appliedParams };
  };

  patient_registry = async (admin_token: { policy: string; name: string }) => {
    const { hospital_policyid } = await this.hospital_registry(admin_token);
    console.log("hospital_policyid", hospital_policyid);
    const { policyid, cbor, script_address } = patient_script(
      admin_token,
      hospital_policyid,
      this.network
    );
    return { policyid, cbor, script_address };
  };

  hospital_claim = async (admin_token: { policy: string; name: string }) => {
    const { hospital_policyid } = await this.hospital_registry(admin_token);
    const { script_address, cbor } = patient_script(
      admin_token,
      hospital_policyid,
      this.network
    );
    return { script_address, cbor };
  };
}
