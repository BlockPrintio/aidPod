import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import { useUser } from '../../hooks/useUser';

// Import all components
import ProfileHeader from './components/ProfileHeader';
import WalletSection from './components/WalletSection';
import TransactionHistory from './components/TransactionHistory';
import ProfileSettings from './components/ProfileSettings';
import ActivityHistory from './components/ActivityHistory';
import SecuritySettings from './components/SecuritySettings';
import RoleStats from './components/RoleStats';

const UserProfileWalletManagement = () => {
  const { user, isLoading, error } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletBalance, setWalletBalance] = useState(2547.85);

  // Redirect if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/user-registration-login" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Initialize default user data based on role
  const getUserData = () => {
    if (!user) return null;

    const baseUserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      bio: user.bio || '',
      location: user.location || '',
      joinDate: user.joinDate || new Date(),
      verificationStatus: 'unverified'
    };

    // Add role-specific data
    switch (user.role) {
      case 'hospital':
        return {
          ...baseUserData,
          verificationStatus: 'verified',
          verifierName: user.verifierName || 'Medical Board',
          verificationDate: user.verificationDate,
          institutionName: user.institutionName,
          licenseNumber: user.licenseNumber,
          specialty: user.specialty,
          stats: {
            campaignsVerified: user.stats?.campaignsVerified || 0,
            pendingReviews: user.stats?.pendingReviews || 0,
            trustScore: user.stats?.trustScore || 0,
            profileViews: user.stats?.profileViews || 0
          }
        };

      case 'patient':
        return {
          ...baseUserData,
          verificationStatus: user.verificationStatus || 'pending',
          emergencyContact: user.emergencyContact,
          medicalCondition: user.medicalCondition,
          stats: {
            campaignsCreated: user.stats?.campaignsCreated || 0,
            totalRaised: user.stats?.totalRaised || 0,
            trustScore: user.stats?.trustScore || 0,
            profileViews: user.stats?.profileViews || 0
          }
        };

      case 'donor':
        return {
          ...baseUserData,
          preferredCauses: user.preferredCauses || [],
          stats: {
            totalDonated: user.stats?.totalDonated || 0,
            campaignsSupported: user.stats?.campaignsSupported || 0,
            trustScore: user.stats?.trustScore || 0,
            profileViews: user.stats?.profileViews || 0
          }
        };

      default:
        return baseUserData;
    }
  };

  const userData = getUserData();

  // Mock wallet data
  const mockWallets = [
    {
      id: 'nami',
      name: 'Nami Wallet',
      address: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
      balance: 2547.85,
      isConnected: true,
      isPrimary: true,
      lastSync: new Date()
    },
    {
      id: 'eternl',
      name: 'Eternl Wallet',
      address: 'addr1q9rl8nkx8s5gr8u7t2n4k5m3p9q8w7e6r5t4y3u2i1o0p9q8w7e6r5t4y3u2i1o0p9q8w7e6r5t4y3u2i1o0p9q8w7e6r5',
      balance: 156.42,
      isConnected: true,
      isPrimary: false,
      lastSync: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  // Mock transaction data
  const mockTransactions = [
    {
      id: 'tx_001',
      type: 'donation',
      amount: 500,
      description: "Donation to Sarah\'s Cancer Treatment",
      campaignTitle: "Sarah\'s Cancer Treatment",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      txHash: '4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f'
    },
    {
      id: 'tx_002',
      type: 'refund',
      amount: 250,
      description: "Refund from cancelled campaign",
      campaignTitle: "Emergency Surgery Fund",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed',
      txHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f'
    },
    {
      id: 'tx_003',
      type: 'donation',
      amount: 1000,
      description: "Donation to Children\'s Heart Surgery",
      campaignTitle: "Children\'s Heart Surgery Fund",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'completed',
      txHash: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a'
    },
    {
      id: 'tx_004',
      type: 'deposit',
      amount: 2000,
      description: "Wallet deposit from exchange",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      txHash: '5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a'
    },
    {
      id: 'tx_005',
      type: 'withdrawal',
      amount: 300,
      description: "Withdrawal to external wallet",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      txHash: null
    }
  ];

  // Mock activity data
  const mockActivities = [
    {
      id: 'act_001',
      type: 'donation_made',
      title: "Donated to Sarah\'s Cancer Treatment",
      description: "Made a donation of 500 ADA to help with medical expenses",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      campaignTitle: "Sarah\'s Cancer Treatment",
      campaignImage: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      amount: 500,
      status: 'completed'
    },
    {
      id: 'act_002',
      type: 'campaign_followed',
      title: "Started following Children\'s Heart Surgery Fund",
      description: "Added campaign to your watchlist for updates",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      campaignTitle: "Children\'s Heart Surgery Fund",
      campaignImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"
    },
    {
      id: 'act_003',
      type: 'donation_made',
      title: "Donated to Emergency Surgery Fund",
      description: "Contributed 1000 ADA to urgent medical campaign",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      campaignTitle: "Emergency Surgery Fund",
      campaignImage: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop",
      amount: 1000,
      status: 'completed'
    },
    {
      id: 'act_004',
      type: 'comment_posted',
      title: "Posted a comment on Pediatric Care Campaign",
      description: "Shared encouragement and support for the family",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      campaignTitle: "Pediatric Care Campaign"
    },
    {
      id: 'act_005',
      type: 'refund_received',
      title: "Received refund from cancelled campaign",
      description: "Campaign was cancelled and funds were returned",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      campaignTitle: "Cancelled Medical Campaign",
      amount: 250,
      status: 'completed'
    }
  ];

  const tabs = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: 'User',
      description: 'Personal information and preferences'
    },
    {
      id: 'wallet',
      label: 'Wallet Management',
      icon: 'Wallet',
      description: 'Connected wallets and balances'
    },
    {
      id: 'transactions',
      label: 'Transaction History',
      icon: 'Receipt',
      description: 'All blockchain transactions'
    },
    {
      id: 'activity',
      label: 'Activity History',
      icon: 'Activity',
      description: 'Platform activity and interactions'
    },
    {
      id: 'security',
      label: 'Security Settings',
      icon: 'Shield',
      description: 'Password and authentication'
    }
  ];

  // Add role-specific tabs
  const getRoleSpecificTabs = () => {
    if (!user?.role) return [];
    
    const roleTabs = [];
    
    switch (user.role) {
      case 'patient':
        roleTabs.push(
          {
            id: 'campaigns',
            label: 'My Campaigns',
            icon: 'Target',
            description: 'Created campaigns and performance'
          },
          {
            id: 'documents',
            label: 'Medical Documents',
            icon: 'FileText',
            description: 'IPFS-stored medical records'
          }
        );
        break;
        
      case 'hospital':
        roleTabs.push(
          {
            id: 'verification',
            label: 'Verification History',
            icon: 'ShieldCheck',
            description: 'Campaigns verified and reviewed'
          },
          {
            id: 'credentials',
            label: 'Institution Credentials',
            icon: 'Award',
            description: 'Medical licenses and certifications'
          }
        );
        break;
        
      case 'donor':
        roleTabs.push(
          {
            id: 'portfolio',
            label: 'Donation Portfolio',
            icon: 'Heart',
            description: 'Supported campaigns and impact'
          }
        );
        break;
    }
    
    return roleTabs;
  };

  const allTabs = [...tabs, ...getRoleSpecificTabs()];

  const handleWalletConnect = async (walletId) => {
    // Mock wallet connection
    console.log('Connecting wallet:', walletId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleWalletDisconnect = async (walletId) => {
    // Mock wallet disconnection
    console.log('Disconnecting wallet:', walletId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleWalletSwitch = async (walletId) => {
    // Mock wallet switching
    console.log('Switching to wallet:', walletId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleProfileUpdate = async (formData) => {
    // Mock profile update
    console.log('Updating profile:', formData);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleSecurityUpdate = async (securityData) => {
    // Mock security update
    console.log('Updating security:', securityData);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleEditProfile = () => {
    setActiveTab('profile');
  };

  const handleUploadAvatar = async (file) => {
    // Mock avatar upload
    console.log('Uploading avatar:', file);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSettings
            user={userData}
            onUpdateProfile={handleProfileUpdate}
          />
        );
      case 'wallet':
        return (
          <WalletSection
            wallets={mockWallets}
            onConnectWallet={handleWalletConnect}
            onDisconnectWallet={handleWalletDisconnect}
            onSwitchWallet={handleWalletSwitch}
          />
        );
      case 'transactions':
        return (
          <TransactionHistory
            transactions={mockTransactions}
          />
        );
      case 'activity':
        return (
          <ActivityHistory
            activities={mockActivities}
            userRole={userRole}
          />
        );
      case 'security':
        return (
          <SecuritySettings
            user={mockUser}
            onUpdateSecurity={handleSecurityUpdate}
          />
        );
      case 'campaigns':
        return (
          <div className="bg-card border border-border rounded-medical p-8 text-center">
            <Icon name="Target" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Campaign Management</h3>
            <p className="text-muted-foreground mb-4">
              View and manage your medical fundraising campaigns
            </p>
            <Link to="/patient-campaign-creation">
              <Button iconName="Plus" iconPosition="left">
                Create New Campaign
              </Button>
            </Link>
          </div>
        );
      case 'documents':
        return (
          <div className="bg-card border border-border rounded-medical p-8 text-center">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Medical Documents</h3>
            <p className="text-muted-foreground mb-4">
              Securely stored medical records and documentation
            </p>
            <Button iconName="Upload" iconPosition="left">
              Upload Document
            </Button>
          </div>
        );
      case 'verification':
        return (
          <div className="bg-card border border-border rounded-medical p-8 text-center">
            <Icon name="ShieldCheck" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Verification History</h3>
            <p className="text-muted-foreground mb-4">
              Track campaigns you've verified and reviewed
            </p>
            <Link to="/hospital-verification-dashboard">
              <Button iconName="Eye" iconPosition="left">
                View Pending Verifications
              </Button>
            </Link>
          </div>
        );
      case 'credentials':
        return (
          <div className="bg-card border border-border rounded-medical p-8 text-center">
            <Icon name="Award" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Institution Credentials</h3>
            <p className="text-muted-foreground mb-4">
              Manage your medical licenses and certifications
            </p>
            <Button iconName="Plus" iconPosition="left">
              Add Credential
            </Button>
          </div>
        );
      case 'portfolio':
        return (
          <div className="bg-card border border-border rounded-medical p-8 text-center">
            <Icon name="Heart" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Donation Portfolio</h3>
            <p className="text-muted-foreground mb-4">
              Track your impact and supported campaigns
            </p>
            <Link to="/campaign-discovery-dashboard">
              <Button iconName="Search" iconPosition="left">
                Discover Campaigns
              </Button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole={user?.role}
        isAuthenticated={true}
        walletConnected={walletConnected}
        walletBalance={walletBalance}
        onWalletConnect={() => setWalletConnected(true)}
        onLogout={() => window.location.href = '/user-registration-login'}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <ProfileHeader
            user={userData}
            onEditProfile={handleEditProfile}
            onUploadAvatar={handleUploadAvatar}
          />
          <RoleStats user={userData} />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {allTabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon
                    name={tab?.icon}
                    size={18}
                    className={`mr-2 ${
                      activeTab === tab?.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <div className="text-left">
                    <div>{tab?.label}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {tab?.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfileWalletManagement;