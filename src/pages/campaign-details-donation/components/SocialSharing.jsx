import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SocialSharing = ({ campaign }) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(247);

  const campaignUrl = `https://aidpod.app/campaign/${campaign?.id}`;
  const shareText = `Help ${campaign?.patientName} with ${campaign?.medicalCondition}. Every donation makes a difference! 🏥❤️`;

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: 'Twitter',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(campaignUrl)}&hashtags=MedicalFunding,Healthcare,Help`
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}&title=${encodeURIComponent(shareText)}`
    },
    {
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + campaignUrl)}`
    },
    {
      name: 'Telegram',
      icon: 'Send',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      url: `https://t.me/share/url?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Email',
      icon: 'Mail',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      url: `mailto:?subject=${encodeURIComponent(`Help ${campaign?.patientName} - Medical Campaign`)}&body=${encodeURIComponent(shareText + '\n\n' + campaignUrl)}`
    }
  ];

  const handleShare = (platform) => {
    window.open(platform?.url, '_blank', 'width=600,height=400');
    setShareCount(prev => prev + 1);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Help ${campaign?.patientName} - Medical Campaign`,
          text: shareText,
          url: campaignUrl
        });
        setShareCount(prev => prev + 1);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Icon name="Share2" size={20} className="text-primary" />
            <h3 className="text-xl font-bold text-foreground">Share Campaign</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {shareCount} shares
          </div>
        </div>

        {/* Share Message */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-medical">
          <div className="flex items-start space-x-3">
            <Icon name="Heart" size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-2">Help Spread the Word</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sharing this campaign can help {campaign?.patientName} reach more potential donors
                and achieve their medical funding goal faster. Every share counts!
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Buttons */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Share on Social Media</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {socialPlatforms?.map((platform) => (
              <Button
                key={platform?.name}
                variant="outline"
                onClick={() => handleShare(platform)}
                className={`flex items-center space-x-2 h-auto py-3 justify-start border-border ${platform?.bgColor}`}
              >
                <Icon name={platform?.icon} size={18} className={platform?.color} />
                <span className="text-sm font-medium text-foreground">
                  {platform?.name}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-foreground">Direct Link</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-muted/50 rounded-medical border border-border">
              <span className="text-sm text-muted-foreground font-mono break-all">
                {campaignUrl}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              iconName={copied ? "Check" : "Copy"}
              iconPosition="left"
              className={copied ? 'text-success border-success' : ''}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Native Share (Mobile) */}
        {navigator.share && (
          <div className="mt-4">
            <Button
              variant="default"
              fullWidth
              onClick={handleNativeShare}
              iconName="Share"
              iconPosition="left"
            >
              Share via Device
            </Button>
          </div>
        )}

        {/* Share Impact */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="bg-gradient-trust p-4 rounded-medical">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="TrendingUp" size={20} className="text-success" />
              </div>
              <div>
                <h5 className="font-medium text-foreground">Share Impact</h5>
                <p className="text-sm text-muted-foreground">
                  Campaigns with more shares raise 3x more funds on average
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Share Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-medical">
            <div className="text-lg font-bold text-primary">{shareCount}</div>
            <div className="text-xs text-muted-foreground">Total Shares</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-medical">
            <div className="text-lg font-bold text-secondary">
              {Math.floor(shareCount * 2.3)}
            </div>
            <div className="text-xs text-muted-foreground">Estimated Views</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-medical">
            <div className="text-lg font-bold text-success">
              {Math.floor(shareCount * 0.15)}
            </div>
            <div className="text-xs text-muted-foreground">New Donors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSharing;