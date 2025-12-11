import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      title: 'Medical Verification',
      description: 'All campaigns verified by licensed healthcare professionals'
    },
    {
      icon: 'Lock',
      title: 'Blockchain Security',
      description: 'Transparent and secure transactions on Cardano blockchain'
    },
    {
      icon: 'Eye',
      title: 'Full Transparency',
      description: 'Track every donation and see exactly how funds are used'
    },
    {
      icon: 'Users',
      title: 'Trusted Community',
      description: 'Join thousands helping medical causes worldwide'
    }
  ];

  const securityBadges = [
    { name: 'SSL Secured', icon: 'ShieldCheck' },
    { name: 'HIPAA Compliant', icon: 'FileCheck' },
    { name: 'Blockchain Verified', icon: 'Link' }
  ];

  return (
    <div className="space-y-6">
      {/* Trust Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trustFeatures?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-medical">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-medical flex items-center justify-center">
              <Icon name={feature?.icon} size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground">{feature?.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Security Badges */}
      <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-border">
        {securityBadges?.map((badge, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name={badge?.icon} size={14} className="text-success" />
            <span>{badge?.name}</span>
          </div>
        ))}
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-bold text-primary">2,500+</div>
          <div className="text-xs text-muted-foreground">Campaigns Funded</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-secondary">$2.8M</div>
          <div className="text-xs text-muted-foreground">Total Raised</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent">98%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;