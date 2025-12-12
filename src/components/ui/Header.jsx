import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import WalletConnector from '../WalletConnector';
// import { useWallet } from '../../context/WalletContext';

const Header = ({
  userRole = null,
  isAuthenticated = false,
  onLogout = () => { }
}) => {
  // const { isConnected, wallet } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Discover',
      path: '/campaign-discovery-dashboard',
      icon: 'Search',
      roles: ['all']
    },
    {
      label: 'Create Campaign',
      path: '/patient-campaign-creation',
      icon: 'Plus',
      roles: ['patient', 'authenticated']
    },
    {
      label: 'Verify',
      path: '/hospital-verification-dashboard',
      icon: 'Shield',
      roles: ['hospital']
    },
    {
      label: 'Profile',
      path: '/user-profile-wallet-management',
      icon: 'User',
      roles: ['authenticated']
    }
  ];

  const isItemVisible = (item) => {
    if (item?.roles?.includes('all')) return true;
    if (!isAuthenticated && item?.roles?.includes('authenticated')) return false;
    if (isAuthenticated && item?.roles?.includes('authenticated')) return true;
    return item?.roles?.includes(userRole);
  };

  const visibleItems = navigationItems?.filter(isItemVisible);

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event?.target?.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const WalletSection = () => (
    <WalletConnector />
  );

  const Logo = () => (
    <Link to="/" className="flex items-center space-x-2 group">
      <img src="/aidpod-logo.png" alt="AidPod Logo" className="w-8 h-8 object-contain" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[hsl(199,89%,48%)] group-hover:to-[hsl(166,72%,40%)] transition-all duration-200">
          AidPod
        </span>
        <span className="text-xs text-muted-foreground -mt-1">
          Trusted Medical Funding
        </span>
      </div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-navigation bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-medical text-sm font-medium transition-all duration-200 ${isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground shadow-medical-sm'
                  : 'text-muted-foreground hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[hsl(199,89%,48%)] hover:to-[hsl(166,72%,40%)] hover:bg-muted/10'
                  }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <WalletSection />

            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-medical hover:bg-muted transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-trust rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} color="var(--color-primary)" />
                  </div>
                  <Icon name="ChevronDown" size={16} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-medical shadow-medical-lg z-dropdown">
                    <div className="py-1">
                      <Link
                        to="/user-profile-wallet-management"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Icon name="Settings" size={16} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/user-registration-login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <WalletSection />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-medical hover:bg-muted transition-colors duration-200"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="py-4 space-y-2">
              {visibleItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-medical text-sm font-medium transition-all duration-200 ${isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-[hsl(199,89%,48%)] hover:to-[hsl(166,72%,40%)] hover:bg-muted/10'
                    }`}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                </Link>
              ))}

              <div className="border-t border-border pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/user-profile-wallet-management"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-medical"
                    >
                      <Icon name="Settings" size={18} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-medical"
                    >
                      <Icon name="LogOut" size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/user-registration-login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-primary hover:bg-muted rounded-medical font-medium"
                  >
                    <Icon name="LogIn" size={18} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;