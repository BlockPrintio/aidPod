# AidPod - Decentralized Healthcare Fundraising
📋 Overview
AidPod is a Cardano smart contract system that enables patients to create fundraising campaigns that can only be claimed by authorized hospitals. The system uses NFT-based authentication tokens for hospitals and patients.

## 🏗️ Architecture
Components

Hospital Authentication - NFT tokens proving hospital identity
Patient Authentication - NFT tokens for patient registration
Campaign System - Script-locked funds claimable by authorized hospitals

to read about onchain validators
to read about offchain code with Mesh

## 🎯 Key Features
✅ Security

Token-based Authorization - Only authorized hospitals can claim
Signature Required - Hospital must sign transactions
Active Status - Campaigns can be activated/deactivated
Admin Control - Admin can mint authentication tokens

✅ Flexibility

Multiple Donations - Accept unlimited donations
Partial Claims - Hospital can claim specific UTxOs
No Time Locks - Funds available when needed
Independent Campaigns - Each patient has unique campaign

✅ Transparency

On-Chain Verification - All transactions public
NFT Authentication - Provable hospital/patient identity
Immutable Records - Campaign history preserved


📊 Data Structures
Campaign Datum
typescript{
  authorized_hospital: "StJohnsHOSPITAL",  // ByteArray in hex
  campaign_active: true                     // Boolean (1 or 0)
}
AssetClass
typescript{
  policy: "aabbcc...",  // Policy ID (ByteArray)
  name: "ADMIN"         // Token name (ByteArray)
}

🔧 Error Handling
Common Errors
Admin token not found:
Error: Admin token not found in wallet
Solution: Ensure wallet has admin token
Hospital token not found:
Error: Hospital auth token not found: ddeeff...StJohnsHOSPITAL
Solution: Hospital must be registered first
Campaign marker not found:
Error: Campaign marker UTxO not found
Solution: Ensure campaign was created correctly
Missing redeemers:
Error: MissingRedeemers
Solution: Check redeemer attachment (no "Mesh" parameter)

📝 Testing
Run Aiken Tests
bashaiken check
Test Coverage:

✅ Hospital token minting/burning (10 tests)
✅ Patient token minting/burning (13 tests)
✅ Campaign claiming (11 tests)
✅ Multiple donations (1 test)
✅ Partial claims (1 test)


🚀 Deployment Checklist

✅ Deploy hospital authentication policy
✅ Deploy patient authentication policy
✅ Deploy campaign spend validator
✅ Register initial hospitals
✅ Test end-to-end flow
✅ Monitor transactions


📚 Additional Resources
Policy IDs (Example - Preprod)
Admin Auth token policy: [a8d770ae253e4818feb0a5f55dc29d85d86061feee7cc31347276322](https://preprod.cardanoscan.io/tokenPolicy/a8d770ae253e4818feb0a5f55dc29d85d86061feee7cc31347276322)

Contract Hashes
- hospital_auth.mint:      [8d6448c1...](https://preprod.cardanoscan.io/transaction/8d6448c1)
- patient_campaign.spend:  [36d7bcb8...](https://preprod.cardanoscan.io/transaction/36d7bcb8)
- patient_campaign.mint:   [36d7bcb8...](https://preprod.cardanoscan.io/transaction/36d7bcb8)

Example Transactions & Addresses
- Sample Claim Transaction: [efedbe9e4b8ddfb473b75f492f86a6fedb6e9165d19eb188fee60211d5286e36](https://preprod.cardanoscan.io/transaction/efedbe9e4b8ddfb473b75f492f86a6fedb6e9165d19eb188fee60211d5286e36)
- Campaign Address: [addr_test1wz9jfvnprkxl6szkszch0gadmqllfrw5gl2p667d89ck28cetsw3w](https://preprod.cardanoscan.io/address/addr_test1wz9jfvnprkxl6szkszch0gadmqllfrw5gl2p667d89ck28cetsw3w)

💡 Best Practices

Always verify hospital tokens before campaign creation
Use unique names for hospitals and patients
Include sufficient ADA in campaign creation (≥2 ADA)
Monitor campaign address for donations
Batch claims for gas efficiency when possible
Keep admin token secure - controls all minting


🔐 Security Considerations

Admin token holder has full control over authentication
Hospital tokens should be distributed carefully
Campaign datum determines authorized hospital
Once active, campaigns cannot change authorized hospital
Always verify script addresses before sending funds


📞 Support
For issues or questions:

Review error messages carefully
Check all prerequisites are met
Verify all tokens are present
Ensure sufficient collateral for script execution.


Built with Aiken & MeshJS on Cardano 🚀