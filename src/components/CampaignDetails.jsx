import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { provider } from '../lib/mesh-config';
import { getCampaignUtxo } from '../lib/queries/campaign-queries';
import { 
  lovelaceToAda, 
  getCampaignProgress, 
  getTimeRemaining,
  getCampaignStatusText 
} from '../lib/datum-helpers';
import { ContributeToCampaign } from './ContributeToCampaign';
import { ClaimMilestone } from './ClaimMilestone';
import { CampaignManagement } from './CampaignManagement';
import { RequestRefund } from './RequestRefund';
import Icon from './AppIcon';

export function CampaignDetails({ wallet, connected, walletInfo, onWalletChange }) {
  const { campaignId } = useParams();
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignUtxo(provider, parseInt(campaignId));
      if (data) {
        setCampaignData(data);
      } else {
        setError('Campaign not found');
      }
    } catch (err) {
      console.error('Failed to load campaign:', err);
      setError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-medical flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !campaignData) {
    return (
      <div className="min-h-screen bg-gradient-medical flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600">{error || 'The requested campaign could not be found.'}</p>
        </div>
      </div>
    );
  }

  const { utxo, datum } = campaignData;
  const progress = getCampaignProgress(datum.current_funds, datum.total_goal);
  const timeRemaining = getTimeRemaining(datum.deadline);
  const raised = lovelaceToAda(datum.current_funds);
  const goal = lovelaceToAda(datum.total_goal);

  return (
    <div className="min-h-screen bg-gradient-medical">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-medical-md p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  datum.status === 0 ? 'bg-green-100 text-green-800' :
                  datum.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                  datum.status === 2 ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getCampaignStatusText(datum.status)}
                </span>
                {datum.verification_required && (
                  <span className="flex items-center space-x-1 text-sm text-green-600">
                    <Icon name="CheckCircle" size={16} />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{datum.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{raised.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">ADA Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{goal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">ADA Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{progress.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Funded</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                  <span>{timeRemaining}</span>
                  <span>Campaign ID: {datum.campaign_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Description</h3>
            <p className="text-gray-700 leading-relaxed">{datum.description}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-medical-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Funding Milestones</h3>
              <div className="space-y-4">
                {datum.milestones.map((milestone, index) => {
                  const milestoneAmount = (datum.total_goal * milestone.percentage) / 100;
                  const isReached = datum.current_funds >= milestoneAmount;
                  const isClaimed = milestone.claimed;
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isClaimed ? 'bg-green-500' : isReached ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        {isClaimed ? (
                          <Icon name="Check" size={16} className="text-white" />
                        ) : isReached ? (
                          <Icon name="Clock" size={16} className="text-white" />
                        ) : (
                          <span className="text-white text-xs font-bold">{milestone.percentage}%</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {milestone.percentage}% Milestone
                          </span>
                          <span className="text-sm text-gray-600">
                            {lovelaceToAda(milestoneAmount).toLocaleString()} ADA
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {isClaimed ? 'Claimed' : isReached ? 'Ready to claim' : 'Not reached'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Campaign Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-medical-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Campaign Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                  <p className="text-sm text-gray-900 font-mono break-all">{datum.creator}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary</label>
                  <p className="text-sm text-gray-900 font-mono break-all">{datum.beneficiary}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Authority</label>
                  <p className="text-sm text-gray-900 font-mono break-all">{datum.medical_authority}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Contribution</label>
                  <p className="text-sm text-gray-900">{lovelaceToAda(datum.min_contribution)} ADA</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900">{new Date(datum.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <p className="text-sm text-gray-900">{new Date(datum.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contribution Form */}
            {datum.status === 0 && (
              <ContributeToCampaign 
                wallet={wallet}
                connected={connected}
                campaignId={parseInt(campaignId)}
                campaignUtxo={utxo}
                currentDatum={datum}
              />
            )}

            {/* Milestone Claiming */}
            <ClaimMilestone 
              wallet={wallet}
              connected={connected}
              campaignId={parseInt(campaignId)}
              campaignUtxo={utxo}
              currentDatum={datum}
            />

            {/* Campaign Management */}
            <CampaignManagement 
              wallet={wallet}
              connected={connected}
              campaignId={parseInt(campaignId)}
              campaignUtxo={utxo}
              currentDatum={datum}
            />

            {/* Refund Request */}
            <RequestRefund 
              wallet={wallet}
              connected={connected}
              campaignId={parseInt(campaignId)}
              campaignUtxo={utxo}
              currentDatum={datum}
              userContributionAmount={5000000} // Mock 5 ADA contribution
            />

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadCampaign}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Icon name="RefreshCw" size={16} />
              <span>Refresh Campaign</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
