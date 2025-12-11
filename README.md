# AidPod: Decentralized Med- Mobile-responsive design

## 🔄 How It Works

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

### Frontend & Integration
- **React 18** - Modern frontend framework
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **MeshJS SDK** - Cardano blockchain integration
- **React Router** - Application routing
- **Lucide Icons** - Icon system
- **Framer Motion** - Animation library
- **Zustand** - State management

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

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:4028`

4. Build for production:
   ```bash
   npm run build
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

### 2. Frontend Application
```
src/
├── app.jsx            # Main application component
├── index.jsx         # Entry point
├── Routes.jsx        # Route definitions
├── auth/             # Authentication logic
├── components/       # Reusable UI components 
│   ├── ui/          # Base UI components
│   └── routing/     # Routing components
├── pages/           # Page components
│   ├── campaign-details-donation/
│   ├── campaign-discovery-dashboard/
│   ├── hospital-verification-dashboard/
│   ├── patient-campaign-creation/
│   ├── user-profile-wallet-management/
│   └── user-registration-login/
├── state/           # Application state management
├── styles/          # CSS and Tailwind styles
└── utils/           # Utility functions

public/              # Static assets
└── assets/
    └── images/

# Configuration files
├── package.json     # Dependencies and scripts
├── tailwind.config.js
├── vite.config.mjs
└── postcss.config.js
```




## 🔐 On-chain Validator Details

### Data Structures

The smart contract uses the following core data structures:

```aiken
pub type MedicalCampaignDatum {
  campaign_id: Int,
  title: ByteArray,
  description: ByteArray,
  total_goal: Int,
  creator: VerificationKeyHash,
  beneficiary: VerificationKeyHash,
  medical_authority: VerificationKeyHash,
  current_funds: Int,
  total_claimed: Int,
  deadline: Int,
  status: CampaignStatus,
  milestones: List<FundingMilestone>,
  min_contribution: Int,
  verification_required: Bool,
  emergency_contact: VerificationKeyHash,
  created_at: Int,
  last_updated: Int,
}

pub type MedicalAction {
  CreateCampaign
  ContributeFunds { amount: Int, contributor: VerificationKeyHash }
  ClaimMilestoneFunds { milestone_percentage: Int }
  RefundContributor { contributor: VerificationKeyHash, amount: Int }
  PauseCampaign
  ResumeCampaign
  CancelCampaign
  CompleteCampaign
}
```

### Key Security Features

1. **Multi-Signature Requirements**
   - Campaign creation requires creator signature
   - Optional medical authority verification
   - Emergency contacts for risk management

2. **Fund Protection**
   - Milestone-based release (25%, 50%, 75%, 100%)
   - Medical authority verification for claims
   - Minimum time between claims (7 days)

3. **Contribution Controls**
   - Minimum contribution limits
   - Maximum single contribution (50% of goal)
   - Active status verification

### Testing

The validator includes comprehensive property tests covering:
- Campaign creation scenarios
- Contribution validations
- Milestone claims
- Refund mechanisms
- Status changes
- Error conditions

Run tests with:
```bash
cd onchain/aidpod_cf
aiken check
```

## 🧩 Application Routes

The application uses React Router for navigation. Main routes are defined in `Routes.jsx`:

- `/` - Campaign Discovery Dashboard
- `/campaign-details-donation/:id` - Campaign Details & Donation Interface
- `/hospital-verification-dashboard` - Hospital Verification Dashboard
- `/patient-campaign-creation` - Campaign Creation Interface
- `/user-profile-wallet-management` - User Profile & Wallet Management
- `/user-registration-login` - User Registration & Login

Protected routes require authentication and specific user roles:
```jsx
<ProtectedRoute 
  path="/patient-campaign-creation" 
  element={<PatientCampaignCreation />} 
  roles={['patient']} 
/>
```

Error handling routes:
- `/not-found` - 404 Page
- `/not-authorized` - 403 Page

## 🎨 Styling & UI

The project uses TailwindCSS with a custom configuration for consistent design:

### Tailwind Plugins
- `@tailwindcss/forms` - Enhanced form styling
- `@tailwindcss/typography` - Rich text content styling
- `@tailwindcss/aspect-ratio` - Responsive aspect ratios
- `@tailwindcss/container-queries` - Container-based responsive design
- `tailwindcss-fluid-type` - Fluid typography scaling
- `tailwindcss-animate` - Animation utilities
- `tailwindcss-elevation` - Material elevation utilities

### Design System
- Custom color scheme with semantic naming
- Medical-specific spacing scale
- Consistent border radius system
- Responsive typography scale
- Component-specific animations
- Dark mode support

### Components
The UI components are built with accessibility and reusability in mind:
- `Button` - Configurable button variations
- `Input` - Form input components
- `Select` - Custom select components
- `CampaignProgressIndicator` - Campaign progress visualization
- `VerificationStatusBadge` - Status indicators
- `WalletConnectionIndicator` - Wallet connection status

## � Implementation Status

### Completed Features

1. **Smart Contract (On-chain)**
   - ✅ Complete validator implementation in Aiken
   - ✅ Comprehensive property-based test suite
   - ✅ Campaign state management logic
   - ✅ Milestone and fund distribution rules
   - ✅ Multi-signature security validations

2. **Frontend & Wallet Integration**
   - ✅ Successful wallet connection with MeshJS
   - ✅ Campaign creation interface
   - ✅ Milestone tracking UI
   - ✅ Wallet state management
   - ✅ Basic error handling

### Critical Limitations

1. **Transaction Building Challenges**
   - ❌ Unable to build working validator transactions
   - ❌ Script address integration issues
   - ❌ Complex datum serialization problems
   - ❌ UTXO management with validator not working
   - ❌ Multi-signature transaction coordination fails

2. **Integration Barriers**
   - ❌ Cannot interact with  validator
   - ❌ Script address derivation issues
   - ❌ Campaign state updates not possible
   - ❌ Milestone claiming not implemented
   - ❌ Refund mechanism not working

### Next Steps

1. **Priority Fixes**
   - Research and fix transaction building issues
   - Implement proper script address handling
   - Develop working UTXO management strategy
   - Test complete transaction lifecycle
   - Improve error handling and recovery

2. **Future Improvements**
   - Add transaction monitoring
   - Enhance state management
   - Implement proper error recovery
   - Add transaction queue management
   - Improve user feedback mechanisms


