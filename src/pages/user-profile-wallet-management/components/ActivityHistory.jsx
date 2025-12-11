import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const ActivityHistory = ({ activities = [], userRole = 'donor' }) => {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const getFilterOptions = () => {
    const baseOptions = [{ value: 'all', label: 'All Activities' }];
    
    switch (userRole) {
      case 'patient':
        return [
          ...baseOptions,
          { value: 'campaign_created', label: 'Campaigns Created' },
          { value: 'campaign_updated', label: 'Campaign Updates' },
          { value: 'donation_received', label: 'Donations Received' },
          { value: 'verification_requested', label: 'Verification Requests' },
          { value: 'document_uploaded', label: 'Documents Uploaded' }
        ];
      case 'donor':
        return [
          ...baseOptions,
          { value: 'donation_made', label: 'Donations Made' },
          { value: 'campaign_followed', label: 'Campaigns Followed' },
          { value: 'comment_posted', label: 'Comments Posted' },
          { value: 'refund_received', label: 'Refunds Received' }
        ];
      case 'hospital':
        return [
          ...baseOptions,
          { value: 'campaign_verified', label: 'Campaigns Verified' },
          { value: 'verification_reviewed', label: 'Verifications Reviewed' },
          { value: 'document_reviewed', label: 'Documents Reviewed' },
          { value: 'credential_updated', label: 'Credentials Updated' }
        ];
      default:
        return baseOptions;
    }
  };

  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const getActivityIcon = (type) => {
    const iconMap = {
      campaign_created: 'Plus',
      campaign_updated: 'Edit',
      donation_made: 'Heart',
      donation_received: 'ArrowDownLeft',
      campaign_followed: 'Bookmark',
      campaign_verified: 'ShieldCheck',
      verification_requested: 'Clock',
      verification_reviewed: 'Eye',
      document_uploaded: 'Upload',
      document_reviewed: 'FileCheck',
      comment_posted: 'MessageCircle',
      refund_received: 'RotateCcw',
      credential_updated: 'Settings'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      campaign_created: 'text-primary',
      campaign_updated: 'text-warning',
      donation_made: 'text-secondary',
      donation_received: 'text-success',
      campaign_followed: 'text-accent',
      campaign_verified: 'text-success',
      verification_requested: 'text-warning',
      verification_reviewed: 'text-primary',
      document_uploaded: 'text-primary',
      document_reviewed: 'text-success',
      comment_posted: 'text-muted-foreground',
      refund_received: 'text-warning',
      credential_updated: 'text-accent'
    };
    return colorMap?.[type] || 'text-muted-foreground';
  };

  const filterActivities = () => {
    let filtered = activities;
    
    // Filter by type
    if (filter !== 'all') {
      filtered = filtered?.filter(activity => activity?.type === filter);
    }
    
    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date();
      const ranges = {
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      };
      
      const cutoff = new Date(now.getTime() - ranges[timeRange]);
      filtered = filtered?.filter(activity => new Date(activity.timestamp) >= cutoff);
    }
    
    return filtered?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const filteredActivities = filterActivities();
  const totalPages = Math.ceil(filteredActivities?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities?.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = (now - activityDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return activityDate?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: activityDate?.getFullYear() !== now?.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })?.format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          <Select
            options={getFilterOptions()}
            value={filter}
            onChange={setFilter}
            className="w-48"
          />
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-40"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
          >
            Refresh
          </Button>
        </div>
      </div>
      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="text-2xl font-bold text-foreground">
            {filteredActivities?.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Activities</div>
        </div>
        
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="text-2xl font-bold text-foreground">
            {filteredActivities?.filter(a => new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))?.length}
          </div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </div>
        
        {userRole === 'donor' && (
          <div className="bg-card border border-border rounded-medical p-4">
            <div className="text-2xl font-bold text-secondary font-mono">
              {formatAmount(filteredActivities?.filter(a => a?.type === 'donation_made')?.reduce((sum, a) => sum + (a?.amount || 0), 0)
              )} ADA
            </div>
            <div className="text-sm text-muted-foreground">Total Donated</div>
          </div>
        )}
        
        {userRole === 'patient' && (
          <div className="bg-card border border-border rounded-medical p-4">
            <div className="text-2xl font-bold text-success font-mono">
              {formatAmount(filteredActivities?.filter(a => a?.type === 'donation_received')?.reduce((sum, a) => sum + (a?.amount || 0), 0)
              )} ADA
            </div>
            <div className="text-sm text-muted-foreground">Total Received</div>
          </div>
        )}
        
        {userRole === 'hospital' && (
          <div className="bg-card border border-border rounded-medical p-4">
            <div className="text-2xl font-bold text-success">
              {filteredActivities?.filter(a => a?.type === 'campaign_verified')?.length}
            </div>
            <div className="text-sm text-muted-foreground">Campaigns Verified</div>
          </div>
        )}
        
        <div className="bg-card border border-border rounded-medical p-4">
          <div className="text-2xl font-bold text-primary">
            {new Set(filteredActivities.map(a => new Date(a.timestamp).toDateString()))?.size}
          </div>
          <div className="text-sm text-muted-foreground">Active Days</div>
        </div>
      </div>
      {/* Activity Feed */}
      <div className="bg-card border border-border rounded-medical">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Activity Feed</h3>
          <p className="text-sm text-muted-foreground">
            Showing {paginatedActivities?.length} of {filteredActivities?.length} activities
          </p>
        </div>

        {paginatedActivities?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No activities found</h4>
            <p className="text-muted-foreground">
              {filter === 'all' ? "You haven't performed any activities yet."
                : `No ${filter?.replace('_', ' ')} activities found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedActivities?.map((activity) => (
              <div key={activity?.id} className="p-6 hover:bg-muted/50 transition-colors duration-200">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-medical flex items-center justify-center bg-muted ${getActivityColor(activity?.type)}`}>
                    <Icon name={getActivityIcon(activity?.type)} size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">
                        {activity?.title}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(activity?.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {activity?.description}
                    </p>
                    
                    {/* Activity Details */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {activity?.campaignTitle && (
                        <div className="flex items-center space-x-1">
                          <Icon name="Target" size={12} />
                          <span>Campaign: {activity?.campaignTitle}</span>
                        </div>
                      )}
                      
                      {activity?.amount && (
                        <div className="flex items-center space-x-1">
                          <Icon name="DollarSign" size={12} />
                          <span className="font-mono">{formatAmount(activity?.amount)} ADA</span>
                        </div>
                      )}
                      
                      {activity?.status && (
                        <div className="flex items-center space-x-1">
                          <Icon name="Info" size={12} />
                          <span className="capitalize">{activity?.status}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Campaign Image */}
                    {activity?.campaignImage && (
                      <div className="mt-3">
                        <div className="w-16 h-16 rounded-medical overflow-hidden">
                          <Image
                            src={activity?.campaignImage}
                            alt={activity?.campaignTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  iconName="ChevronLeft"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;