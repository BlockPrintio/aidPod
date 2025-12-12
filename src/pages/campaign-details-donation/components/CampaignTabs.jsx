import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { cn } from '../../../utils/cn';

const CampaignTabs = ({ campaign }) => {
  const [activeTab, setActiveTab] = useState('story');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const tabs = [
    { id: 'story', label: 'Story', icon: 'FileText', count: null },
    { id: 'updates', label: 'Updates', icon: 'MessageSquare', count: campaign?.updates?.length || 0 },
    { id: 'documents', label: 'Documents', icon: 'FileImage', count: campaign?.documents?.length || 0 },
    { id: 'verification', label: 'Verification', icon: 'Shield', count: null }
  ];

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const DocumentViewer = ({ document }) => (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-modal flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-medical shadow-medical-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{document?.name}</h3>
          <button
            onClick={() => setSelectedDocument(null)}
            className="p-2 hover:bg-muted rounded-medical transition-colors duration-200"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {document?.type === 'image' ? (
            <Image
              src={document?.url}
              alt={document?.name}
              className="max-w-full h-auto rounded-medical"
            />
          ) : (
            <iframe
              src={document?.url}
              className="w-full h-96 border border-border rounded-medical"
              title={document?.name}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'story':
        return (
          <div className="space-y-6">
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-foreground mb-4">Patient's Story</h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {campaign?.story}
              </div>
            </div>
            <div className="bg-muted/50 p-6 rounded-medical">
              <h4 className="text-lg font-semibold text-foreground mb-3">Medical Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Condition:</span>
                  <span className="text-muted-foreground ml-2">{campaign?.medicalCondition}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Treatment Required:</span>
                  <span className="text-muted-foreground ml-2">{campaign?.treatmentType}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Hospital:</span>
                  <span className="text-muted-foreground ml-2">{campaign?.hospitalName}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Estimated Cost:</span>
                  <span className="text-muted-foreground ml-2">{campaign?.targetAmount?.toLocaleString()} ADA</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'updates':
        return (
          <div className="space-y-4">
            {campaign?.updates?.length > 0 ? (
              campaign?.updates?.map((update, index) => (
                <div key={index} className="bg-card border border-border p-6 rounded-medical">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="MessageSquare" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-foreground">{update?.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(update?.date)}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {update?.content}
                      </p>
                      {update?.images && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                          {update?.images?.map((image, imgIndex) => (
                            <Image
                              key={imgIndex}
                              src={image}
                              alt={`Update ${index + 1} - Image ${imgIndex + 1}`}
                              className="w-full h-24 object-cover rounded-medical cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No updates available yet.</p>
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-4">
            {campaign?.documents?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {campaign?.documents?.map((document, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border p-4 rounded-medical hover:shadow-medical-sm transition-shadow duration-200 cursor-pointer"
                    onClick={() => setSelectedDocument(document)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-secondary/10 rounded-medical flex items-center justify-center flex-shrink-0">
                        <Icon name="FileImage" size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{document?.name}</h4>
                        <p className="text-sm text-muted-foreground">{document?.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded {formatDate(document?.uploadDate)}
                        </p>
                      </div>
                      <Icon name="ExternalLink" size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="FileImage" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-medical">
              <h4 className="text-lg font-semibold text-foreground mb-4">Hospital Verification</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verification Status:</span>
                  <div className="flex items-center space-x-2">
                    <Icon name="ShieldCheck" size={16} className="text-success" />
                    <span className="text-success font-medium">Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verified By:</span>
                  <span className="font-medium text-foreground">{campaign?.verifierName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verification Date:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(campaign?.verificationDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">License Number:</span>
                  <span className="font-mono text-sm text-foreground">MED-2024-7891</span>
                </div>
              </div>
            </div>
            <div className="bg-success/10 border border-success/20 p-4 rounded-medical">
              <div className="flex items-start space-x-3">
                <Icon name="Shield" size={20} className="text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-success">Blockchain Verified</h5>
                  <p className="text-sm text-success/80 mt-1">
                    This campaign has been digitally signed and verified on the Cardano blockchain.
                    Transaction ID: 0x7f8e9d2a1b3c4e5f6789abcdef012345
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-medical shadow-medical-md overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-0 overflow-x-auto">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={cn(
                "flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
              {tab?.count !== null && (
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full transition-colors",
                  activeTab === tab?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {tab?.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
      {/* Document Viewer Modal */}
      {selectedDocument && <DocumentViewer document={selectedDocument} />}
    </div>
  );
};

export default CampaignTabs;