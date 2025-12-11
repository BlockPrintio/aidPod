import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasAnyRole } from '../../auth';

interface ProtectedRouteProps {
  roles?: string[];
  element: React.ReactElement;
}

// Usage: <ProtectedRoute roles={["donor"]} element={<Dashboard/>} />
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles = [], element }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/user-registration-login" replace state={{ from: location }} />;
  }

  if (!hasAnyRole(roles)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return element;
};

export default ProtectedRoute;

