import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useWallet } from '@meshsdk/react';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Image from '../../components/AppImage';
import CampaignHero from './components/CampaignHero';
import CampaignTabs from './components/CampaignTabs';
import DonationInterface from './components/DonationInterface';
import CampaignTimeline from './components/CampaignTimeline';
import DonorComments from './components/DonorComments';
import SocialSharing from './components/SocialSharing';
import { donateToCampaign } from '../../lib/mesh-sdk/campaign';
import { campaignStorage } from '../../lib/storage/campaign-storage';
import { adaToLovelace } from '../../lib/datum-helpers';

const CampaignDetailsAndDonation = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationError, setDonationError] = useState(null);
  const [userRole] = useState('donor');
  const [isAuthenticated] = useState(true);
  const { wallet, connected } = useWallet();

  // Mock campaigns data (localized for Nigeria)
  const mockCampaigns = {
    // Default campaign (Aisha)
    "default": {
      id: "camp_001",
      title: "Emergency Heart Surgery for Aisha Bello",
      patientName: "Aisha Bello",
      patientAge: 34,
      medicalCondition: "Congenital Heart Disease",
      treatmentType: "Heart Valve Replacement Surgery",
      hospitalName: "Lagos University Teaching Hospital",
      location: "Lagos, Nigeria",
      heroImage: "https://images.unsplash.com/photo-1586772007346-2b4b6bfa02b0?w=800",
      currentAmount: 45750,
      targetAmount: 85000,
      donorCount: 127,
      daysRemaining: 23,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      verificationStatus: "verified",
      verifierName: "Dr. Chioma Adebayo, MD",
      verificationDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      story: `My name is Aisha Bello, and I am a 34-year-old mother of two beautiful children, ages 8 and 12. Three months ago, my world turned upside down when I was diagnosed with a severe congenital heart defect that requires immediate surgical intervention.

    The doctors at Lagos University Teaching Hospital have informed me that I need a heart valve replacement surgery within the next month to prevent further complications. Without this surgery, my condition will continue to deteriorate, and I may not be able to see my children grow up.

    As a single mother working two part-time jobs, I have been struggling to make ends meet even before this diagnosis. The estimated cost of the surgery, including pre-operative care, the procedure itself, and post-operative recovery, is ₦85,000. My insurance will only cover a portion of these expenses, leaving me with an overwhelming financial burden.

    I have exhausted all my savings and have reached out to family and friends, but the amount needed is beyond what we can manage alone. This is why I am humbly asking for your help and support during this incredibly difficult time.

    Every donation, no matter how small, brings me one step closer to getting the life-saving surgery I desperately need. Your generosity will not only help save my life but will also ensure that my children don't lose their mother.

    I promise to keep everyone updated on my progress and recovery. Thank you from the bottom of my heart for taking the time to read my story and for any support you can provide.`,
      medicalTags: ["Heart Surgery", "Emergency", "Single Mother", "Verified Medical"],
      updates: [
        {
          title: "Pre-Surgery Consultation Completed",
          content: `Just finished my comprehensive pre-surgery consultation with Dr. Adebayo and her team. All the preliminary tests have been completed, including blood work, EKG, and cardiac catheterization.

  The good news is that I'm a good candidate for the valve replacement surgery. The surgical team is confident about the procedure and expects a full recovery within 6-8 weeks post-surgery.

  Surgery has been scheduled for December 15th, 2024. I'm feeling nervous but hopeful, especially with all the support from this amazing community. Thank you to everyone who has donated so far - we're at 54% of our goal!I'll continue to update everyone as we get closer to the surgery date.`,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          images: [
            "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
            "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400"
          ]
        },
        {
          title: "Reached 25% Funding Milestone!",
          content: `I can't believe we've already reached 25% of our funding goal! When I first created this campaign, I wasn't sure if anyone would help, but the response has been overwhelming.

      Special thanks to all the anonymous donors and to Ngozi Okafor, Emeka Nnamdi, and Zainab Abubakar for their generous contributions and kind words. Reading your messages of support brings tears to my eyes and gives me strength to keep fighting.

  My children are also amazed by the kindness of strangers. My 12-year-old daughter asked if she could write thank you cards to everyone who donated. It's beautiful to see how this experience is teaching them about compassion and community.

  We still have a long way to go, but I'm feeling more hopeful each day. Thank you for believing in me and my recovery.`,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ],
      documents: [
        {
          name: "Medical Diagnosis Report",
          type: "PDF Document",
          url: "https://example.com/medical-report.pdf",
          uploadDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
        },
        {
          name: "Cardiac Catheterization Results",
          type: "Medical Image",
          url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600",
          uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          name: "Surgery Cost Estimate",
          type: "PDF Document",
          url: "https://example.com/cost-estimate.pdf",
          uploadDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        },
        {
          name: "Insurance Coverage Letter",
          type: "PDF Document",
          url: "https://example.com/insurance-letter.pdf",
          uploadDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    // Chidi's Campaign
    "1": {
      id: "1",
      title: "Kidney Transplant for Chidi",
      patientName: "Chidi Okonkwo",
      patientAge: 45,
      medicalCondition: "End-Stage Renal Disease",
      treatmentType: "Kidney Transplant",
      hospitalName: "Nizamiye Hospital Abuja",
      location: "Abuja, Nigeria",
      heroImage: "https://images.unsplash.com/photo-1579684385136-137af75461bb?w=800",
      currentAmount: 32000,
      targetAmount: 60000,
      donorCount: 89,
      daysRemaining: 15,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      verificationStatus: "verified",
      verifierName: "Dr. Ibrahim Musa",
      verificationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      story: `Chidi has been battling kidney failure for the past 3 years, relying on dialysis three times a week. His condition has now progressed to end-stage renal disease, and a transplant is his only chance for survival. We have found a matching donor, but the cost of the surgery and post-operative immunosuppressant drugs is overwhelming.`,
      medicalTags: ["Kidney Transplant", "Urgent", "Verified Medical"],
      updates: [],
      documents: []
    },
    // Amina's Campaign
    "2": {
      id: "2",
      title: "Spinal Surgery for Amina",
      patientName: "Amina Yusuf",
      patientAge: 28,
      medicalCondition: "Spinal Cord Injury",
      treatmentType: "Spinal Decompression & Fusion",
      hospitalName: "National Orthopaedic Hospital Dala",
      location: "Kano, Nigeria",
      heroImage: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
      currentAmount: 45000,
      targetAmount: 55000,
      donorCount: 210,
      daysRemaining: 10,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      verificationStatus: "verified",
      verifierName: "Dr. Fatima Aliyu",
      verificationDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      story: `Amina was involved in a severe car accident two months ago that left her with a compressed spinal cord. She has lost sensation in her legs, but doctors are optimistic that immediate surgery can restore her mobility. She is a young teacher with a bright future ahead of her.`,
      medicalTags: ["Spinal Surgery", "Accident Recovery", "Verified Medical"],
      updates: [],
      documents: []
    },
    // Tunde's Campaign
    "3": {
      id: "3",
      title: "Chemotherapy for Tunde",
      patientName: "Tunde Bakare",
      patientAge: 52,
      medicalCondition: "Non-Hodgkin Lymphoma",
      treatmentType: "Chemotherapy & Immunotherapy",
      hospitalName: "Lagos University Teaching Hospital",
      location: "Lagos, Nigeria",
      heroImage: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800",
      currentAmount: 28000,
      targetAmount: 40000,
      donorCount: 65,
      daysRemaining: 45,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      verificationStatus: "verified",
      verifierName: "Dr. Kemi Johnson",
      verificationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      story: `Tunde was diagnosed with aggressive Non-Hodgkin Lymphoma last month. His treatment plan involves 6 cycles of chemotherapy combined with immunotherapy. As the breadwinner of his family, his illness has put a significant financial strain on his household.`,
      medicalTags: ["Cancer Treatment", "Chemotherapy", "Verified Medical"],
      updates: [],
      documents: []
    }
  };

  useEffect(() => {
    // Load campaign data from storage or mock data
    const loadCampaign = async () => {
      setLoading(true);
      
      try {
        // First, try to load from campaignStorage
        if (id) {
          const storedCampaign = campaignStorage.getCampaignById(id);
          if (storedCampaign) {
            console.log('📦 Loaded campaign from storage:', id);
            // Convert stored campaign to display format
            setCampaign({
              ...storedCampaign,
              title: storedCampaign.title || 'Untitled Campaign',
              patientName: storedCampaign.patientName || 'Unknown Patient',
              hospitalName: storedCampaign.hospitalName || 'Unknown Hospital',
              targetAmount: storedCampaign.goalAda || storedCampaign.targetAmount || 0,
              currentAmount: storedCampaign.currentAmount || 0,
              donorCount: storedCampaign.donorCount || 0
            });
            setLoading(false);
            return;
          }
        }

        // Fallback to mock campaigns if not found in storage
        await new Promise(resolve => setTimeout(resolve, 500));
        const campaignId = id || "default";
        const selectedCampaign = mockCampaigns[campaignId] || mockCampaigns["default"];
        
        console.log('📦 Loaded campaign from mock data:', campaignId);
        setCampaign(selectedCampaign);
      } catch (error) {
        console.error('Error loading campaign:', error);
        // Fallback to default mock campaign
        setCampaign(mockCampaigns["default"]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [id]);

  // Handle donation - all logic in parent component
  const handleDonate = async (donationData) => {
    console.log('🎯 Parent handleDonate called with data:', donationData);
    
    // Check if wallet is connected
    if (!connected || !wallet) {
      console.warn('❌ Wallet not connected');
      setDonationError('Please connect your wallet first to make a donation');
      return;
    }

    console.log('✅ Wallet is connected, proceeding with donation...');
    setIsDonating(true);
    setDonationError(null);

    try {
      // Convert ADA amount to lovelace
      const donationAmountLovelace = adaToLovelace(donationData?.amount || 0);
      const donationAmountString = donationAmountLovelace.toString();

      console.log('🔗 Wallet connected, building donation transaction...');
      console.log(`💰 Donation amount: ${donationData?.amount} ADA (${donationAmountString} lovelace)`);

      // Build unsigned transaction
      console.log('📝 Calling donateToCampaign...');
      const unsignedTx = await donateToCampaign(donationAmountString, wallet);
      console.log('✅ Unsigned transaction created:', unsignedTx);
      
      console.log('✍️ Requesting signature...');
      const signedTx = await wallet.signTx(unsignedTx);
      
      console.log('📤 Submitting transaction...');
      const txHash = await wallet.submitTx(signedTx);

      const cardanoScanLink = `https://preprod.cardanoscan.io/transaction/${txHash}`;
      
      console.log('✅ Donation transaction submitted:', txHash);

      // Get donor address
      const donorAddress = await wallet.getChangeAddress();

      // Track donation amount
      const donationAmount = donationData?.amount || 0;
      console.log(`💰 Tracking donation: ${donationAmount} ADA to campaign ${campaign?.id}`);

      // Update campaign in localStorage using campaignStorage
      if (campaign?.id) {
        // Check if campaign exists in storage, if not create it first
        let campaignToUpdate = campaignStorage.getCampaignById(campaign.id);
        
        if (!campaignToUpdate) {
          console.log('📝 Campaign not in storage, creating entry...');
          // Create campaign entry in storage if it doesn't exist
          const campaignDataForStorage = {
            title: campaign.title || 'Untitled Campaign',
            description: campaign.story || '',
            goalAda: campaign.targetAmount || 0,
            creator: donorAddress, // Use donor address as creator for now
            beneficiary: donorAddress,
            medicalAuthority: campaign.hospitalName || '',
            currentAmount: campaign.currentAmount || 0,
            donorCount: campaign.donorCount || 0,
            status: 'active',
            patientName: campaign.patientName,
            patientAge: campaign.patientAge,
            medicalCondition: campaign.medicalCondition,
            urgency: campaign.urgency,
            location: campaign.location,
            hospitalName: campaign.hospitalName,
            durationDays: campaign.daysRemaining || 30,
            verificationRequired: true
          };
          
          // Create campaign with a placeholder transaction hash
          campaignToUpdate = campaignStorage.addCampaign(campaignDataForStorage, txHash);
          console.log('✅ Campaign created in storage:', campaignToUpdate.id);
          
          // Track published campaign in hospital tracking
          try {
            const { hospitalTracking } = await import('../../lib/storage/hospital-tracking');
            hospitalTracking.trackPublishedCampaign(
              campaignToUpdate.id,
              campaign.patientName || 'Unknown Patient',
              campaign.hospitalName || 'Unknown Hospital',
              campaign.targetAmount || 0,
              'System',
              undefined,
              txHash
            );
            console.log('✅ Campaign tracked in hospital dashboard');
          } catch (error) {
            console.warn('Could not track campaign in hospital tracking:', error);
          }
        }

        // Add donation to campaign
        const updatedCampaign = campaignStorage.addDonation(
          campaign.id,
          donationAmount,
          donorAddress,
          txHash
        );

        if (updatedCampaign) {
          console.log('✅ Donation saved to localStorage');
          console.log(`📊 Campaign balance updated: ${updatedCampaign.currentAmount} ADA`);
          console.log(`📊 Total donations: ${updatedCampaign.donations?.length || 0}`);
          
          // Ensure donation is tracked in hospital tracking
          try {
            const { hospitalTracking } = await import('../../lib/storage/hospital-tracking');
            const trackedDonation = hospitalTracking.trackDonation(
              campaign.id,
              donationAmount,
              donorAddress,
              txHash
            );
            console.log('✅ Donation tracked in hospital dashboard:', trackedDonation.donationId);
            console.log(`💰 Donation amount: ${donationAmount} ADA`);
          } catch (error) {
            console.error('❌ Could not track donation in hospital tracking:', error);
          }
          
          // Update local campaign state
          setCampaign(prev => ({
            ...prev,
            currentAmount: updatedCampaign.currentAmount,
            donorCount: updatedCampaign.donorCount,
            lastDonation: updatedCampaign.lastDonation,
            donations: updatedCampaign.donations
          }));
        } else {
          console.warn('⚠️ Failed to update campaign in storage');
        }
      } else {
        console.warn('⚠️ Campaign ID not found, cannot save donation');
        // Fallback: update local state if campaign not in storage
        setCampaign(prev => ({
          ...prev,
          currentAmount: (prev?.currentAmount || 0) + donationAmount,
          donorCount: (prev?.donorCount || 0) + 1
        }));
      }

      // Show success state with transaction info
      setDonationSuccess({
        txHash,
        explorerLink: cardanoScanLink,
        amount: donationData?.amount
      });

      // Reset success state after 5 seconds
      setTimeout(() => {
        setDonationSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('❌ Donation failed:', error);
      setDonationError(`Failed to process donation: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDonating(false);
    }
  };

  const handleGoBack = () => {
    navigate('/campaign-discovery-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          userRole={userRole}
          isAuthenticated={isAuthenticated}
          walletConnected={true}
          walletBalance={15420.75}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading campaign details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          userRole={userRole}
          isAuthenticated={isAuthenticated}
          walletConnected={true}
          walletBalance={15420.75}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center space-y-4">
            <Icon name="AlertCircle" size={48} className="text-error mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Campaign Not Found</h2>
            <p className="text-muted-foreground">The campaign you're looking for doesn't exist or has been removed.</p>
            <Button variant="default" onClick={handleGoBack}>
              Back to Campaigns
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{campaign?.title} - Aidpod</title>
        <meta name="description" content={`Help ${campaign?.patientName} with ${campaign?.medicalCondition}. Verified medical campaign on Aidpod blockchain platform.`} />
        <meta property="og:title" content={campaign?.title} />
        <meta property="og:description" content={`Help ${campaign?.patientName} with ${campaign?.medicalCondition}`} />
        <meta property="og:image" content={campaign?.heroImage} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        walletConnected={connected}
        walletBalance={15420.75}
      />
      {/* Success Banner */}
      {donationSuccess && (
        <div className="bg-success text-success-foreground p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Icon name="CheckCircle" size={20} />
                <span className="font-medium">
                  Thank you! Your donation of {donationSuccess.amount} ADA has been successfully processed.
                </span>
              </div>
              {donationSuccess.txHash && (
                <div className="ml-8 text-sm opacity-90">
                  <div className="break-all mb-1">Transaction: {donationSuccess.txHash}</div>
                  <a 
                    href={donationSuccess.explorerLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 flex items-center space-x-1"
                  >
                    <span>View on Cardano Explorer</span>
                    <Icon name="ExternalLink" size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {donationError && (
        <div className="bg-error text-error-foreground p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <Icon name="AlertTriangle" size={20} />
              <span className="font-medium flex-1">{donationError}</span>
              <button 
                onClick={() => setDonationError(null)}
                className="hover:opacity-80"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Button
            variant="link"
            size="sm"
            onClick={handleGoBack}
            className="p-0 h-auto font-normal text-muted-foreground hover:text-primary hover:no-underline"
          >
            Campaigns
          </Button>
          <Icon name="ChevronRight" size={16} />
          <span className="text-foreground">{campaign?.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Hero */}
            <CampaignHero campaign={campaign} />

            {/* Campaign Tabs */}
            <CampaignTabs campaign={campaign} />

            {/* Timeline - Desktop */}
            <div className="hidden lg:block">
              <CampaignTimeline campaign={campaign} />
            </div>

            {/* Comments */}
            <DonorComments campaign={campaign} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Interface */}
            <DonationInterface 
              campaign={campaign} 
              onDonate={handleDonate}
              isDonating={isDonating}
              walletConnected={connected}
            />

            {/* Social Sharing */}
            <SocialSharing campaign={campaign} />

            {/* Timeline - Mobile */}
            <div className="lg:hidden">
              <CampaignTimeline campaign={campaign} />
            </div>
          </div>
        </div>

        {/* Related Campaigns */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-xl font-bold text-foreground mb-6">Other Medical Campaigns</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: "Kidney Transplant for Chidi",
                description: "Chidi needs a kidney transplant to survive end-stage renal failure. Your support can give him a second chance at life.",
                amountRaised: 32000,
                image: "https://images.unsplash.com/photo-1579684385136-137af75461bb?w=500"
              },
              {
                id: 2,
                title: "Spinal Surgery for Amina",
                description: "Amina was involved in a severe accident and requires spinal surgery to regain mobility. Help her walk again.",
                amountRaised: 45000,
                image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=500"
              },
              {
                id: 3,
                title: "Chemotherapy for Tunde",
                description: "Tunde is battling aggressive lymphoma. Funds are needed for his chemotherapy and supportive care.",
                amountRaised: 28000,
                image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500"
              }
            ].map((related) => (
              <div key={related.id} className="bg-card border border-border rounded-medical p-6 hover:shadow-medical-md transition-shadow duration-200">
                <div className="w-full h-32 mb-4 overflow-hidden rounded-medical">
                  <Image
                    src={related.image}
                    alt={related.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {related.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {related.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    {related.amountRaised?.toLocaleString()} ADA raised
                  </span>
                  <Link to={`/campaign-details-donation?id=${related.id}`}>
                    <Button variant="outline" size="sm">
                      View Campaign
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignDetailsAndDonation;