import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleStats = ({ user }) => {
  if (!user?.role || !user?.stats) return null;

  const getRoleSpecificStats = () => {
    switch (user.role) {
      case 'patient':
        return [
          {
            label: 'Campaigns Created',
            value: user.stats.campaignsCreated,
            icon: 'Target'
          },
          {
            label: 'Total Raised',
            value: `${user.stats.totalRaised} ADA`,
            icon: 'TrendingUp'
          }
        ];
      case 'donor':
        return [
          {
            label: 'Total Donated',
            value: `${user.stats.totalDonated} ADA`,
            icon: 'Heart'
          },
          {
            label: 'Campaigns Supported',
            value: user.stats.campaignsSupported,
            icon: 'Helping'
          }
        ];
      case 'hospital':
        return [
          {
            label: 'Campaigns Verified',
            value: user.stats.campaignsVerified,
            icon: 'ShieldCheck'
          },
          {
            label: 'Pending Reviews',
            value: user.stats.pendingReviews,
            icon: 'ClipboardList'
          }
        ];
      default:
        return [];
    }
  };

  const roleStats = getRoleSpecificStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {roleStats.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-medical p-4 flex items-center space-x-4"
        >
          <div className="p-3 bg-primary/10 rounded-medical">
            <Icon name={stat.icon} size={24} className="text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-lg font-semibold text-foreground">{stat.value}</div>
          </div>
        </div>
      ))}
      <div className="bg-card border border-border rounded-medical p-4 flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-medical">
          <Icon name="Star" size={24} className="text-primary" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Trust Score</div>
          <div className="text-lg font-semibold text-foreground">{user.stats.trustScore || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default RoleStats;