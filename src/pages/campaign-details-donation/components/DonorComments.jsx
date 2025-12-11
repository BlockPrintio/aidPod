import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const DonorComments = ({ campaign }) => {
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleSubmitComment = () => {
    if (!newComment?.trim()) return;
    
    // Handle comment submission
    console.log('Submitting comment:', newComment);
    setNewComment('');
  };

  const displayedComments = showAllComments ? comments : comments?.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Icon name="MessageCircle" size={20} className="text-primary" />
            <h3 className="text-xl font-bold text-foreground">
              Donor Messages ({comments?.length})
            </h3>
          </div>
          <div className="text-sm text-muted-foreground">
            Latest messages of support
          </div>
        </div>

        {/* Comment Input */}
        <div className="mb-6 p-4 bg-muted/50 rounded-medical">
          <h4 className="font-medium text-foreground mb-3">Leave a Message of Support</h4>
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e?.target?.value)}
              placeholder="Share words of encouragement and support..."
              className="w-full p-3 border border-border rounded-medical bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              maxLength={300}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {newComment?.length}/300 characters
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment?.trim()}
                iconName="Send"
                iconPosition="right"
              >
                Post Message
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {displayedComments?.map((comment) => (
            <div key={comment?.id} className="flex space-x-4 p-4 bg-background/50 rounded-medical">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment?.isAnonymous ? (
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} className="text-muted-foreground" />
                  </div>
                ) : (
                  <Image
                    src={comment?.donorAvatar}
                    alt={comment?.donorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-foreground">
                    {comment?.donorName}
                  </span>
                  {comment?.verified && !comment?.isAnonymous && (
                    <Icon name="CheckCircle" size={14} className="text-success" />
                  )}
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTimeAgo(comment?.timestamp)}
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-3">
                  {comment?.message}
                </p>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm">
                    <Icon name="Heart" size={14} className="text-error" />
                    <span className="text-muted-foreground">
                      Donated {comment?.amount} ADA
                    </span>
                  </div>
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    <Icon name="ThumbsUp" size={14} />
                    <span>Helpful</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {comments?.length > 3 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllComments(!showAllComments)}
              iconName={showAllComments ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
            >
              {showAllComments 
                ? 'Show Less' 
                : `Show ${comments?.length - 3} More Messages`
              }
            </Button>
          </div>
        )}

        {/* Comments Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">
                {comments?.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Messages</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">
                {comments?.filter(c => !c?.isAnonymous)?.length}
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
    </div>
  );
};

export default DonorComments;