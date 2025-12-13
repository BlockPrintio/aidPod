// Application Constants
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'AidPod',
  url: import.meta.env.VITE_APP_URL || 'https://aidpod.vercel.app',
  description: 'Blockchain-powered medical crowdfunding platform',
  version: '1.0.0',
};

export const CARDANO_CONFIG = {
  network: import.meta.env.VITE_CARDANO_NETWORK || 'preprod',
  explorerUrl: import.meta.env.VITE_CARDANO_EXPLORER || 'https://preprod.cardanoscan.io',
};

export const FEATURE_FLAGS = {
  enableWallet: import.meta.env.VITE_ENABLE_WALLET !== 'false',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

export const STORAGE_KEYS = {
  campaigns: 'aidpod_campaigns',
  hospitalTracking: 'aidpod_hospital_tracking',
  user: 'aidpod_user',
  campaignDraft: 'aidpod_campaign_draft',
};

export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
};

