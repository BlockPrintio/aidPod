import React from 'react';
import Icon from '../../../components/AppIcon';

const CampaignTimeline = ({ campaign }) => {
  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Campaign Created',
      description: 'Medical fundraising campaign was initiated',
      date: campaign?.createdAt,
      icon: 'Plus',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 2,
      type: 'verified',
      title: 'Medical Verification',
      description: `Verified by ${campaign?.verifierName}`,
      date: campaign?.verificationDate,
      icon: 'ShieldCheck',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 3,
      type: 'milestone',
      title: '25% Funding Milestone',
      description: 'First quarter of funding goal achieved',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      icon: 'TrendingUp',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 4,
      type: 'update',
      title: 'Medical Update Posted',
      description: 'Latest treatment progress shared',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: 'MessageSquare',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      id: 5,
      type: 'milestone',
      title: '50% Funding Milestone',
      description: 'Halfway to funding goal reached',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      icon: 'Target',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  const upcomingEvents = [
    {
      id: 6,
      type: 'treatment',
      title: 'Scheduled Treatment',
      description: 'Surgery scheduled at City General Hospital',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      icon: 'Calendar',
      color: 'text-error',
      bgColor: 'bg-error/10',
      isUpcoming: true
    }
  ];

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffInDays = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays > 0) return `${diffInDays} days ago`;
    if (diffInDays === -1) return 'Tomorrow';
    return `In ${Math.abs(diffInDays)} days`;
  };

  const allEvents = [...timelineEvents, ...upcomingEvents]?.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Icon name="Clock" size={20} className="text-primary" />
          <h3 className="text-xl font-bold text-foreground">Campaign Timeline</h3>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Timeline Events */}
          <div className="space-y-6">
            {allEvents?.map((event, index) => (
              <div key={event?.id} className="relative flex items-start space-x-4">
                {/* Timeline Dot */}
                <div className={`relative z-10 w-12 h-12 ${event?.bgColor} rounded-full flex items-center justify-center flex-shrink-0 ${
                  event?.isUpcoming ? 'border-2 border-dashed border-current' : ''
                }`}>
                  <Icon name={event?.icon} size={20} className={event?.color} />
                </div>

                {/* Event Content */}
                <div className={`flex-1 min-w-0 pb-6 ${event?.isUpcoming ? 'opacity-70' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${event?.isUpcoming ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {event?.title}
                      {event?.isUpcoming && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-medical">
                          Upcoming
                        </span>
                      )}
                    </h4>
                    <div className="text-right">
                      <div className={`text-sm ${event?.isUpcoming ? 'text-muted-foreground' : event?.color}`}>
                        {formatRelativeTime(event?.date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(event?.date)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event?.description}
                  </p>

                  {/* Special Content for Milestones */}
                  {event?.type === 'milestone' && !event?.isUpcoming && (
                    <div className="mt-3 flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="DollarSign" size={12} />
                        <span>{(campaign?.targetAmount * 0.25 * (event?.title?.includes('50%') ? 2 : 1))?.toLocaleString()} ADA raised</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={12} />
                        <span>{Math.floor(campaign?.donorCount * (event?.title?.includes('50%') ? 0.8 : 0.4))} donors</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Milestones Summary */}
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="font-semibold text-foreground mb-4">Key Milestones</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-medical">
              <Icon name="Calendar" size={16} className="text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Campaign Start</div>
              <div className="text-sm font-medium text-foreground">
                {new Date(campaign.createdAt)?.toLocaleDateString()}
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-medical">
              <Icon name="Shield" size={16} className="text-success mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Verified</div>
              <div className="text-sm font-medium text-foreground">
                {new Date(campaign.verificationDate)?.toLocaleDateString()}
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-medical">
              <Icon name="Target" size={16} className="text-warning mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Current Progress</div>
              <div className="text-sm font-medium text-foreground">
                {((campaign?.currentAmount / campaign?.targetAmount) * 100)?.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-medical">
              <Icon name="Clock" size={16} className="text-error mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Days Remaining</div>
              <div className="text-sm font-medium text-foreground">
                {campaign?.daysRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignTimeline;