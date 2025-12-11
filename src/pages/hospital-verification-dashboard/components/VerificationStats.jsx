import React from 'react';
import Icon from '../../../components/AppIcon';

const VerificationStats = ({
  stats,
  className = ''
}) => {
  const statCards = [
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: stats?.pendingChange || 0,
      description: 'Awaiting verification'
    },
    {
      title: 'Verified Today',
      value: stats?.verifiedToday || 0,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: stats?.verifiedChange || 0,
      description: 'Campaigns approved'
    },
    {
      title: 'Total Verified',
      value: stats?.totalVerified || 0,
      icon: 'Shield',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: stats?.totalChange || 0,
      description: 'All time approvals'
    },
    {
      title: 'Funds Verified',
      value: `${(stats?.fundsVerified || 0)?.toLocaleString()} ADA`,
      icon: 'DollarSign',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      change: stats?.fundsChange || 0,
      description: 'Total amount approved'
    }
  ];

  const formatChange = (change) => {
    if (change === 0) return null;
    const isPositive = change > 0;
    return (
      <div className={`flex items-center space-x-1 text-xs ${
        isPositive ? 'text-success' : 'text-error'
      }`}>
        <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={12} />
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-medical p-6 shadow-medical-sm hover:shadow-medical-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-medical ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
            {formatChange(stat?.change)}
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-card-foreground">
              {stat?.value}
            </div>
            <div className="text-sm font-medium text-card-foreground">
              {stat?.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {stat?.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerificationStats;