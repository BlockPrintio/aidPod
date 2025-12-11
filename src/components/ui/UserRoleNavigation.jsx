import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const UserRoleNavigation = ({
  userRole = null,
  isAuthenticated = false,
  className = ''
}) => {
  const location = useLocation();

  const navigationConfig = {
    patient: [
      {
        label: 'Discover Campaigns',
        path: '/campaign-discovery-dashboard',
        icon: 'Search',
        description: 'Browse and support medical campaigns'
      },
      {
        label: 'Create Campaign',
        path: '/patient-campaign-creation',
        icon: 'Plus',
        description: 'Start your medical fundraising campaign'
      },
      {
        label: 'My Profile',
        path: '/user-profile-wallet-management',
        icon: 'User',
        description: 'Manage account and wallet settings'
      }
    ],
    donor: [
      {
        label: 'Discover Campaigns',
        path: '/campaign-discovery-dashboard',
        icon: 'Search',
        description: 'Find campaigns to support'
      },
      {
        label: 'Campaign Details',
        path: '/campaign-details-donation',
        icon: 'Heart',
        description: 'View campaign information and donate'
      },
      {
        label: 'My Profile',
        path: '/user-profile-wallet-management',
        icon: 'User',
        description: 'Track donations and manage wallet'
      }
    ],
    hospital: [
      {
        label: 'Verification Dashboard',
        path: '/hospital-verification-dashboard',
        icon: 'Shield',
        description: 'Review and verify medical campaigns'
      },
      {
        label: 'Discover Campaigns',
        path: '/campaign-discovery-dashboard',
        icon: 'Search',
        description: 'Browse all campaigns for verification'
      },
      {
        label: 'My Profile',
        path: '/user-profile-wallet-management',
        icon: 'User',
        description: 'Manage institutional account'
      }
    ],
    public: [
      {
        label: 'Discover Campaigns',
        path: '/campaign-discovery-dashboard',
        icon: 'Search',
        description: 'Browse medical fundraising campaigns'
      },
      {
        label: 'Sign In',
        path: '/user-registration-login',
        icon: 'LogIn',
        description: 'Access your account or create new one'
      }
    ]
  };

  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return navigationConfig?.public;
    }
    return navigationConfig?.[userRole] || navigationConfig?.public;
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className={`space-y-1 ${className}`}>
      {navigationItems?.map((item) => (
        <Link
          key={item?.path}
          to={item?.path}
          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-medical transition-all duration-200 ${
            isActivePath(item?.path)
              ? 'bg-primary text-primary-foreground shadow-medical-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Icon 
            name={item?.icon} 
            size={18} 
            className="mr-3 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="truncate">{item?.label}</div>
            {item?.description && (
              <div className={`text-xs mt-0.5 truncate ${
                isActivePath(item?.path)
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground/80'
              }`}>
                {item?.description}
              </div>
            )}
          </div>
          {isActivePath(item?.path) && (
            <div className="w-1 h-6 bg-primary-foreground rounded-full ml-2"></div>
          )}
        </Link>
      ))}
    </nav>
  );
};

export default UserRoleNavigation;