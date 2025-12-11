import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import VerificationRequestCard from './components/VerificationRequestCard';
import VerificationFilters from './components/VerificationFilters';
import VerificationModal from './components/VerificationModal';
import VerificationStats from './components/VerificationStats';
import BulkActions from './components/BulkActions';

const HospitalVerificationDashboard = () => {
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    urgency: 'all',
    status: 'pending',
    specialty: 'all',
    sortBy: 'newest',
    minAmount: 0,
    maxAmount: 0,
    submittedAfter: '',
    submittedBefore: ''
  });
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock verifier information
  const verifierInfo = {
    name: "Dr. Ngozi Adebayo",
    title: "Chief Medical Officer",
    institution: "Lagos University Teaching Hospital",
    licenseNumber: "MD-2019-8847",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face"
  };

  // Mock verification requests data
  const mockRequests = [
    {
      id: "VR-2024-001",
      campaignId: "MC-8847",
      patientName: "Chioma Okeke",
      specialty: "oncology",
      patientPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
      age: 34,
      condition: "Acute Lymphoblastic Leukemia",
      location: "Lagos, Nigeria",
      contactInfo: "chioma.okeke@email.com",
      targetAmount: 125000,
      urgency: "critical",
      status: "pending",
      priority: "High",
      documentsCount: 8,
      submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      medicalSummary: `Patient diagnosed with Acute Lymphoblastic Leukemia requiring immediate chemotherapy treatment. Current condition is stable but requires urgent intervention to prevent progression. Treatment plan includes 6 months of intensive chemotherapy followed by maintenance therapy.`,
      treatmentPlan: "Intensive chemotherapy protocol including Vincristine, Daunorubicin, and L-asparaginase. Treatment duration: 6-8 months with regular monitoring.",
      documentTypes: ["Medical Records", "Lab Results", "Treatment Plan", "Insurance Documents"],
      diagnosisCode: "C91.0",
      treatingPhysician: "Dr. Babatunde Fashola, Oncology",
      hospitalName: "Lagos University Teaching Hospital",
      treatmentTimeline: "Immediate start required, 6-8 months duration",
      costBreakdown: [
        { description: "Chemotherapy Treatment", amount: 85000 },
        { description: "Hospital Stay", amount: 25000 },
        { description: "Laboratory Tests", amount: 8000 },
        { description: "Medications", amount: 7000 }
      ],
      documents: [
        {
          name: "Medical_History_Complete.pdf",
          type: "Medical Records",
          size: "2.4 MB",
          uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          name: "Lab_Results_Latest.pdf",
          type: "Laboratory",
          size: "1.8 MB",
          uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: "VR-2024-002",
      campaignId: "MC-8848",
      patientName: "Emeka Okafor",
      specialty: "neurology",
      patientPhoto: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face",
      age: 28,
      condition: "Spinal Cord Injury - T12 Complete",
      location: "Abuja, Nigeria",
      contactInfo: "emeka.okafor@email.com",
      targetAmount: 95000,
      urgency: "high",
      status: "in_review",
      priority: "Medium",
      documentsCount: 12,
      submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      medicalSummary: `Patient sustained complete T12 spinal cord injury in motor vehicle accident. Requires extensive rehabilitation therapy and adaptive equipment. Current mobility is wheelchair-dependent with good upper body function.`,
      treatmentPlan: "Comprehensive rehabilitation program including physical therapy, occupational therapy, and psychological support. Duration: 12-18 months.",
      documentTypes: ["MRI Scans", "Surgical Reports", "Rehabilitation Plan", "Insurance Claims", "Therapy Notes"],
      diagnosisCode: "S34.109A",
      treatingPhysician: "Dr. Zainab Ahmed, Neurosurgery",
      hospitalName: "National Hospital Abuja",
      treatmentTimeline: "Ongoing rehabilitation, 12-18 months",
      costBreakdown: [
        { description: "Rehabilitation Therapy", amount: 55000 },
        { description: "Adaptive Equipment", amount: 25000 },
        { description: "Home Modifications", amount: 15000 }
      ]
    },
    {
      id: "VR-2024-003",
      campaignId: "MC-8849",
      patientName: "Funke Adebayo",
      specialty: "cardiology",
      patientPhoto: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&crop=face",
      age: 42,
      condition: "Congenital Heart Disease - Tetralogy of Fallot",
      location: "Ibadan, Nigeria",
      contactInfo: "funke.adebayo@email.com",
      targetAmount: 180000,
      urgency: "medium",
      status: "pending",
      priority: "High",
      documentsCount: 15,
      submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      medicalSummary: `Adult patient with uncorrected Tetralogy of Fallot requiring complex cardiac surgery. Current symptoms include severe cyanosis, exercise intolerance, and declining cardiac function. Surgery is elective but recommended within 6 months.`,
      treatmentPlan: "Complete intracardiac repair including VSD closure and pulmonary valve replacement. Pre-operative cardiac catheterization required.",
      documentTypes: ["Echocardiogram", "Cardiac Catheterization", "CT Angiography", "Surgical Consultation", "Anesthesia Clearance"],
      diagnosisCode: "Q21.3",
      treatingPhysician: "Dr. Segun Oladipo, Cardiac Surgery",
      hospitalName: "University College Hospital",
      treatmentTimeline: "Surgery scheduled within 6 months",
      costBreakdown: [
        { description: "Cardiac Surgery", amount: 120000 },
        { description: "ICU Care", amount: 35000 },
        { description: "Pre-operative Testing", amount: 15000 },
        { description: "Post-operative Care", amount: 10000 }
      ]
    },
    {
      id: "VR-2024-004",
      campaignId: "MC-8850",
      patientName: "Musa Ibrahim",
      specialty: "orthopedics",
      patientPhoto: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop&crop=face",
      age: 55,
      condition: "Osteoarthritis - Total Knee Replacement",
      location: "Kano, Nigeria",
      contactInfo: "musa.ibrahim@email.com",
      targetAmount: 45000,
      urgency: "low",
      status: "pending",
      priority: "Low",
      documentsCount: 5,
      submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      medicalSummary: "Severe osteoarthritis in both knees causing significant mobility issues.",
      treatmentPlan: "Bilateral total knee replacement surgery.",
      documentTypes: ["X-Rays", "Surgical Referral"],
      diagnosisCode: "M17.0",
      treatingPhysician: "Dr. Aminu Kano",
      hospitalName: "Aminu Kano Teaching Hospital",
      treatmentTimeline: "Surgery within 3 months",
      costBreakdown: [{ description: "Surgery", amount: 45000 }]
    },
    {
      id: "VR-2024-005",
      campaignId: "MC-8851",
      patientName: "Nneka Onwudiwe",
      specialty: "emergency",
      patientPhoto: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=100&h=100&fit=crop&crop=face",
      age: 29,
      condition: "Multiple Trauma - Car Accident",
      location: "Enugu, Nigeria",
      contactInfo: "nneka.onwudiwe@email.com",
      targetAmount: 250000,
      urgency: "critical",
      status: "in_review",
      priority: "High",
      documentsCount: 20,
      submittedDate: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now()),
      medicalSummary: "Critical condition following severe car accident. Multiple fractures and internal bleeding.",
      treatmentPlan: "Emergency surgery and ICU care.",
      documentTypes: ["Trauma Report", "CT Scans"],
      diagnosisCode: "T07",
      treatingPhysician: "Dr. Chike Obi",
      hospitalName: "University of Nigeria Teaching Hospital",
      treatmentTimeline: "Immediate and ongoing",
      costBreakdown: [{ description: "Emergency Care", amount: 250000 }]
    },
    {
      id: "VR-2024-006",
      campaignId: "MC-8852",
      patientName: "Tunde Bakare",
      specialty: "pediatrics",
      patientPhoto: "https://images.unsplash.com/photo-1504199367641-aba8151af406?w=100&h=100&fit=crop&crop=face",
      age: 8,
      condition: "Cystic Fibrosis",
      location: "Port Harcourt, Nigeria",
      contactInfo: "parents.bakare@email.com",
      targetAmount: 60000,
      urgency: "medium",
      status: "verified",
      priority: "Medium",
      documentsCount: 10,
      submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      medicalSummary: "Genetic disorder affecting lungs and digestive system.",
      treatmentPlan: "Ongoing medication and therapy.",
      documentTypes: ["Genetic Test", "Pulmonary Function Test"],
      diagnosisCode: "E84.0",
      treatingPhysician: "Dr. Joy Eke",
      hospitalName: "University of Port Harcourt Teaching Hospital",
      treatmentTimeline: "Chronic management",
      costBreakdown: [{ description: "Annual Medication", amount: 60000 }]
    },
    {
      id: "VR-2024-007",
      campaignId: "MC-8853",
      patientName: "Aisha Mohammed",
      specialty: "surgery",
      patientPhoto: "https://images.unsplash.com/photo-1534030347209-7147fd2e7a3c?w=100&h=100&fit=crop&crop=face",
      age: 45,
      condition: "Herniated Disc",
      location: "Kaduna, Nigeria",
      contactInfo: "aisha.mohammed@email.com",
      targetAmount: 30000,
      urgency: "low",
      status: "rejected",
      priority: "Low",
      documentsCount: 4,
      submittedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      medicalSummary: "Chronic back pain due to herniated disc.",
      treatmentPlan: "Microdiscectomy recommended.",
      documentTypes: ["MRI"],
      diagnosisCode: "M51.2",
      treatingPhysician: "Dr. Yusuf Bello",
      hospitalName: "Ahmadu Bello University Teaching Hospital",
      treatmentTimeline: "Elective",
      costBreakdown: [{ description: "Surgery", amount: 30000 }]
    },
    {
      id: "VR-2024-008",
      campaignId: "MC-8854",
      patientName: "Kelechi Iheanacho",
      specialty: "other",
      patientPhoto: "https://images.unsplash.com/photo-1522512115668-c09775d6f424?w=100&h=100&fit=crop&crop=face",
      age: 22,
      condition: "Rare Autoimmune Disorder",
      location: "Owerri, Nigeria",
      contactInfo: "kelechi.i@email.com",
      targetAmount: 85000,
      urgency: "high",
      status: "pending",
      priority: "High",
      documentsCount: 14,
      submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      medicalSummary: "Undiagnosed autoimmune condition causing systemic inflammation.",
      treatmentPlan: "Investigative immunotherapy.",
      documentTypes: ["Blood Work", "Specialist Referrals"],
      diagnosisCode: "D89.9",
      treatingPhysician: "Dr. Ngozi Okonjo",
      hospitalName: "Federal Medical Centre Owerri",
      treatmentTimeline: "Urgent investigation",
      costBreakdown: [{ description: "Immunotherapy", amount: 85000 }]
    },
    {
      id: "VR-2024-009",
      campaignId: "MC-8855",
      patientName: "Bayo Ogunlesi",
      specialty: "emergency",
      patientPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
      age: 40,
      condition: "Severe Trauma",
      location: "Benin City, Nigeria",
      contactInfo: "bayo.o@email.com",
      targetAmount: 500000,
      urgency: "critical",
      status: "verified",
      priority: "High",
      documentsCount: 25,
      submittedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      medicalSummary: "Multiple injuries sustained from fall.",
      treatmentPlan: "Reconstructive surgery and rehabilitation.",
      documentTypes: ["X-Rays", "CT Scans"],
      diagnosisCode: "T14.9",
      treatingPhysician: "Dr. Osagie Ehanire",
      hospitalName: "University of Benin Teaching Hospital",
      treatmentTimeline: "Long-term recovery",
      costBreakdown: [{ description: "Surgery & Rehab", amount: 500000 }]
    },
    {
      id: "VR-2024-010",
      campaignId: "MC-8856",
      patientName: "Folake Coker",
      specialty: "other",
      patientPhoto: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=100&h=100&fit=crop&crop=face",
      age: 35,
      condition: "Vision Correction",
      location: "Jos, Nigeria",
      contactInfo: "folake.coker@email.com",
      targetAmount: 5000,
      urgency: "low",
      status: "pending",
      priority: "Low",
      documentsCount: 2,
      submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now()),
      medicalSummary: "Laser eye surgery for vision correction.",
      treatmentPlan: "LASIK procedure.",
      documentTypes: ["Eye Exam"],
      diagnosisCode: "H52.1",
      treatingPhysician: "Dr. Yakubu Dogara",
      hospitalName: "Jos University Teaching Hospital",
      treatmentTimeline: "One day procedure",
      costBreakdown: [{ description: "Surgery", amount: 5000 }]
    },
    {
      id: "VR-2024-011",
      campaignId: "MC-8857",
      patientName: "Yemi Alade",
      specialty: "orthopedics",
      patientPhoto: "https://images.unsplash.com/photo-1542596594-649edbc13630?w=100&h=100&fit=crop&crop=face",
      age: 30,
      condition: "Sports Injury",
      location: "Calabar, Nigeria",
      contactInfo: "yemi.alade@email.com",
      targetAmount: 40000,
      urgency: "medium",
      status: "in_review",
      priority: "Medium",
      documentsCount: 6,
      submittedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      medicalSummary: "Torn ACL from athletic activity.",
      treatmentPlan: "ACL reconstruction surgery.",
      documentTypes: ["MRI", "PT Eval"],
      diagnosisCode: "S83.5",
      treatingPhysician: "Dr. Donald Duke",
      hospitalName: "University of Calabar Teaching Hospital",
      treatmentTimeline: "Surgery and 6 months rehab",
      costBreakdown: [{ description: "Surgery", amount: 40000 }]
    },
    {
      id: "VR-2024-012",
      campaignId: "MC-8858",
      patientName: "Femi Kuti",
      specialty: "cardiology",
      patientPhoto: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=100&h=100&fit=crop&crop=face",
      age: 26,
      condition: "Arrhythmia",
      location: "Abeokuta, Nigeria",
      contactInfo: "femi.kuti@email.com",
      targetAmount: 90000,
      urgency: "high",
      status: "pending",
      priority: "High",
      documentsCount: 8,
      submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      medicalSummary: "Severe cardiac arrhythmia requiring ablation.",
      treatmentPlan: "Catheter ablation procedure.",
      documentTypes: ["ECG", "Holter Monitor"],
      diagnosisCode: "I47.9",
      treatingPhysician: "Dr. Olusegun Obasanjo",
      hospitalName: "Federal Medical Centre Abeokuta",
      treatmentTimeline: "Immediate intervention",
      costBreakdown: [{ description: "Ablation", amount: 90000 }]
    }
  ];

  // Mock statistics
  const mockStats = {
    pendingReviews: 23,
    verifiedToday: 8,
    totalVerified: 156,
    fundsVerified: 2450000,
    pendingChange: 12,
    verifiedChange: 25,
    totalChange: 8,
    fundsChange: 15
  };

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setVerificationRequests(mockRequests);
        setStats(mockStats);
      } catch (error) {
        console.error('Error loading verification requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...verificationRequests];

    // Search filter
    if (filters?.search?.trim()) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(request =>
        request?.patientName?.toLowerCase()?.includes(searchTerm) ||
        request?.condition?.toLowerCase()?.includes(searchTerm) ||
        request?.campaignId?.toLowerCase()?.includes(searchTerm)
      );
    }

    // Status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(request => request?.status === filters?.status);
    }

    // Specialty filter
    if (filters?.specialty !== 'all') {
      filtered = filtered?.filter(request => request?.specialty?.toLowerCase() === filters?.specialty?.toLowerCase());
    }

    // Urgency filter
    if (filters?.urgency !== 'all') {
      filtered = filtered?.filter(request => request?.urgency === filters?.urgency);
    }

    // Amount filters
    if (filters?.minAmount > 0) {
      filtered = filtered?.filter(request => request?.targetAmount >= filters?.minAmount);
    }
    if (filters?.maxAmount > 0) {
      filtered = filtered?.filter(request => request?.targetAmount <= filters?.maxAmount);
    }

    // Date filters
    if (filters?.submittedAfter) {
      const afterDate = new Date(filters.submittedAfter);
      filtered = filtered?.filter(request => new Date(request.submittedDate) >= afterDate);
    }
    if (filters?.submittedBefore) {
      const beforeDate = new Date(filters.submittedBefore);
      filtered = filtered?.filter(request => new Date(request.submittedDate) <= beforeDate);
    }

    // Sort
    switch (filters?.sortBy) {
      case 'newest':
        filtered?.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
        break;
      case 'oldest':
        filtered?.sort((a, b) => new Date(a.submittedDate) - new Date(b.submittedDate));
        break;
      case 'urgency':
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        filtered?.sort((a, b) => urgencyOrder?.[b?.urgency] - urgencyOrder?.[a?.urgency]);
        break;
      case 'amount_high':
        filtered?.sort((a, b) => b?.targetAmount - a?.targetAmount);
        break;
      case 'amount_low':
        filtered?.sort((a, b) => a?.targetAmount - b?.targetAmount);
        break;
      default:
        break;
    }

    setFilteredRequests(filtered);
  }, [verificationRequests, filters]);

  const handleReviewRequest = (request) => {
    setSelectedModal(request);
  };

  const handleQuickApprove = async (requestId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVerificationRequests(prev =>
        prev?.map(req =>
          req?.id === requestId
            ? { ...req, status: 'verified', lastUpdated: new Date() }
            : req
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingReviews: prev?.pendingReviews - 1,
        verifiedToday: prev?.verifiedToday + 1,
        totalVerified: prev?.totalVerified + 1
      }));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleQuickReject = async (requestId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVerificationRequests(prev =>
        prev?.map(req =>
          req?.id === requestId
            ? { ...req, status: 'rejected', lastUpdated: new Date() }
            : req
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingReviews: prev?.pendingReviews - 1
      }));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleApproveRequest = async (requestId, notes) => {
    await handleQuickApprove(requestId);
  };

  const handleRejectRequest = async (requestId, notes) => {
    await handleQuickReject(requestId);
  };

  const handleBulkAction = async (action, requestIds) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'approve') {
        setVerificationRequests(prev =>
          prev?.map(req =>
            requestIds?.includes(req?.id)
              ? { ...req, status: 'verified', lastUpdated: new Date() }
              : req
          )
        );
      } else if (action === 'reject') {
        setVerificationRequests(prev =>
          prev?.map(req =>
            requestIds?.includes(req?.id)
              ? { ...req, status: 'rejected', lastUpdated: new Date() }
              : req
          )
        );
      }
      
      setSelectedRequests([]);
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const handleRequestSelection = (requestId, isSelected) => {
    if (isSelected) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev?.filter(id => id !== requestId));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      urgency: 'all',
      status: 'all',
      specialty: 'all',
      sortBy: 'newest',
      minAmount: 0,
      maxAmount: 0,
      submittedAfter: '',
      submittedBefore: ''
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          userRole="hospital"
          isAuthenticated={true}
          walletConnected={true}
          walletBalance={1250.75}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-lg font-medium text-foreground">Loading verification dashboard...</div>
            <div className="text-sm text-muted-foreground">Fetching pending verification requests</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="hospital"
        isAuthenticated={true}
        walletConnected={true}
        walletBalance={1250.75}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Verification Dashboard
              </h1>
              <p className="text-muted-foreground">
                Review and verify medical fundraising campaigns
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-card border border-border rounded-medical px-4 py-2">
                <Image
                  src={verifierInfo?.avatar}
                  alt={verifierInfo?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <div className="font-medium text-card-foreground">{verifierInfo?.name}</div>
                  <div className="text-muted-foreground">{verifierInfo?.title}</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                iconName="Settings"
                iconPosition="left"
                asChild
              >
                <Link to="/user-profile-wallet-management">
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <VerificationStats stats={stats} className="mb-8" />

        {/* Filters */}
        <VerificationFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
          totalRequests={verificationRequests?.length}
          filteredCount={filteredRequests?.length}
          className="mb-6"
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedRequests={selectedRequests}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedRequests([])}
          className="mb-6"
        />

        {/* Verification Requests */}
        <div className="space-y-6">
          {filteredRequests?.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Verification Requests ({filteredRequests?.length})
                </h2>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRequests(
                      selectedRequests?.length === filteredRequests?.length 
                        ? [] 
                        : filteredRequests?.map(req => req?.id)
                    )}
                    iconName={selectedRequests?.length === filteredRequests?.length ? "Square" : "CheckSquare"}
                    iconPosition="left"
                  >
                    {selectedRequests?.length === filteredRequests?.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {filteredRequests?.map((request) => (
                  <div key={request?.id} className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedRequests?.includes(request?.id)}
                        onChange={(e) => handleRequestSelection(request?.id, e?.target?.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                      />
                    </div>
                    <VerificationRequestCard
                      request={request}
                      onReview={handleReviewRequest}
                      onQuickApprove={handleQuickApprove}
                      onQuickReject={handleQuickReject}
                      className="ml-12"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Icon name="FileSearch" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No verification requests found
              </h3>
              <p className="text-muted-foreground mb-6">
                {verificationRequests?.length === 0
                  ? "There are no pending verification requests at this time."
                  : "Try adjusting your filters to see more results."
                }
              </p>
              {verificationRequests?.length > 0 && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Verification Modal */}
      <VerificationModal
        request={selectedModal}
        isOpen={!!selectedModal}
        onClose={() => setSelectedModal(null)}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        verifierInfo={verifierInfo}
      />
    </div>
  );
};

export default HospitalVerificationDashboard;