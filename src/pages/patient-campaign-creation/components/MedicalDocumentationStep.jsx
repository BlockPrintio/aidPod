import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MedicalDocumentationStep = ({ formData, updateFormData, errors }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const documentTypes = [
    { id: 'medical_report', label: 'Medical Report', required: true, icon: 'FileText' },
    { id: 'doctor_prescription', label: 'Doctor Prescription', required: true, icon: 'Pill' },
    { id: 'treatment_plan', label: 'Treatment Plan', required: true, icon: 'Calendar' },
    { id: 'cost_estimate', label: 'Cost Estimate', required: true, icon: 'Receipt' },
    { id: 'lab_results', label: 'Lab Results', required: false, icon: 'TestTube' },
    { id: 'imaging_scans', label: 'Imaging/Scans', required: false, icon: 'Scan' },
    { id: 'insurance_docs', label: 'Insurance Documents', required: false, icon: 'Shield' },
    { id: 'other_docs', label: 'Other Medical Documents', required: false, icon: 'FolderOpen' }
  ];

  const mockDocuments = formData?.documents || {};

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, documentType) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFileUpload(files, documentType);
  };

  const handleFileUpload = (files, documentType) => {
    files?.forEach((file) => {
      // Mock IPFS upload simulation
      const fileId = `${documentType}_${Date.now()}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev?.[fileId] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            // Mock IPFS hash
            const mockIPFSHash = `QmX${Math.random()?.toString(36)?.substring(2, 15)}`;
            
            const newDocument = {
              id: fileId,
              name: file?.name,
              type: file?.type,
              size: file?.size,
              ipfsHash: mockIPFSHash,
              uploadDate: new Date()?.toISOString(),
              documentType: documentType
            };
            
            const updatedDocuments = {
              ...mockDocuments,
              [documentType]: [...(mockDocuments?.[documentType] || []), newDocument]
            };
            
            updateFormData('documents', updatedDocuments);
            
            // Remove from progress tracking
            const { [fileId]: removed, ...rest } = prev;
            return rest;
          }
          return { ...prev, [fileId]: currentProgress + 10 };
        });
      }, 200);
    });
  };

  const removeDocument = (documentType, documentId) => {
    const updatedDocuments = {
      ...mockDocuments,
      [documentType]: mockDocuments?.[documentType]?.filter(doc => doc?.id !== documentId) || []
    };
    updateFormData('documents', updatedDocuments);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-medical p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Upload" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Medical Documentation</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-medical p-4 mb-6">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Document Upload Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>All documents are stored securely on IPFS (InterPlanetary File System)</li>
                <li>Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)</li>
                <li>Required documents must be uploaded for campaign verification</li>
                <li>Ensure all personal information is clearly visible and legible</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentTypes?.map((docType) => (
            <div key={docType?.id} className="border border-border rounded-medical p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name={docType?.icon} size={16} className="text-muted-foreground" />
                  <span className="font-medium text-foreground">{docType?.label}</span>
                  {docType?.required && (
                    <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded">Required</span>
                  )}
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-medical p-4 text-center transition-colors duration-200 ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, docType?.id)}
              >
                <Icon name="Upload" size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop files here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileUpload(Array.from(e?.target?.files), docType?.id)}
                  className="hidden"
                  id={`file-${docType?.id}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`file-${docType?.id}`)?.click()}
                >
                  Choose Files
                </Button>
              </div>

              {/* Upload Progress */}
              {Object.entries(uploadProgress)?.map(([fileId, progress]) => (
                <div key={fileId} className="mt-3 p-2 bg-muted rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">Uploading to IPFS...</span>
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Uploaded Documents */}
              {mockDocuments?.[docType?.id]?.map((doc) => (
                <div key={doc?.id} className="mt-3 p-3 bg-success/5 border border-success/20 rounded-medical">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Icon name="FileCheck" size={16} className="text-success flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{doc?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc?.size)} • IPFS: {doc?.ipfsHash?.substring(0, 12)}...
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(docType?.id, doc?.id)}
                      iconName="X"
                      className="text-error hover:text-error"
                    />
                  </div>
                </div>
              ))}

              {errors?.[docType?.id] && (
                <p className="text-sm text-error mt-2">{errors?.[docType?.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h4 className="font-medium text-foreground mb-3">Privacy & Security</h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <Icon name="Lock" size={16} className="text-success mt-0.5" />
            <p>All documents are encrypted and stored on IPFS for maximum security and decentralization</p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Eye" size={16} className="text-primary mt-0.5" />
            <p>Only verified hospital staff and campaign verifiers can access your medical documents</p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Shield" size={16} className="text-warning mt-0.5" />
            <p>You maintain full control over document access and can revoke permissions at any time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDocumentationStep;