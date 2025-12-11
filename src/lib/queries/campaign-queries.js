import { SCRIPT_ADDRESS } from '../mesh-config';
import { decodeCampaignDatum } from '../datum-helpers';

export async function getCampaignUtxo(provider, campaignId) {
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

export async function getAllCampaigns(provider) {
  const utxos = await provider.fetchAddressUTxOs(SCRIPT_ADDRESS);
  const campaigns = [];
  
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

export async function getCampaignsByStatus(provider, status) {
  const campaigns = await getAllCampaigns(provider);
  return campaigns.filter(campaign => campaign.datum.status === status);
}

export async function getCampaignsByCreator(provider, creatorAddress) {
  const campaigns = await getAllCampaigns(provider);
  return campaigns.filter(campaign => campaign.datum.creator === creatorAddress);
}
