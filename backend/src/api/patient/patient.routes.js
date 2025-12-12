import express from 'express';
import multer from 'multer';
import walletAuth from '../../middlewares/authMiddleware.js';
import {
  registerPatient,
  getAllPatients,
  getPatient,
  updatePatientInfo,
  deletePatientRecord,
  uploadDocument,
  getPatientCampaignsList,
  upload
} from './patient.controller.js';

const router = express.Router();

// Register a new patient
router.post('/register', walletAuth, registerPatient);

// Get all patients
router.get('/', walletAuth, getAllPatients);

// Get patient by ID
router.get('/:id', walletAuth, getPatient);

// Update patient information
router.put('/:id', walletAuth, updatePatientInfo);

// Delete patient
router.delete('/:id', walletAuth, deletePatientRecord);

// Upload patient document
router.post('/document', walletAuth, upload.single('file'), uploadDocument);

// Get patient campaigns
router.get('/:id/campaigns', walletAuth, getPatientCampaignsList);

export default router;

