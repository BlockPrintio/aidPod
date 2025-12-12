

import express from 'express';
import {
  registerHospital,
  uploadVerificationDocument,
  verifyHospital,
  getHospitals,
  getHospital,
  approveCampaign,
  getPendingCampaigns,
  upload,
} from './hospital.controller.js';
import walletAuth from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Register hospital
router.post('/register', walletAuth, registerHospital);

// Upload documents to IPFS
router.post('/upload-documents', walletAuth, upload.single('file'), uploadVerificationDocument);

// Verify hospital
router.put('/:id/verify', walletAuth, verifyHospital);

// Get all hospitals
router.get('/', getHospitals);

// Get hospital by ID
router.get('/:id', getHospital);

// Upload verification document
router.post('/upload-verification-document', walletAuth, upload.single('file'), uploadVerificationDocument);

// Approve campaign
router.put('/campaigns/:campaignId/approve', walletAuth, approveCampaign);

// Get pending campaigns
router.get('/campaigns/pending', walletAuth, getPendingCampaigns);

export default router;
