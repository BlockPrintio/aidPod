
1. **Campaign Creation**
   - Patient registers and connects their Cardano wallet
   - Creates a campaign with medical documentation
   - Selects their treating hospital for verification
   - Sets funding goals and milestone requirements

2. **Hospital Verification**
   - Hospital reviews medical documentation
   - Verifies treatment costs and timeline
   - Approves campaign through multi-signature transaction
   - Monitors treatment progress for milestone releases

3. **Donor Contribution**
   - Donors browse verified campaigns
   - Connect their Cardano wallets
   - Make contributions in ADA
   - Receive transaction confirmations and updates

4. **Fund Distribution**
   - Funds are locked in the smart contract
   - Released in milestones (25%, 50%, 75%, 100%)
   - Each release requires hospital verification
   - Automatic refunds if campaign is cancelled

5. **Campaign Monitoring**
   - Real-time tracking of contributions
   - Milestone completion updates
   - Hospital verification status
   - Treatment progress updates

## 🔐 Smart Contract Featuresl Crowdfunding on Cardano

AidPod is a decentralized application (dApp) built on the Cardano blockchain that enables transparent and secure medical crowdfunding. By leveraging blockchain technology and smart contracts, AidPod creates a trustworthy platform where patients can raise funds for medical treatments with verified hospital oversight.

## 🌟 Key Features

- **Verified Medical Campaigns**
  - Hospital-verified medical conditions and cost estimates
  - Transparent fund usage through milestone-based releases
  - Real-time tracking of campaign progress

- **Secure Fund Management**
  - Smart contract-enforced fund distribution
  - Milestone-based fund releases with hospital verification
  - Automatic refund mechanism for unsuccessful campaigns
  - Multi-signature security for critical operations

- **Role-Based System**
  - Patients: Create and manage medical campaigns
  - Hospitals: Verify medical conditions and approve fund releases
  - Donors: Contribute to campaigns with full transparency


- **User-Friendly Interface**
  - Intuitive campaign creation and management
  - Real-time campaign discovery dashboard
  - Integrated wallet management
  - Mobile-responsive design

## � Smart Contract Features

### Core Validator Functionality
- **Campaign Creation & Verification**
  - Medical authority verification
  - Milestone-based fund distribution
  - Parameter validation and security checks

- **Fund Management**
  - Secure contribution handling
  - Milestone-based fund release
  - Automatic refund mechanisms
  - Multi-signature requirements

- **Campaign Control**
  - Status management (Active/Paused/Completed/Cancelled)
  - Emergency intervention capabilities
  - Medical authority oversight

### Validator Security
- Multi-signature transaction requirements
- Medical authority verification
- Time-gated milestone claims
- Contribution limits and validations
- Emergency control mechanisms

## 🚀 Technical Stack

### On-chain (Smart Contract)
- **Aiken Language** - Type-safe Cardano validator development
- **Plutus V3** - Advanced script capabilities
- **Property Testing** - Comprehensive test suite for all validator functions
- **Vodka** - Additional Aiken dependencies for advanced functionality



## 📋 Prerequisites

- Node.js (v18.x or higher)
- npm or yarn
- Cardano development environment
- Aiken CLI (for smart contract development)

## 🛠️ Installation & Development

1. Clone the repository and install dependencies:
   ```bash
   git clone [repository-url]
   cd aidpod
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Create a .env file with the following
   VITE_BLOCKFROST_PROJECT_ID=[your-blockfrost-id]
   VITE_CAMPAIGN_SCRIPT_ADDRESS=[validator-script-address]
   ```





### Smart Contract Development

1. Navigate to the validator directory:
   ```bash
   cd onchain/aidpod_cf
   ```

2. Run the test suite:
   ```bash
   aiken check
   ```

3. Build the validator:
   ```bash
   aiken build
   ```

## 📁 Project Structure

The project is organized into two main parts:

### 1. Smart Contract (Onchain)
```
onchain/
└── aidpod_cf/           # Medical Crowdfunding Validator
    ├── aiken.lock       # Lock file for dependencies
    ├── aiken.toml      # Project configuration
    ├── plutus.json     # Compiled Plutus contract
    ├── README.md       # Contract documentation
    ├── build/          # Build artifacts
    ├── validators/     # Aiken Validator Scripts
    │   └── cf.ak      # Main Campaign Validator
    ├── lib/           # Supporting libraries
    └── test/          # Contract tests
```