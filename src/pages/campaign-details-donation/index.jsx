import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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

const CampaignDetailsAndDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [userRole] = useState('donor');
  const [isAuthenticated] = useState(true);

  // Mock campaign data (localized for Nigeria)
  const mockCampaign = {
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
  };

  useEffect(() => {
    // Simulate loading campaign data
    const loadCampaign = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCampaign(mockCampaign);
      setLoading(false);
    };

    loadCampaign();
  }, [id]);

  const handleDonate = async (donationData) => {
    try {
      // Simulate donation processing
      console.log('Processing donation:', donationData);

      // Show success state
      setDonationSuccess(true);

      // Update campaign data
      setCampaign(prev => ({
        ...prev,
        currentAmount: prev?.currentAmount + donationData?.amount,
        donorCount: prev?.donorCount + 1
      }));

      // Reset success state after 5 seconds
      setTimeout(() => {
        setDonationSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Donation failed:', error);
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
        walletConnected={true}
        walletBalance={15420.75}
      />
      {/* Success Banner */}
      {donationSuccess && (
        <div className="bg-success text-success-foreground p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <Icon name="CheckCircle" size={20} />
              <span className="font-medium">
                Thank you! Your donation has been successfully processed and will appear on the blockchain shortly.
              </span>
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
            <DonationInterface campaign={campaign} onDonate={handleDonate} />

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
                  <Button variant="outline" size="sm">
                    View Campaign
                  </Button>
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