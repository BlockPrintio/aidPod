

import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import multer from 'multer';
import uploadToIPFS from '../../utils/uploader.js';
import {
  registerHospitalService,
  uploadDocumentService,
  approveCampaignService,
  getPendingCampaignsService
} from './hospital.service.js';

const prisma = new PrismaClient();

export const upload = multer();

/**
 * Register a new hospital
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const registerHospital = async (req, res) => {
  try {
    const { name, email, licenseNumber, walletAddress } = req.body;
    const file = req.file;
    
    let verificationDoc = null;

    // Upload verification document to IPFS if provided
    if (file) {
      verificationDoc = await uploadToIPFS(file.buffer, file.originalname);
    }

    // Insert hospital
    const hospital = await prisma.hospital.create({
      data: {
        name,
        email,
        licenseNumber,
        walletAddress,
        verificationDoc,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Hospital registered successfully',
      hospital
    });
  } catch (error) {
    console.error('Hospital registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify hospital documents
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Update hospital verification status
    const hospital = await prisma.hospital.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      message: 'Hospital verification updated',
      hospital
    });
  } catch (error) {
    console.error('Hospital verification error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all hospitals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getHospitals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let where = {};
    if (status) {
      where.status = status;
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hospital.count({ where })
    ]);

    res.json({
      hospitals,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get hospital by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getHospital = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await prisma.hospital.findUnique({
      where: { id: parseInt(id) },
      include: {
        campaigns: true,
        documents: true
      }
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({ hospital });
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Upload hospital verification document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadVerificationDocument = async (req, res) => {
  try {
    const { hospital_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload document to IPFS
    const ipfsHash = await uploadToIPFS(file.buffer, file.originalname);

    // Store document reference
    const document = await prisma.document.create({
      data: {
        hospitalId: hospital_id,
        type: 'HOSPITAL_VERIFICATION',
        url: `ipfs://${ipfsHash}`
      }
    });

    res.status(201).json({
      message: 'Verification document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve a campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const approveCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await approveCampaignService(campaignId);
    res.json({
      message: 'Campaign approved successfully',
      campaign
    });
  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending campaigns
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPendingCampaigns = async (req, res) => {
  try {
    const campaigns = await getPendingCampaignsService();
    res.json({ campaigns });
  } catch (error) {
    console.error('Get pending campaigns error:', error);
    res.status(500).json({ error: error.message });
  }
};

