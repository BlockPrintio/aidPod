import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import VerificationStatusBadge from '../../../components/ui/VerificationStatusBadge';
import CampaignProgressIndicator from '../../../components/ui/CampaignProgressIndicator';

const CampaignCard = ({ campaign, onQuickDonate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatTimeRemaining = (daysLeft) => {
    if (daysLeft > 30) {
      const months = Math.floor(daysLeft / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    }
    if (daysLeft > 0) {
      return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    }
    if (daysLeft === 0) {
      return 'Last day';
    }
    return 'Campaign ended';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-error';
      case 'urgent': return 'text-warning';
      case 'moderate': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-error/10';
      case 'urgent': return 'bg-warning/10';
      case 'moderate': return 'bg-primary/10';
      default: return 'bg-muted/10';
    }
  };

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-sm hover:shadow-medical-md transition-all duration-300 overflow-hidden group">
      {/* Campaign Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={campaign?.image}
          alt={`${campaign?.patientName} medical campaign`}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Urgency Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-medical text-xs font-medium ${getUrgencyColor(campaign?.urgency)} ${getUrgencyBg(campaign?.urgency)}`}>
          {campaign?.urgency?.charAt(0)?.toUpperCase() + campaign?.urgency?.slice(1)}
        </div>

        {/* Verification Badge */}
        <div className="absolute top-3 right-3">
          <VerificationStatusBadge
            status={campaign?.verificationStatus}
            verifierName={campaign?.verifierName}
            verificationDate={campaign?.verificationDate}
            size="sm"
            showTooltip={false}
          />
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Link to={`/campaign-details-donation?id=${campaign?.id}`}>
              <Button variant="secondary" size="sm" iconName="Eye" iconPosition="left">
                View Details
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              iconName="Heart"
              iconPosition="left"
              onClick={(e) => {
                e?.preventDefault();
                onQuickDonate(campaign);
              }}
            >
              Quick Donate
            </Button>
          </div>
        </div>
      </div>
      {/* Campaign Content */}
      <div className="p-6 space-y-4">
        {/* Patient Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-card-foreground text-xl leading-snug line-clamp-2">
            {campaign?.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="User" size={16} />
            <span>{campaign?.patientName}</span>
            <span>•</span>
            <span>{campaign?.age} years old</span>
          </div>
        </div>

        {/* Medical Condition */}
        <div className="flex items-center space-x-2 py-1">
          <Icon name="Stethoscope" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">{campaign?.medicalCondition}</span>
        </div>

        {/* Story Preview */}
        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
          {campaign?.storyPreview}
        </p>

        {/* Progress Indicator */}
        <div className="py-1">
          <CampaignProgressIndicator
            currentAmount={campaign?.currentAmount}
            targetAmount={campaign?.targetAmount}
            donorCount={campaign?.donorCount}
            daysRemaining={campaign?.daysRemaining}
            isLive={campaign?.status === 'active'}
            size="md"
            showDetails={false}
          />
        </div>

        {/* Campaign Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <Icon name="MapPin" size={14} />
              <span>{campaign?.location}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Icon name="Clock" size={14} />
              <span>{formatTimeRemaining(campaign?.daysRemaining)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <Icon name="Calendar" size={14} />
            <span>{new Date(campaign.createdAt)?.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      {/* Action Footer */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex space-x-3">
          <Link to={`/campaign-details-donation?id=${campaign?.id}`} className="flex-1">
            <Button variant="outline" size="default" fullWidth iconName="ArrowRight" iconPosition="right">
              Learn More
            </Button>
          </Link>
          <Button
            variant="default"
            size="default"
            iconName="Heart"
            iconPosition="left"
            onClick={() => onQuickDonate(campaign)}
            className="flex-1"
          >
            Donate Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;