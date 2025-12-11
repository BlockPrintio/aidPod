/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CARDANO_NETWORK: 'preprod' | 'mainnet' | 'preview';
  readonly VITE_CAMPAIGN_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


