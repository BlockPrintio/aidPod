import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import VerificationStatusBadge from '../../../components/ui/VerificationStatusBadge';

const VerificationRequestCard = ({
  request,
  onReview,
  onQuickApprove,
  onQuickReject,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted/50 border-muted';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysAgo = (date) => {
    const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className={`bg-card border border-border rounded-medical shadow-medical-sm hover:shadow-medical-md transition-all duration-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Image
              src={request?.patientPhoto}
              alt={request?.patientName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-card-foreground">{request?.patientName}</h3>
                <span className="text-sm text-muted-foreground">#{request?.campaignId}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{request?.condition}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Age: {request?.age}</span>
                <span>•</span>
                <span>{request?.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-medical text-xs font-medium border ${getUrgencyColor(request?.urgency)}`}>
              {request?.urgency?.toUpperCase()}
            </div>
            <VerificationStatusBadge status={request?.status} size="sm" />
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-muted/30 p-3 rounded-medical">
            <div className="text-xs text-muted-foreground mb-1">Funding Goal</div>
            <div className="text-lg font-semibold text-card-foreground">
              {formatAmount(request?.targetAmount)} ADA
            </div>
            <div className="text-xs text-muted-foreground">
              ≈ ${(request?.targetAmount * 0.35)?.toFixed(0)}
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-medical">
            <div className="text-xs text-muted-foreground mb-1">Documents</div>
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-primary" />
              <span className="text-lg font-semibold text-card-foreground">
                {request?.documentsCount}
              </span>
              <span className="text-xs text-muted-foreground">files</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-medical">
            <div className="text-xs text-muted-foreground mb-1">Submitted</div>
            <div className="text-sm font-medium text-card-foreground">
              {getDaysAgo(request?.submittedDate)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(request?.submittedDate)}
            </div>
          </div>
        </div>

        {/* Medical Summary */}
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            <span>Medical Summary</span>
          </button>
          
          {isExpanded && (
            <div className="mt-3 p-4 bg-muted/20 rounded-medical">
              <p className="text-sm text-card-foreground leading-relaxed">
                {request?.medicalSummary}
              </p>
              
              {request?.treatmentPlan && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Treatment Plan</div>
                  <p className="text-sm text-card-foreground">
                    {request?.treatmentPlan}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Document Types */}
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Submitted Documents</div>
          <div className="flex flex-wrap gap-2">
            {request?.documentTypes?.map((docType, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-medical text-xs"
              >
                <Icon name="FileCheck" size={12} />
                <span>{docType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Priority: {request?.priority}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuickReject(request?.id)}
              iconName="X"
              iconPosition="left"
            >
              Reject
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onQuickApprove(request?.id)}
              iconName="Check"
              iconPosition="left"
            >
              Quick Approve
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onReview(request)}
              iconName="Eye"
              iconPosition="left"
            >
              Review Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequestCard;