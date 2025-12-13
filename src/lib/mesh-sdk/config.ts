import { BlockfrostProvider, stringToHex } from "@meshsdk/core"

const admin_token_policy = "a8d770ae253e4818feb0a5f55dc29d85d86061feee7cc31347276322"
const admin_token_name = stringToHex("aidPod-admin")
export const admin_token = {
    policy: admin_token_policy,
    name: admin_token_name
};


export const provider = new BlockfrostProvider("preprodYAw21nxr9EdeZNSLDDLOJVg98DOrya75");