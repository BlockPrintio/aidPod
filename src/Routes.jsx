import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import NotAuthorized from "pages/NotAuthorized";
import ProtectedRoute from "components/routing/ProtectedRoute";
import Landing from './pages/Landing';
import CampaignDetailsAndDonation from './pages/campaign-details-donation';
import HospitalVerificationDashboard from './pages/hospital-verification-dashboard';
import PatientCampaignCreation from './pages/patient-campaign-creation';
import UserProfileWalletManagement from './pages/user-profile-wallet-management';
import CampaignDiscoveryDashboard from './pages/campaign-discovery-dashboard';
import UserRegistrationLogin from './pages/user-registration-login';

import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Campaign Discovery */}
        <Route path="/campaign-discovery-dashboard" element={<CampaignDiscoveryDashboard />} />
        <Route path="/campaign-details-donation" element={<CampaignDetailsAndDonation />} />
        
        {/* MeshJS Routes */}
        <Route path="/create-campaign" element={<CreateCampaign />} />
        <Route path="/campaign/:campaignId" element={<CampaignDetailsPage />} />
        
        {/* Hospital Dashboard */}
        <Route
          path="/hospital-verification-dashboard"
          element={<HospitalVerificationDashboard />}
        />
        
        {/* Patient Campaign Creation */}
        <Route
          path="/patient-campaign-creation"
          element={<PatientCampaignCreation />}
        />
        
        {/* User Profile */}
        <Route
          path="/user-profile-wallet-management"
          element={<UserProfileWalletManagement />}
        />
        
        {/* Authentication */}
        <Route path="/user-registration-login" element={<UserRegistrationLogin />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
