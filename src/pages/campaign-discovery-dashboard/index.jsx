import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import WalletConnectionIndicator from '../../components/ui/WalletConnectionIndicator';
import { useWallet } from '../../hooks/useWallet';
import { campaignService } from '../../lib/services/campaign-service';

// Import page components
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import CampaignGrid from './components/CampaignGrid';
import QuickDonateModal from './components/QuickDonateModal';

const CampaignDiscoveryDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentSort, setCurrentSort] = useState(searchParams.get('sort') || 'relevance');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get('search') || '',
    medicalSpecialty: [],
    urgency: [],
    verificationStatus: [],
    fundingRange: '',
    timeframe: 'all',
    location: '',
    minAmount: '',
    maxAmount: '',
    hasVerification: false,
    isEmergency: false
  });

  // Real wallet integration
  const { wallet, walletInfo, isConnected, connect, disconnect, formatBalance } = useWallet();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  // User state
  const [userRole] = useState('donor'); // Mock user role
  const [isAuthenticated] = useState(true); // Mock authentication

  // Mock campaign data
  const mockCampaigns = [
    {
      id: 1,
      title: "Emergency Heart Surgery for Sarah",
      patientName: "Sarah Johnson",
      age: 34,
      medicalCondition: "Cardiac Arrhythmia",
      urgency: "critical",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      storyPreview: "Sarah is a loving mother of two who was diagnosed with a severe cardiac arrhythmia that requires immediate surgical intervention. The procedure is scheduled for next month, but the family needs help covering the medical expenses.",
      currentAmount: 15750,
      targetAmount: 25000,
      donorCount: 127,
      daysRemaining: 18,
      location: "Phoenix, AZ",
      verificationStatus: "verified",
      verifierName: "Phoenix Heart Institute",
      verificationDate: "2025-08-10",
      status: "active",
      createdAt: "2025-08-01"
    },
    {
      id: 2,
      title: "Cancer Treatment Support for Michael",
      patientName: "Michael Rodriguez",
      age: 42,
      medicalCondition: "Acute Lymphoblastic Leukemia",
      urgency: "urgent",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop",
      storyPreview: "Michael was recently diagnosed with acute lymphoblastic leukemia and needs immediate chemotherapy treatment. His insurance covers only part of the treatment costs, leaving the family with significant medical bills.",
      currentAmount: 8200,
      targetAmount: 40000,
      donorCount: 89,
      daysRemaining: 45,
      location: "Denver, CO",
      verificationStatus: "verified",
      verifierName: "Denver Cancer Center",
      verificationDate: "2025-08-08",
      status: "active",
      createdAt: "2025-07-28"
    },
    {
      id: 3,
      title: "Pediatric Surgery for Little Emma",
      patientName: "Emma Thompson",
      age: 7,
      medicalCondition: "Congenital Heart Defect",
      urgency: "moderate",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      storyPreview: "Emma is a bright 7-year-old who was born with a congenital heart defect. She needs corrective surgery to ensure she can live a normal, healthy life. Her parents are working hard to raise funds for this life-changing procedure.",
      currentAmount: 22500,
      targetAmount: 35000,
      donorCount: 203,
      daysRemaining: 62,
      location: "Seattle, WA",
      verificationStatus: "verified",
      verifierName: "Seattle Children's Hospital",
      verificationDate: "2025-08-05",
      status: "active",
      createdAt: "2025-07-20"
    },
    {
      id: 4,
      title: "Spinal Surgery Recovery for James",
      patientName: "James Wilson",
      age: 28,
      medicalCondition: "Herniated Disc",
      urgency: "moderate",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop",
      storyPreview: "James suffered a severe back injury in a workplace accident. He requires spinal surgery and extensive rehabilitation to regain mobility. The medical costs are overwhelming for his young family.",
      currentAmount: 5400,
      targetAmount: 18000,
      donorCount: 67,
      daysRemaining: 38,
      location: "Austin, TX",
      verificationStatus: "pending",
      verifierName: "",
      verificationDate: null,
      status: "active",
      createdAt: "2025-08-03"
    },
    {
      id: 5,
      title: "Kidney Transplant for Maria",
      patientName: "Maria Garcia",
      age: 51,
      medicalCondition: "Chronic Kidney Disease",
      urgency: "critical",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
      storyPreview: "Maria has been on dialysis for three years and finally found a kidney donor match. The transplant surgery is scheduled, but the family needs help with the substantial medical expenses and post-surgery care costs.",
      currentAmount: 31200,
      targetAmount: 50000,
      donorCount: 156,
      daysRemaining: 12,
      location: "Miami, FL",
      verificationStatus: "verified",
      verifierName: "Miami Transplant Institute",
      verificationDate: "2025-08-12",
      status: "active",
      createdAt: "2025-07-25"
    },
    {
      id: 6,
      title: "Brain Tumor Treatment for David",
      patientName: "David Chen",
      age: 39,
      medicalCondition: "Glioblastoma",
      urgency: "critical",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop",
      storyPreview: "David was diagnosed with an aggressive brain tumor and needs immediate surgery followed by intensive treatment. His family is seeking support to cover the complex medical procedures and ongoing care.",
      currentAmount: 12800,
      targetAmount: 60000,
      donorCount: 94,
      daysRemaining: 25,
      location: "Boston, MA",
      verificationStatus: "verified",
      verifierName: "Massachusetts General Hospital",
      verificationDate: "2025-08-09",
      status: "active",
      createdAt: "2025-07-30"
    },
    {
      id: 10,
      title: "Emergency Appendectomy",
      patientName: "Alex Turner",
      age: 24,
      medicalCondition: "Appendicitis",
      urgency: "urgent",
      image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop",
      storyPreview: "Alex needs an emergency appendectomy. As a student without comprehensive insurance, he needs help covering the surgical costs immediately.",
      currentAmount: 1200,
      targetAmount: 5000,
      donorCount: 15,
      daysRemaining: 5,
      location: "Chicago, IL",
      verificationStatus: "pending",
      verifierName: "",
      verificationDate: null,
      status: "active",
      createdAt: "2025-08-15"
    },
    {
      id: 11,
      title: "Stroke Recovery Therapy",
      patientName: "Robert Freeman",
      age: 68,
      medicalCondition: "Stroke Recovery",
      urgency: "routine",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop",
      storyPreview: "After suffering a stroke, Robert needs extensive physical therapy to regain his independence. His family is raising funds for a 6-month rehabilitation program.",
      currentAmount: 3500,
      targetAmount: 8000,
      donorCount: 42,
      daysRemaining: 90,
      location: "Atlanta, GA",
      verificationStatus: "verified",
      verifierName: "Atlanta Rehab Center",
      verificationDate: "2025-08-01",
      status: "active",
      createdAt: "2025-07-10"
    },
    {
      id: 12,
      title: "Chemotherapy Fund",
      patientName: "Lisa Wong",
      age: 55,
      medicalCondition: "Breast Cancer",
      urgency: "urgent",
      image: "https://images.unsplash.com/photo-1579165466741-7f35a4755657?w=400&h=300&fit=crop",
      storyPreview: "Lisa is fighting breast cancer and needs support for her chemotherapy sessions. She is a single mother and the sole provider for her family.",
      currentAmount: 7500,
      targetAmount: 15000,
      donorCount: 110,
      daysRemaining: 28,
      location: "San Diego, CA",
      verificationStatus: "verified",
      verifierName: "San Diego Oncology",
      verificationDate: "2025-08-11",
      status: "active",
      createdAt: "2025-07-29"
    },
    {
      id: 13,
      title: "Knee Replacement Surgery",
      patientName: "John Smith",
      age: 62,
      medicalCondition: "Osteoarthritis",
      urgency: "moderate",
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop",
      storyPreview: "John has been suffering from severe osteoarthritis for years. A double knee replacement will allow him to walk pain-free again.",
      currentAmount: 11000,
      targetAmount: 22000,
      donorCount: 78,
      daysRemaining: 50,
      location: "Dallas, TX",
      verificationStatus: "verified",
      verifierName: "Texas Orthopedic Hospital",
      verificationDate: "2025-08-07",
      status: "active",
      createdAt: "2025-07-15"
    },
    {
      id: 14,
      title: "Insulin Pump for Diabetes",
      patientName: "Emily White",
      age: 16,
      medicalCondition: "Type 1 Diabetes",
      urgency: "routine",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop",
      storyPreview: "Emily needs a new insulin pump to manage her Type 1 Diabetes effectively. This device is crucial for her daily health and safety.",
      currentAmount: 1200,
      targetAmount: 3500,
      donorCount: 25,
      daysRemaining: 15,
      location: "Columbus, OH",
      verificationStatus: "pending",
      verifierName: "",
      verificationDate: null,
      status: "active",
      createdAt: "2025-08-18"
    },
    {
      id: 15,
      title: "Cleft Palate Repair",
      patientName: "Baby Sofia",
      age: 1,
      medicalCondition: "Cleft Palate",
      urgency: "moderate",
      image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=400&h=300&fit=crop",
      storyPreview: "Little Sofia was born with a cleft palate. Corrective surgery will help her eat and speak normally as she grows.",
      currentAmount: 4000,
      targetAmount: 6000,
      donorCount: 55,
      daysRemaining: 40,
      location: "Los Angeles, CA",
      verificationStatus: "verified",
      verifierName: "Children's Hospital LA",
      verificationDate: "2025-08-03",
      status: "active",
      createdAt: "2025-07-25"
    }
  ];

  const moreMockCampaigns = [
    {
      id: 7,
      title: "Neonatal Care for Baby Lucas",
      patientName: "Lucas Martin",
      age: 0,
      medicalCondition: "Premature Birth Complications",
      urgency: "critical",
      image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop",
      storyPreview: "Born at 26 weeks, baby Lucas is fighting for his life in the NICU. His parents need support for the specialized care and long hospital stay ahead.",
      currentAmount: 45000,
      targetAmount: 100000,
      donorCount: 312,
      daysRemaining: 45,
      location: "San Francisco, CA",
      verificationStatus: "verified",
      verifierName: "UCSF Benioff Children's Hospital",
      verificationDate: "2025-08-14",
      status: "active",
      createdAt: "2025-07-15"
    },
    {
      id: 8,
      title: "Prosthetic Leg for Mark",
      patientName: "Mark Davis",
      age: 29,
      medicalCondition: "Amputation due to Accident",
      urgency: "moderate",
      image: "https://images.unsplash.com/photo-1584515933487-9dca6d0937a0?w=400&h=300&fit=crop",
      storyPreview: "After a motorcycle accident, Mark lost his right leg. He's raising funds for a high-tech prosthetic that will allow him to return to his job and active lifestyle.",
      currentAmount: 15000,
      targetAmount: 25000,
      donorCount: 145,
      daysRemaining: 20,
      location: "Portland, OR",
      verificationStatus: "verified",
      verifierName: "Portland Rehabilitation Center",
      verificationDate: "2025-08-11",
      status: "active",
      createdAt: "2025-07-22"
    },
    {
      id: 9,
      title: "Liver Transplant for Sophia",
      patientName: "Sophia Lee",
      age: 45,
      medicalCondition: "Liver Failure",
      urgency: "urgent",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
      storyPreview: "Sophia is battling end-stage liver disease. A transplant is her only hope. The family is fundraising for the surgery and the lifelong medication she will need.",
      currentAmount: 28000,
      targetAmount: 80000,
      donorCount: 210,
      daysRemaining: 30,
      location: "New York, NY",
      verificationStatus: "verified",
      verifierName: "Mount Sinai Hospital",
      verificationDate: "2025-08-13",
      status: "active",
      createdAt: "2025-07-18"
    },
    {
      id: 16,
      title: "Dental Surgery Fund",
      patientName: "Mike Brown",
      age: 33,
      medicalCondition: "Maxillofacial Trauma",
      urgency: "urgent",
      image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=300&fit=crop",
      storyPreview: "Mike requires urgent dental surgery following a car accident. The procedure is complex and not fully covered by insurance.",
      currentAmount: 1500,
      targetAmount: 4500,
      donorCount: 20,
      daysRemaining: 10,
      location: "Las Vegas, NV",
      verificationStatus: "pending",
      verifierName: "",
      verificationDate: null,
      status: "active",
      createdAt: "2025-08-20"
    },
    {
      id: 17,
      title: "Hearing Aids for Grandma Rose",
      patientName: "Rose Tyler",
      age: 78,
      medicalCondition: "Hearing Loss",
      urgency: "routine",
      image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=300&fit=crop",
      storyPreview: "Grandma Rose has severe hearing loss. We want to get her high-quality hearing aids so she can hear her grandchildren's laughter again.",
      currentAmount: 1800,
      targetAmount: 2500,
      donorCount: 30,
      daysRemaining: 60,
      location: "Nashville, TN",
      verificationStatus: "verified",
      verifierName: "Nashville Audiology",
      verificationDate: "2025-08-05",
      status: "active",
      createdAt: "2025-07-12"
    },
    {
      id: 18,
      title: "Genetic Disorder Treatment",
      patientName: "Timmy Turner",
      age: 4,
      medicalCondition: "Rare Genetic Disorder",
      urgency: "critical",
      image: "https://images.unsplash.com/photo-1632053001844-31518b52f63f?w=400&h=300&fit=crop",
      storyPreview: "Timmy has a rare genetic condition that requires specialized treatment available only at a few centers in the country.",
      currentAmount: 45000,
      targetAmount: 150000,
      donorCount: 450,
      daysRemaining: 90,
      location: "Houston, TX",
      verificationStatus: "verified",
      verifierName: "Texas Children's Hospital",
      verificationDate: "2025-08-15",
      status: "active",
      createdAt: "2025-07-01"
    },
    {
      id: 19,
      title: "Therapy for PTSD",
      patientName: "Veteran John",
      age: 35,
      medicalCondition: "PTSD",
      urgency: "routine",
      image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=400&h=300&fit=crop",
      storyPreview: "John, a military veteran, is seeking funds for specialized PTSD therapy to help him reintegrate into civilian life.",
      currentAmount: 1200,
      targetAmount: 3000,
      donorCount: 18,
      daysRemaining: 45,
      location: "Washington, DC",
      verificationStatus: "verified",
      verifierName: "Veterans Support Group",
      verificationDate: "2025-08-02",
      status: "active",
      createdAt: "2025-07-20"
    },
    {
      id: 20,
      title: "Burn Unit Recovery Fund",
      patientName: "Firefighter Sam",
      age: 40,
      medicalCondition: "Severe Burns",
      urgency: "critical",
      image: "https://images.unsplash.com/photo-1605218427368-2c262a6327bd?w=400&h=300&fit=crop",
      storyPreview: "Sam was severely burned while saving a family from a house fire. He needs extensive skin grafts and rehabilitation.",
      currentAmount: 55000,
      targetAmount: 75000,
      donorCount: 600,
      daysRemaining: 30,
      location: "Detroit, MI",
      verificationStatus: "verified",
      verifierName: "Detroit Medical Center",
      verificationDate: "2025-08-16",
      status: "active",
      createdAt: "2025-07-28"
    },
    {
      id: 21,
      title: "Wheelchair Ramp Installation",
      patientName: "Elderly Martha",
      age: 82,
      medicalCondition: "Mobility Impairment",
      urgency: "moderate",
      image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=300&fit=crop",
      storyPreview: "Martha needs a wheelchair ramp installed at her home to allow her to enter and exit safely. She is currently housebound without it.",
      currentAmount: 400,
      targetAmount: 1200,
      donorCount: 12,
      daysRemaining: 15,
      location: "Philadelphia, PA",
      verificationStatus: "pending",
      verifierName: "",
      verificationDate: null,
      status: "active",
      createdAt: "2025-08-22"
    },
    {
      id: 22,
      title: "Malaria Treatment for Village",
      patientName: "Village of Opuwo",
      age: 0,
      medicalCondition: "Malaria Outbreak",
      urgency: "urgent",
      image: "https://images.unsplash.com/photo-1584515933487-9dca6d0937a0?w=400&h=300&fit=crop",
      storyPreview: "A small village is suffering from a malaria outbreak. Funds are needed for medication and mosquito nets to save lives.",
      currentAmount: 600,
      targetAmount: 800,
      donorCount: 45,
      daysRemaining: 7,
      location: "Global Aid",
      verificationStatus: "verified",
      verifierName: "Doctors Without Borders",
      verificationDate: "2025-08-18",
      status: "active",
      createdAt: "2025-08-15"
    }
  ];

  // Initialize campaigns on component mount (now includes blockchain campaigns)
  useEffect(() => {
    const loadInitialCampaigns = async () => {
      setIsLoading(true);
      try {
        // Load both mock and blockchain campaigns
        const allCampaigns = await campaignService.getAllCampaigns();
        setCampaigns(allCampaigns);
        setFilteredCampaigns(allCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        // Fallback to mock campaigns only
        setCampaigns(mockCampaigns);
        setFilteredCampaigns(mockCampaigns);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialCampaigns();
  }, []);

  // Filter and sort campaigns
  useEffect(() => {
    let filtered = [...campaigns];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.patientName.toLowerCase().includes(query) ||
        campaign.medicalCondition.toLowerCase().includes(query) ||
        campaign.storyPreview.toLowerCase().includes(query)
      );
    }

    // Apply specialty filter
    if (filters.medicalSpecialty.length > 0) {
      filtered = filtered.filter(campaign =>
        filters.medicalSpecialty.some(specialty =>
          campaign.medicalCondition.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }

    // Apply urgency filter
    if (filters.urgency.length > 0) {
      filtered = filtered.filter(campaign =>
        filters.urgency.includes(campaign.urgency)
      );
    }

    // Apply verification status filter
    if (filters.verificationStatus.length > 0) {
      filtered = filtered.filter(campaign =>
        filters.verificationStatus.includes(campaign.verificationStatus)
      );
    }

    // Apply funding range filter
    if (filters.fundingRange) {
      filtered = filtered.filter(campaign => {
        const target = campaign.targetAmount;
        switch (filters.fundingRange) {
          case '0-1000': return target <= 1000;
          case '1000-5000': return target > 1000 && target <= 5000;
          case '5000-10000': return target > 5000 && target <= 10000;
          case '10000-25000': return target > 10000 && target <= 25000;
          case '25000+': return target > 25000;
          default: return true;
        }
      });
    }

    // Apply custom amount range filter
    if (filters.minAmount || filters.maxAmount) {
      filtered = filtered.filter(campaign => {
        const target = campaign.targetAmount;
        const min = parseFloat(filters.minAmount) || 0;
        const max = parseFloat(filters.maxAmount) || Infinity;
        return target >= min && target <= max;
      });
    }

    // Apply timeframe filter
    if (filters.timeframe !== 'all') {
      const days = parseInt(filters.timeframe);
      filtered = filtered.filter(campaign =>
        campaign.daysRemaining <= days
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(campaign =>
        campaign.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply verification filter
    if (filters.hasVerification) {
      filtered = filtered.filter(campaign =>
        campaign.verificationStatus === 'verified'
      );
    }

    // Apply emergency filter
    if (filters.isEmergency) {
      filtered = filtered.filter(campaign =>
        campaign.urgency === 'critical' || campaign.urgency === 'urgent'
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'urgency':
          const urgencyOrder = { critical: 0, urgent: 1, moderate: 2, routine: 3 };
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        case 'progress':
          const aProgress = (a.currentAmount / a.targetAmount) * 100;
          const bProgress = (b.currentAmount / b.targetAmount) * 100;
          return bProgress - aProgress;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'ending-soon':
          return a.daysRemaining - b.daysRemaining;
        case 'amount-high':
          return b.targetAmount - a.targetAmount;
        case 'amount-low':
          return a.targetAmount - b.targetAmount;
        case 'donors':
          return b.donorCount - a.donorCount;
        default: // relevance
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, filters, currentSort]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (currentSort !== 'relevance') params.set('sort', currentSort);
    setSearchParams(params);
  }, [searchQuery, currentSort, setSearchParams]);

  // Handle search
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleSearchSubmit = useCallback((query) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Handle filters
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.searchQuery);
  }, []);

  const handleRemoveFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'searchQuery') {
      setSearchQuery(value);
    }
  }, []);

  const handleClearAllFilters = useCallback(() => {
    const resetFilters = {
      searchQuery: '',
      medicalSpecialty: [],
      urgency: [],
      verificationStatus: [],
      fundingRange: '',
      timeframe: 'all',
      location: '',
      minAmount: '',
      maxAmount: '',
      hasVerification: false,
      isEmergency: false
    };
    setFilters(resetFilters);
    setSearchQuery('');
  }, []);

  // Handle sorting
  const handleSortChange = useCallback((sort) => {
    setCurrentSort(sort);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    // Simulate loading more campaigns
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCampaigns(prev => [...prev, ...moreMockCampaigns]);
    
    setCurrentPage(prev => prev + 1);
    // In a real app, you would fetch more campaigns here
    setHasMore(false); // For demo, disable after first load
  }, []);

  // Handle wallet connection - now using real MeshJS wallet
  const handleWalletConnect = useCallback(async (walletName) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect]);

  const handleWalletDisconnect = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  // Handle quick donate
  const handleQuickDonate = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setIsDonateModalOpen(true);
  }, []);

  const handleDonate = useCallback(async (donationData) => {
    // Simulate donation processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update campaign with new donation
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === donationData.campaignId 
        ? {
            ...campaign,
            currentAmount: campaign.currentAmount + donationData.amount,
            donorCount: campaign.donorCount + 1
          }
        : campaign
    ));

    // Note: Wallet balance will be updated automatically by the wallet context
  }, []);

  const handleLogout = useCallback(() => {
    // Handle logout logic
    navigate('/user-registration-login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        walletConnected={isConnected}
        walletBalance={walletInfo ? formatBalance(walletInfo.balance) : 0}
        onWalletConnect={handleWalletConnect}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Discover Medical Campaigns
              </h1>
              <p className="text-muted-foreground">
                Support verified medical fundraising campaigns and make a difference in patients' lives
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <WalletConnectionIndicator
                isConnected={isConnected}
                balance={walletInfo ? formatBalance(walletInfo.balance) : 0}
                walletAddress={walletInfo ? walletInfo.address : ""}
                onWalletConnect={handleWalletConnect}
                onWalletDisconnect={handleWalletDisconnect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/patient-campaign-creation')}
                iconName="Plus"
                iconPosition="left"
              >
                Create Campaign
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-6">
          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            isLoading={isLoading}
          />

          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                iconName="Filter"
                iconPosition="left"
                className="sm:w-auto"
              >
                Filters
              </Button>
              <SortDropdown
                currentSort={currentSort}
                onSortChange={handleSortChange}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Active Filter Chips */}
          <FilterChips
            activeFilters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />

          {/* Filter Panel */}
          {isFilterPanelOpen && (
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={isFilterPanelOpen}
              onClose={() => setIsFilterPanelOpen(false)}
            />
          )}
        </div>

        {/* Campaign Grid */}
        <div className="mt-8">
          <CampaignGrid
            campaigns={filteredCampaigns}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onQuickDonate={handleQuickDonate}
          />
        </div>
      </div>

      {/* Quick Donate Modal */}
      <QuickDonateModal
        campaign={selectedCampaign}
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        onDonate={handleDonate}
        walletConnected={isConnected}
        onConnectWallet={handleWalletConnect}
      />
    </div>
  );
};

export default CampaignDiscoveryDashboard;