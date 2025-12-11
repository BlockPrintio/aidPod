import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import CampaignProgressIndicator from '../../../components/ui/CampaignProgressIndicator';
import VerificationStatusBadge from '../../../components/ui/VerificationStatusBadge';

const CampaignHero = ({ campaign }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const urgencyLevel = campaign?.daysRemaining <= 7 ? 'critical' : 
                      campaign?.daysRemaining <= 30 ? 'urgent' : 'normal';

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'critical': return 'text-error';
      case 'urgent': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden">
      {/* Hero Image Section */}
      <div className="relative h-64 md:h-80 bg-muted overflow-hidden">
        <Image
          src={campaign?.heroImage}
          alt={`${campaign?.patientName} - Medical Campaign`}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Icon name="Image" size={48} className="text-muted-foreground animate-pulse" />
          </div>
        )}
        
        {/* Urgency Indicator */}
        {urgencyLevel !== 'normal' && (
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-medical border border-border">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className={getUrgencyColor()} />
              <span className={`text-sm font-medium ${getUrgencyColor()}`}>
                {urgencyLevel === 'critical' ? 'Critical' : 'Urgent'}
              </span>
            </div>
          </div>
        )}

        {/* Campaign Status */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-medical border border-border">
            <div className="w-2 h-2 bg-success rounded-full animate-breathing"></div>
            <span className="text-sm font-medium text-success">Active Campaign</span>
          </div>
        </div>
      </div>
      {/* Campaign Info Section */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {campaign?.title}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Help {campaign?.patientName} with {campaign?.medicalCondition}
              </p>
            </div>
            <VerificationStatusBadge
              status={campaign?.verificationStatus}
              verifierName={campaign?.verifierName}
              verificationDate={campaign?.verificationDate}
              size="default"
            />
          </div>

          {/* Patient Info */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{campaign?.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>Created {new Date(campaign.createdAt)?.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="User" size={14} />
              <span>Age {campaign?.patientAge}</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <CampaignProgressIndicator
          currentAmount={campaign?.currentAmount}
          targetAmount={campaign?.targetAmount}
          donorCount={campaign?.donorCount}
          daysRemaining={campaign?.daysRemaining}
          isLive={true}
          size="lg"
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-medical text-center">
            <div className="text-2xl font-bold text-primary">
              {((campaign?.currentAmount / campaign?.targetAmount) * 100)?.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Funded</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-medical text-center">
            <div className="text-2xl font-bold text-secondary">
              {campaign?.donorCount}
            </div>
            <div className="text-sm text-muted-foreground">Donors</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-medical text-center">
            <div className="text-2xl font-bold text-warning">
              {campaign?.daysRemaining}
            </div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-medical text-center">
            <div className="text-2xl font-bold text-accent">
              {campaign?.updates?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Updates</div>
          </div>
        </div>

        {/* Medical Priority Tags */}
        <div className="flex flex-wrap gap-2">
          {campaign?.medicalTags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-medical"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignHero;