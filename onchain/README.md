
# AidPod - Decentralized Healthcare Fundraising
📋 Overview
AidPod is a Cardano smart contract system that enables patients to create fundraising campaigns that can only be claimed by authorized hospitals. The system uses NFT-based authentication tokens for hospitals and patients.

## 🏗️ Architecture
Components

Hospital Authentication - NFT tokens proving hospital identity
Patient Authentication - NFT tokens for patient registration
Campaign System - Script-locked funds claimable by authorized hospitals

Token Naming Convention
Hospital Token: {HospitalName}HOSPITAL
Patient Token:  {PatientName}PATIENT

Examples:
- StJohnsHOSPITAL
- MayoHOSPITAL
- EmmanuelPATIENT

## 📜 On-Chain Validators
1. Hospital Authentication Minting Policy
Purpose: Mint/burn hospital authentication tokens
Parameters:

admin_token: AssetClass (admin authorization)

Redeemers:
aikenMintAuth { hospital_name: ByteArray }  // Mint hospital token
BurnAuth                                // Burn hospital token
Validation Rules:

✅ Admin token must be in wallet input
✅ Exactly 1 token minted per transaction
✅ Token name: {hospital_name}HOSPITAL
✅ Anyone can burn tokens


2. Patient Authentication Minting Policy
Purpose: Mint/burn patient authentication tokens
Parameters:

admin_token: AssetClass (admin authorization)

Redeemers:
aikenMintAuth { patient_name: ByteArray }  // Mint patient token
BurnAuth                               // Burn patient token
Validation Rules:

✅ Admin token must be in wallet input
✅ Exactly 1 token minted per transaction
✅ Token name: {patient_name}PATIENT
✅ Anyone can burn tokens


3. Campaign Spend Validator
Purpose: Lock funds for authorized hospital claims
Parameters:

admin_token: AssetClass (admin authorization)
hospital_auth_policy: ByteArray (hospital token policy ID)

Datum:
aikenCampaignDatum {
  authorized_hospital: ByteArray,  // Hospital token name
  campaign_active: Bool            // Campaign status
}
Redeemer:
aikenClaimByHospital  // Hospital claims funds
Validation Rules:

✅ Marker UTxO with datum must be in inputs
✅ Marker must be at same script address
✅ Campaign must be active
✅ Hospital must have matching auth token in wallet
✅ Hospital wallet must sign transaction