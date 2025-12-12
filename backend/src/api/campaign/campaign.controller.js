import { createClient } from '@supabase/supabase-js';

import { uploadToIPFS } from '../../config/ipfs.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Create a new campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCampaign = async (req, res) => {
  try {
    const { 
      patient_id, 
      hospital_id, 
      title, 
      amount_needed, 
      duration_days, 
      story,
      hospitalName 
    } = req.body;

    const file = req.file;
    let image_ipfs = null;

    // Upload image to IPFS if file is provided
    if (file) {
      image_ipfs = await uploadToIPFS(file.buffer, file.originalname);
    }

    // Insert campaign into Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        patient_id,
        hospital_id,
        title,
        image_ipfs,
        amount_needed,
        duration_days,
        story,
        hospital_name: hospitalName,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ 
      message: 'Campaign created successfully', 
      campaign: data 
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload document to IPFS for a campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadCampaignDocument = async (req, res) => {
  try {
    const { campaign_id, document_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload document to IPFS
    const ipfsHash = await uploadToIPFS(file.buffer, file.originalname);

    // Store document reference in Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        campaign_id,
        type: document_type,
        url: `ipfs://${ipfsHash}`
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ 
      message: 'Document uploaded successfully', 
      document: data 
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Set or update campaign escrow address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const setCampaignEscrowAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { escrow_address } = req.body;

    if (!escrow_address) {
      return res.status(400).json({ error: 'Escrow address is required' });
    }

    // Update campaign with escrow address in Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .update({ escrow_address })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: 'Escrow address updated successfully', 
      campaign: data 
    });
  } catch (error) {
    console.error('Escrow address update error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get campaign by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        patient:patients(*),
        hospital:hospitals(*),
        documents(*),
        donations(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ campaign: data });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: error.message });
  }
};

