import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import VerificationStatusBadge from '../../../components/ui/VerificationStatusBadge';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ 
  user, 
  onEditProfile = () => {},
  onUploadAvatar = () => {}
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadAvatar(file);
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'patient': return 'bg-primary/10 text-primary border-primary/20';
      case 'donor': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'hospital': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'patient': return 'User';
      case 'donor': return 'Heart';
      case 'hospital': return 'Building2';
      default: return 'User';
    }
  };

  return (
    <div className="bg-card border border-border rounded-medical p-6 shadow-medical-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-background shadow-medical-md">
            <Image
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={`${user?.name}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Upload Overlay */}
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Icon 
                name={isUploading ? "Loader2" : "Camera"} 
                size={20} 
                color="white"
                className={isUploading ? "animate-spin" : ""}
              />
            </label>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {user?.name}
                </h1>
                <VerificationStatusBadge
                  status={user?.verificationStatus}
                  verifierName={user?.verifierName}
                  verificationDate={user?.verificationDate}
                  size="sm"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-medical border text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
                  <Icon name={getRoleIcon(user?.role)} size={14} />
                  <span className="capitalize">{user?.role}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Member since {new Date(user.joinDate)?.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {user?.email}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                iconName="Edit"
                iconPosition="left"
              >
                Edit Profile
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                iconName="Settings"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {user?.role === 'patient' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user?.stats?.campaignsCreated}</div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{user?.stats?.totalRaised?.toLocaleString()} ADA</div>
                <div className="text-sm text-muted-foreground">Raised</div>
              </div>
            </>
          )}
          
          {user?.role === 'donor' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{user?.stats?.totalDonated?.toLocaleString()} ADA</div>
                <div className="text-sm text-muted-foreground">Donated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user?.stats?.campaignsSupported}</div>
                <div className="text-sm text-muted-foreground">Campaigns</div>
              </div>
            </>
          )}
          
          {user?.role === 'hospital' && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{user?.stats?.campaignsVerified}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user?.stats?.pendingReviews}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </>
          )}
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{user?.stats?.trustScore}</div>
            <div className="text-sm text-muted-foreground">Trust Score</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{user?.stats?.profileViews}</div>
            <div className="text-sm text-muted-foreground">Profile Views</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;