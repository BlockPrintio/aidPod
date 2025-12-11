import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CampaignCard from './CampaignCard';

const CampaignGrid = ({ 
  campaigns, 
  isLoading, 
  hasMore, 
  onLoadMore, 
  onQuickDonate,
  className = '' 
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-card border border-border rounded-medical shadow-medical-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-muted"></div>
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
        <div className="h-3 bg-muted rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded w-full"></div>
          <div className="h-2 bg-muted rounded w-2/3"></div>
        </div>
        <div className="h-2 bg-muted rounded w-full"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-muted rounded w-1/4"></div>
          <div className="h-3 bg-muted rounded w-1/4"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-muted rounded flex-1"></div>
          <div className="h-8 bg-muted rounded flex-1"></div>
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name="Search" size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No campaigns found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't find any campaigns matching your current filters. Try adjusting your search criteria or browse all campaigns.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          iconName="RotateCcw"
          iconPosition="left"
          onClick={() => window.location?.reload()}
        >
          Reset Filters
        </Button>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => window.location.href = '/patient-campaign-creation'}
        >
          Create Campaign
        </Button>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-6">
        <Icon name="AlertCircle" size={32} className="text-error" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        We're having trouble loading campaigns right now. Please try again in a moment.
      </p>
      <Button
        variant="outline"
        iconName="RefreshCw"
        iconPosition="left"
        onClick={() => window.location?.reload()}
      >
        Try Again
      </Button>
    </div>
  );

  if (isLoading && campaigns?.length === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
        {Array.from({ length: 6 })?.map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (!isLoading && campaigns?.length === 0) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns?.map((campaign) => (
          <CampaignCard
            key={campaign?.id}
            campaign={campaign}
            onQuickDonate={onQuickDonate}
          />
        ))}
        
        {/* Loading more skeleton cards */}
        {isLoadingMore && Array.from({ length: 4 })?.map((_, index) => (
          <SkeletonCard key={`loading-skeleton-${index}`} />
        ))}
      </div>
      {/* Load More Section */}
      {hasMore && !isLoadingMore && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            iconName="ChevronDown"
            iconPosition="right"
            className="px-8"
          >
            Load More Campaigns
          </Button>
        </div>
      )}
      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="flex justify-center items-center mt-8 py-4">
          <Icon name="Loader2" size={20} className="animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading more campaigns...</span>
        </div>
      )}
      {/* End of Results */}
      {!hasMore && campaigns?.length > 0 && (
        <div className="flex flex-col items-center justify-center mt-12 py-8 border-t border-border">
          <Icon name="CheckCircle" size={24} className="text-success mb-2" />
          <p className="text-muted-foreground text-center">
            You've seen all campaigns matching your criteria
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {campaigns?.length} campaign{campaigns?.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );
};

export default CampaignGrid;