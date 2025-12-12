import React from 'react';
import Icon from '../../../components/AppIcon';

const DonorComments = ({ campaign }) => {
  const comments = [
    {
      id: 1,
      donorName: "Sarah Johnson",
      donorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      amount: 250,
      message: "Praying for your quick recovery! Stay strong and keep fighting. The whole community is behind you.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isAnonymous: false,
      verified: true
    },
    {
      id: 2,
      donorName: "Anonymous Donor",
      donorAvatar: null,
      amount: 500,
      message: "Hope this helps with your medical expenses. Wishing you all the best for your treatment and recovery.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isAnonymous: true,
      verified: false
    },
    {
      id: 3,
      donorName: "Michael Chen",
      donorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      amount: 100,
      message: "My family went through something similar. You\'re not alone in this fight. Sending love and support!",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isAnonymous: false,
      verified: true
    },
    {
      id: 4,
      donorName: "Emma Rodriguez",
      donorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      amount: 75,
      message: "Every little bit helps! Hoping for your speedy recovery and successful treatment.",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      isAnonymous: false,
      verified: true
    },
    {
      id: 5,
      donorName: "Anonymous Donor",
      donorAvatar: null,
      amount: 1000,
      message: "Stay positive and keep your spirits up. Medical science has come a long way, and I believe in your recovery.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isAnonymous: true,
      verified: false
    }
  ];

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden">
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">
              {comments?.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Messages</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary">
              {comments?.filter(c => !c?.isAnonymous)?.length?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Public Supporters</div>
          </div>
          <div>
            <div className="text-lg font-bold text-success">
              {comments?.reduce((sum, c) => sum + c?.amount, 0)?.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">ADA from Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorComments;