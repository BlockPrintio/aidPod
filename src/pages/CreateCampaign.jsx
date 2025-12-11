import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CreateCampaignForm } from '../components/CreateCampaignForm';
import WalletConnector from '../components/WalletConnector';
import Icon from '../components/AppIcon';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleWalletChange = (walletInstance, info) => {
    setWallet(walletInstance);
    setWalletInfo(info);
    setConnected(!!walletInstance);
  };

  return (
    <div className="min-h-screen bg-gradient-medical">
      {/* Header */}
      <header className="bg-white shadow-medical-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <WalletConnector onWalletChange={handleWalletChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Medical Campaign
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Launch a verified medical crowdfunding campaign on the Cardano blockchain. 
            Get the support you need for medical treatments with transparency and security.
          </p>
        </motion.div>

        {/* Steps Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-medical-sm p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-sm text-gray-700">Create Campaign</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm text-gray-700">Medical Verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-gray-700">Receive Donations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <span className="text-sm text-gray-700">Milestone Claims</span>
            </div>
          </div>
        </motion.div>

        {/* Campaign Form */}
        <CreateCampaignForm wallet={wallet} connected={connected} />

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="Shield" size={24} className="text-blue-600" />
              <h4 className="text-lg font-semibold text-blue-900">Secure & Transparent</h4>
            </div>
            <p className="text-blue-800 text-sm">
              All funds are secured by smart contracts on Cardano blockchain. 
              Every transaction is transparent and verifiable.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
              <h4 className="text-lg font-semibold text-green-900">Medical Verification</h4>
            </div>
            <p className="text-green-800 text-sm">
              Campaigns are verified by medical authorities to ensure legitimacy 
              and proper use of funds.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="Target" size={24} className="text-purple-600" />
              <h4 className="text-lg font-semibold text-purple-900">Milestone-Based</h4>
            </div>
            <p className="text-purple-800 text-sm">
              Funds are released in milestones (25%, 50%, 75%, 100%) based on 
              treatment progress and verification.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="RefreshCw" size={24} className="text-yellow-600" />
              <h4 className="text-lg font-semibold text-yellow-900">Refund Protection</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              Automatic refunds are available if campaigns are cancelled or 
              don't reach their goals within the deadline.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
