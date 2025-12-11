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
    name: "Dr. Sarah Mitchell",
    title: "Chief Medical Officer",
    institution: "Metropolitan General Hospital",
    licenseNumber: "MD-2019-8847",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face"
  };

  // Mock verification requests data
  const mockRequests = [
    {
      id: "VR-2024-001",
      campaignId: "MC-8847",
      patientName: "Emily Rodriguez",
      patientPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      age: 34,
      condition: "Acute Lymphoblastic Leukemia",
      location: "Phoenix, Arizona",
      contactInfo: "emily.rodriguez@email.com",
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
      treatingPhysician: "Dr. Michael Chen, Oncology",
      hospitalName: "Phoenix Cancer Center",
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
      patientName: "James Thompson",
      patientPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      age: 28,
      condition: "Spinal Cord Injury - T12 Complete",
      location: "Denver, Colorado",
      contactInfo: "j.thompson@email.com",
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
      treatingPhysician: "Dr. Lisa Park, Neurosurgery",
      hospitalName: "Denver Rehabilitation Institute",
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
      patientName: "Maria Santos",
      patientPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      age: 42,
      condition: "Congenital Heart Disease - Tetralogy of Fallot",
      location: "Miami, Florida",
      contactInfo: "maria.santos@email.com",
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
      treatingPhysician: "Dr. Robert Kim, Cardiac Surgery",
      hospitalName: "Miami Heart Institute",
      treatmentTimeline: "Surgery scheduled within 6 months",
      costBreakdown: [
        { description: "Cardiac Surgery", amount: 120000 },
        { description: "ICU Care", amount: 35000 },
        { description: "Pre-operative Testing", amount: 15000 },
        { description: "Post-operative Care", amount: 10000 }
      ]
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