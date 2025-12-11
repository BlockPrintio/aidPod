import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import CampaignCard from '../../campaign-discovery-dashboard/components/CampaignCard';

const MyCampaigns = ({ campaigns = [] }) => {
  const handleQuickDonate = (campaign) => {
    // For the owner, this might be "Edit" or "Boost" instead of Donate, 
    // but reusing the card as is for now.
    console.log('Quick donate clicked for:', campaign.id);
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-card border border-border rounded-medical p-12 text-center">
        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="Target" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Campaigns Yet</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You haven't created any fundraising campaigns yet. Start your journey to get the help you need.
        </p>
        <Link to="/patient-campaign-creation">
          <Button size="lg" iconName="Plus" iconPosition="left">
            Create First Campaign
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">My Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            Manage your active and past fundraising campaigns
          </p>
        </div>
        <Link to="/patient-campaign-creation">
          <Button iconName="Plus" iconPosition="left">
            Create New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onQuickDonate={handleQuickDonate}
          />
        ))}
      </div>
    </div>
  );
};

export default MyCampaigns;
