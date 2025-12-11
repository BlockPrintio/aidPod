import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCampaignTransactions } from '../hooks/useCampaignTransactions';
import { adaToLovelace } from '../lib/datum-helpers';
import { validateCampaignAddresses, generateSampleTestnetAddress } from '../lib/utils/address-validator';
import Button from './ui/Button';
import Icon from './AppIcon';

export function CreateCampaignForm({ wallet, connected }) {
  const { createCampaign, loading, error } = useCampaignTransactions();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAda: 0,
    beneficiary: generateSampleTestnetAddress(), // Pre-fill with valid testnet address
    medicalAuthority: generateSampleTestnetAddress(), // Pre-fill with valid testnet address
    emergencyContact: '',
    durationDays: 30,
    minContributionAda: 1,
    verificationRequired: true
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected || !wallet) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const creator = await wallet.getChangeAddress();
      const deadline = new Date(Date.now() + formData.durationDays * 24 * 60 * 60 * 1000);
      
      const campaignData = {
        campaignId: Date.now(), // Use timestamp as unique ID
        title: formData.title,
        description: formData.description,
        totalGoal: adaToLovelace(formData.goalAda),
        creator,
        beneficiary: formData.beneficiary,
        medicalAuthority: formData.medicalAuthority,
        deadline,
        minContribution: adaToLovelace(formData.minContributionAda),
        verificationRequired: formData.verificationRequired,
        emergencyContact: formData.emergencyContact
      };

      // Validate addresses before creating campaign
      const addressValidation = validateCampaignAddresses(campaignData);
      if (!addressValidation.isValid) {
        setValidationErrors(addressValidation.errors);
        alert('Please fix address validation errors before submitting');
        return;
      }

      // Clear validation errors if all is good
      setValidationErrors({});

      const txHash = await createCampaign(wallet, campaignData);
      
      // Show success with testnet explorer link
      const testnetExplorerUrl = `https://preprod.cardanoscan.io/transaction/${txHash}`;
      alert(`🎉 Campaign created successfully!\n\nTransaction Hash: ${txHash}\n\nView on Testnet Explorer:\n${testnetExplorerUrl}\n\nNote: Use testnet explorer, not mainnet CardanoScan!`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        goalAda: 0,
        beneficiary: '',
        medicalAuthority: '',
        emergencyContact: '',
        durationDays: 30,
        minContributionAda: 1,
        verificationRequired: true
      });
    } catch (err) {
      console.error('Failed to create campaign:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-medical-md p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Plus" size={20} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Create Medical Campaign</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Heart Surgery for Sarah"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Description *
          </label>
          <textarea
            placeholder="Describe the medical condition and treatment needed..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Funding Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Goal (ADA) *
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={formData.goalAda || ''}
              onChange={(e) => setFormData({ ...formData, goalAda: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Duration (Days) *
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.durationDays || ''}
              onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Beneficiary Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beneficiary Address *
          </label>
          <input
            type="text"
            placeholder="addr_test1..."
            value={formData.beneficiary}
            onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Cardano address where milestone funds will be sent
          </p>
        </div>

        {/* Medical Authority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Authority Address *
          </label>
          <input
            type="text"
            placeholder="addr_test1..."
            value={formData.medicalAuthority}
            onChange={(e) => setFormData({ ...formData, medicalAuthority: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Hospital or medical authority that will verify milestones
          </p>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Address
          </label>
          <input
            type="text"
            placeholder="addr_test1..."
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
          />
        </div>

        {/* Minimum Contribution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Contribution (ADA)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={formData.minContributionAda || ''}
            onChange={(e) => setFormData({ ...formData, minContributionAda: parseFloat(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Verification Required */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="verification"
            checked={formData.verificationRequired}
            onChange={(e) => setFormData({ ...formData, verificationRequired: e.target.checked })}
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="verification" className="text-sm text-gray-700">
            Require medical authority verification for milestone claims
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading || !connected}
            className="w-full"
            iconName={loading ? "Loader" : "Plus"}
            iconPosition="left"
          >
            {loading ? 'Creating Campaign...' : 'Create Campaign'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <Icon name="AlertTriangle" size={16} />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}
      </form>
    </motion.div>
  );
}
