import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import DNASimulation from '../components/DNASimulation';

const Landing = () => {
  const features = [
    {
      icon: 'Shield',
      title: 'Hospital Verification',
      description: 'Every campaign is validated by partnered hospitals before going live, ensuring only legitimate medical needs are funded.',
      color: 'primary'
    },
    {
      icon: 'Lock',
      title: 'Smart Contract Escrow',
      description: 'Funds are securely held in Cardano smart contracts and released only when treatment conditions are verified.',
      color: 'secondary'
    },
    {
      icon: 'Eye',
      title: 'Full Transparency',
      description: 'Track every contribution and disbursement on-chain with real-time, tamper-proof visibility.',
      color: 'accent'
    },
    {
      icon: 'Building2',
      title: 'Direct Hospital Payments',
      description: 'Disbursements go directly to verified healthcare providers, ensuring funds are used for intended treatment.',
      color: 'success'
    }
  ];

  const userFlows = [
    {
      role: 'hospital',
      icon: 'Building2',
      title: 'For Hospitals',
      description: 'Register, verify patients, and receive direct payments',
      steps: [
        'Connect wallet & register hospital',
        'Review patient documentation',
        'Approve or reject campaigns',
        'Receive verified fund transfers'
      ],
      cta: 'Hospital Dashboard',
      link: '/hospital-verification-dashboard',
      gradient: 'from-primary to-primary/70'
    },
    {
      role: 'patient',
      icon: 'User',
      title: 'For Patients',
      description: 'Create verified campaigns with hospital backing',
      steps: [
        'Submit medical documents',
        'Get hospital verification',
        'Campaign goes live',
        'Funds released to hospital'
      ],
      cta: 'Create Campaign',
      link: '/patient-campaign-creation',
      gradient: 'from-secondary to-secondary/70'
    },
    {
      role: 'donor',
      icon: 'Heart',
      title: 'For Donors',
      description: 'Support verified medical campaigns with confidence',
      steps: [
        'Browse verified campaigns',
        'Contribute via wallet',
        'Track fund usage on-chain',
        'See real impact'
      ],
      cta: 'Discover Campaigns',
      link: '/campaign-discovery-dashboard',
      gradient: 'from-accent to-accent/70'
    }
  ];

  const stats = [
    { value: '$2.4M+', label: 'Funds Verified', icon: 'Wallet' },
    { value: '156+', label: 'Campaigns Funded', icon: 'Heart' },
    { value: '23+', label: 'Partner Hospitals', icon: 'Building2' },
    { value: '100%', label: 'On-Chain Transparency', icon: 'Eye' }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Hospital Onboarding',
      description: 'Hospitals register with wallet authentication and submit verification documents.',
      icon: 'Building2'
    },
    {
      step: 2,
      title: 'Campaign Creation',
      description: 'Patients create campaigns with medical documents for hospital verification.',
      icon: 'FileText'
    },
    {
      step: 3,
      title: 'Verification',
      description: 'Hospitals review and approve legitimate medical campaigns.',
      icon: 'CheckCircle'
    },
    {
      step: 4,
      title: 'Fundraising',
      description: 'Verified campaigns go live. Donations held in smart contract escrow.',
      icon: 'Heart'
    },
    {
      step: 5,
      title: 'Disbursement',
      description: 'Upon treatment approval, funds release directly to the hospital.',
      icon: 'ArrowRight'
    },
    {
      step: 6,
      title: 'Completion',
      description: 'Immutable on-chain record provides full audit trail for all parties.',
      icon: 'Award'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={null} isAuthenticated={false} />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-screen flex items-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container-xl py-20 lg:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="blockchain-badge mb-6 w-fit">
                <Icon name="Hexagon" size={14} />
                <span>Powered by Cardano Blockchain</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                Trusted Medical Crowdfunding with{' '}
                <span className="text-gradient">Blockchain Transparency</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                Every campaign is hospital-verified. Every donation is tracked on-chain. 
                Every disbursement goes directly to healthcare providers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/campaign-discovery-dashboard">
                  <Button size="lg" className="btn-gradient shadow-glow w-full sm:w-auto">
                    <Icon name="Search" size={20} className="mr-2" />
                    Discover Campaigns
                  </Button>
                </Link>
                <Link to="/patient-campaign-creation">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Start a Campaign
                  </Button>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6">
                <div className="trust-badge">
                  <Icon name="ShieldCheck" size={14} />
                  <span>Hospital Verified</span>
                </div>
                <div className="trust-badge">
                  <Icon name="Lock" size={14} />
                  <span>Smart Contract Secured</span>
                </div>
                <div className="trust-badge">
                  <Icon name="Eye" size={14} />
                  <span>100% Transparent</span>
                </div>
              </div>
            </div>

            {/* Right DNA Visualization */}
            <div className="hidden lg:block h-[600px]">
              <DNASimulation height="600px" />
            </div>
          </div>

          {/* Mobile DNA Visualization */}
          <div className="lg:hidden mt-12 h-[400px]">
            <DNASimulation height="400px" />
          </div>
        </div>
      </section>

      {/* Genomic Trust Verification Section */}
      {/* Genomic Trust Verification Section */}
      <section className="py-20 bg-background">
        <div className="container-xl space-y-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Genomic Trust Verification</h2>
            <p className="text-lg text-muted-foreground">
              This dynamic model represents the underlying security of verified patient data, mirroring the complexity and integrity of genetic code.
            </p>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-medical-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon name={stat.icon} size={24} className="text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why AidPod is Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've reimagined medical crowdfunding with blockchain technology and hospital partnerships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-medical-lg p-6 border border-border card-hover"
              >
                <div className={`w-12 h-12 rounded-medical-lg bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                  <Icon name={feature.icon} size={24} className={`text-${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A transparent, end-to-end workflow from campaign creation to fund disbursement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card rounded-medical-lg p-6 border border-border h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div className="w-10 h-10 rounded-medical bg-primary/10 flex items-center justify-center">
                      <Icon name={item.icon} size={20} className="text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && index !== 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <Icon name="ChevronRight" size={20} className="text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Flows Section */}
      <section className="py-20 lg:py-28">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a hospital, patient, or donor, AidPod provides the tools you need.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {userFlows.map((flow, index) => (
              <div
                key={index}
                className="bg-card rounded-medical-lg border border-border overflow-hidden card-hover"
              >
                <div className={`h-2 bg-gradient-to-r ${flow.gradient}`} />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-medical-lg bg-gradient-to-br ${flow.gradient} flex items-center justify-center`}>
                      <Icon name={flow.icon} size={24} className="text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{flow.title}</h3>
                      <p className="text-sm text-muted-foreground">{flow.description}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {flow.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                          {stepIndex + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={flow.link}>
                    <Button variant="outline" className="w-full">
                      {flow.cta}
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-50" />
        <div className="container-xl relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the future of transparent, trusted medical crowdfunding on Cardano.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user-registration-login">
                <Button size="lg" className="btn-gradient shadow-glow w-full sm:w-auto">
                  <Icon name="Wallet" size={20} className="mr-2" />
                  Connect Wallet
                </Button>
              </Link>
              <Link to="/campaign-discovery-dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-medical-lg flex items-center justify-center">
                <Icon name="Heart" size={20} className="text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-foreground">AidPod</div>
                <div className="text-xs text-muted-foreground">Trusted Medical Funding</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/campaign-discovery-dashboard" className="hover:text-foreground transition-colors">
                Campaigns
              </Link>
              <Link to="/patient-campaign-creation" className="hover:text-foreground transition-colors">
                Start Campaign
              </Link>
              <Link to="/hospital-verification-dashboard" className="hover:text-foreground transition-colors">
                Hospital Portal
              </Link>
            </div>
            
            <div className="blockchain-badge">
              <Icon name="Hexagon" size={14} />
              <span>Built on Cardano</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 AidPod. Transparent medical crowdfunding powered by blockchain.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
