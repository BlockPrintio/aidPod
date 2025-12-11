import { SCRIPT_ADDRESS } from '../mesh-config';
import { decodeCampaignDatum } from '../datum-helpers';
import type { UTxO, CampaignDatum } from '../../types/mesh';

interface TransactionProvider {
  fetchAddressUTxOs: (address: string) => Promise<UTxO[]>;
}

interface CampaignUtxoResult {
  utxo: UTxO;
  datum: CampaignDatum;
}

export async function getCampaignUtxo(
  provider: TransactionProvider,
  campaignId: number
): Promise<CampaignUtxoResult | null> {
  const utxos = await provider.fetchAddressUTxOs(SCRIPT_ADDRESS);
  
  // Find the UTxO with matching campaign ID
  for (const utxo of utxos) {
    if (utxo.output.plutusData) {
      try {
        const datum = decodeCampaignDatum(utxo.output.plutusData);
        if (datum && datum.campaign_id === campaignId) {
          return { utxo, datum };
        }
      } catch (e) {
        // Skip invalid datums
        continue;
      }
    }
  }
  
  return null;
}

export async function getAllCampaigns(provider: TransactionProvider): Promise<CampaignUtxoResult[]> {
  const utxos = await provider.fetchAddressUTxOs(SCRIPT_ADDRESS);
  const campaigns: CampaignUtxoResult[] = [];
  
  for (const utxo of utxos) {
    if (utxo.output.plutusData) {
      try {
        const datum = decodeCampaignDatum(utxo.output.plutusData);
        if (datum) {
          campaigns.push({ utxo, datum });
        }
      } catch (e) {
        // Skip invalid datums
        continue;
      }
    }
  }
  
  return campaigns;
}

export async function getCampaignsByStatus(
  provider: TransactionProvider,
  status: number | { constructor: number; fields: unknown[] }
): Promise<CampaignUtxoResult[]> {
  const campaigns = await getAllCampaigns(provider);
  return campaigns.filter(campaign => {
    const campaignStatus = campaign.datum.status;
    if (typeof status === 'number') {
      return campaignStatus === status || (typeof campaignStatus === 'object' && campaignStatus && 'constructor' in campaignStatus && campaignStatus.constructor === status);
    }
    if (typeof campaignStatus === 'object' && campaignStatus && 'constructor' in campaignStatus) {
      return campaignStatus.constructor === status.constructor;
    }
    return false;
  });
}

export async function getCampaignsByCreator(
  provider: TransactionProvider,
  creatorAddress: string
): Promise<CampaignUtxoResult[]> {
  const campaigns = await getAllCampaigns(provider);
  return campaigns.filter(campaign => campaign.datum.creator === creatorAddress);
}

