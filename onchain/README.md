<div align="center">

# 🏥 AidPod - Decentralized Healthcare Fundraising

**Empowering Transparent Healthcare Funding on Cardano**

[![Cardano](https://img.shields.io/badge/Cardano-Smart_Contract-blue?style=flat-square&logo=cardano)](https://cardano.org)
[![Aiken](https://img.shields.io/badge/Built_with-Aiken-orange?style=flat-square)](https://aiken-lang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Overview

**AidPod** is a revolutionary Cardano smart contract system that enables patients to create transparent fundraising campaigns with milestone-based fund releases to authorized hospitals. Built with security and accountability at its core, AidPod leverages NFT-based authentication to ensure only verified healthcare providers can access campaign funds.

### ✨ Key Features

- 🔐 **NFT-Based Authentication** - Secure hospital and patient identity verification
- 💰 **Milestone Fund Releases** - Incremental fund distribution based on treatment progress
- 🛡️ **On-Chain Security** - Trustless validation through Cardano smart contracts
- 🏥 **Hospital Authorization** - Only verified hospitals can claim campaign funds
- 📊 **Transparent Tracking** - Complete on-chain audit trail for all transactions

---

## 🏗️ Architecture

### Core Components

| Component | Description | Token Type |
|-----------|-------------|------------|
| 🏥 **Hospital Authentication** | NFT tokens proving hospital identity | `{HospitalName}HOSPITAL` |
| 👤 **Patient Authentication** | NFT tokens for patient registration | `{PatientName}PATIENT` |
| 💼 **Campaign System** | Script-locked funds with milestone releases | Smart Contract UTxO |

### 🏷️ Token Naming Convention

Authentication tokens follow a strict naming pattern to ensure uniqueness and clarity:

```
Hospital Token Format: {HospitalName}HOSPITAL
Patient Token Format:  {PatientName}PATIENT
```

**Examples:**
- `StJohnsHOSPITAL` - St. John's Hospital authentication token
- `MayoHOSPITAL` - Mayo Clinic authentication token
- `EmmanuelPATIENT` - Patient Emmanuel's authentication token

---

## 📜 On-Chain Validators

### 1️⃣ Hospital Authentication Minting Policy

**Purpose:** Mint and burn hospital authentication tokens

#### Parameters

```aiken
admin_token: AssetClass  -- Admin authorization token
```

#### Redeemers

```aiken
MintAuth { hospital_name: ByteArray }  -- Mint hospital token
BurnAuth                               -- Burn hospital token
```

#### ✅ Validation Rules

- ✔️ Admin token must be present in wallet inputs
- ✔️ Exactly **1 token** minted per transaction
- ✔️ Token name must follow format: `{hospital_name}HOSPITAL`
- ✔️ Anyone can burn tokens (permissionless burning)

---

### 2️⃣ Patient Authentication Minting Policy

**Purpose:** Mint and burn patient authentication tokens

#### Parameters

```aiken
admin_token: AssetClass  -- Admin authorization token
```

#### Redeemers

```aiken
MintAuth { patient_name: ByteArray }  -- Mint patient token
BurnAuth                              -- Burn patient token
```

#### ✅ Validation Rules

- ✔️ Admin token must be present in wallet inputs
- ✔️ Exactly **1 token** minted per transaction
- ✔️ Token name must follow format: `{patient_name}PATIENT`
- ✔️ Anyone can burn tokens (permissionless burning)

---

### 3️⃣ Campaign Spend Validator

**Purpose:** Lock funds for authorized hospital claims with milestone-based releases

#### Parameters

```aiken
admin_token: AssetClass           -- Admin authorization token
hospital_auth_policy: ByteArray   -- Hospital token policy ID
```

#### Datum Structure

```aiken
CampaignDatum {
  authorized_hospital: ByteArray,  -- Hospital token name
  campaign_active: Bool,           -- Campaign status
  total_milestones: Int,           -- Total number of milestones
  milestones_claimed: Int,         -- Number of milestones already claimed
  milestone_amount: Int            -- Amount per milestone in lovelace
}
```

#### Redeemer

```aiken
ClaimByHospital  -- Hospital claims funds for next milestone
```

#### ✅ Validation Rules

- ✔️ Marker UTxO with datum must be in transaction inputs
- ✔️ Marker must be located at same script address
- ✔️ Campaign must be **active** (`campaign_active = True`)
- ✔️ Hospital must possess matching authentication token
- ✔️ Hospital wallet must sign the transaction
- ✔️ `milestones_claimed < total_milestones` (milestones remaining)
- ✔️ Claimed amount must equal exactly `milestone_amount`
- ✔️ Datum must be updated with incremented `milestones_claimed`

---

## 🎯 Milestone Claim Process

The milestone-based fund release system ensures transparency and accountability:

```mermaid
graph LR
    A[Campaign Created] --> B[Milestone 1 Claimed]
    B --> C[Datum Updated]
    C --> D[Milestone 2 Claimed]
    D --> E[Datum Updated]
    E --> F[...]
    F --> G[Final Milestone]
    G --> H[Campaign Completed]
    
    style A fill:#e1f5ff
    style H fill:#d4edda
    style B fill:#fff3cd
    style D fill:#fff3cd
    style G fill:#fff3cd
```

### 📌 How It Works

1. 🎬 **Campaign Initialization** - Patient creates campaign with defined milestones
2. 💰 **Incremental Claims** - Hospital claims one milestone at a time
3. 📝 **Automatic Tracking** - Datum updates after each successful claim
4. 🔄 **Progressive Release** - Funds released as treatment progresses
5. 🛡️ **Over-Claim Protection** - Smart contract prevents claiming beyond allocated amounts
6. ✅ **Campaign Completion** - Remains active until all milestones are claimed

### 🔑 Key Benefits

- **Transparency:** Every fund release is recorded on-chain
- **Accountability:** Hospitals must complete milestones to receive funds
- **Security:** Smart contract enforces all validation rules
- **Flexibility:** Customizable milestone structure per campaign
- **Trust:** Donors can track exactly how funds are being used

---

## 🚀 Getting Started

### Prerequisites

- [Aiken](https://aiken-lang.org) - Smart contract language
- [Cardano Node](https://docs.cardano.org/getting-started/installing-the-cardano-node) - Blockchain interaction
- Basic understanding of Cardano UTxO model

### Building the Contracts

```bash
# Build all validators
aiken build

# Run tests
aiken check

# Generate blueprints
aiken blueprint
```

---

## 📖 Documentation

For detailed implementation guides and API references, please refer to:

- [Aiken Documentation](https://aiken-lang.org/docs)
- [Cardano Developer Portal](https://developers.cardano.org)

---

## 🤝 Contributing

We welcome contributions from the community! Please feel free to submit issues, fork the repository, and create pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for transparent healthcare funding**

[Report Bug](https://github.com/yourusername/aidpod/issues) · [Request Feature](https://github.com/yourusername/aidpod/issues) · [Documentation](https://github.com/yourusername/aidpod/wiki)

</div>
