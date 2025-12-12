

import multer from 'multer';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  uploadPatientDocument,
  getPatientCampaigns
} from './patient.service.js';

export const upload = multer();

/**
 * Register a new patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const registerPatient = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      age,
      walletAddress,
      hospitalId
    } = req.body;

    // Validate required fields
    if (!firstname || !lastname) {
      return res.status(400).json({
        error: 'First name and last name are required'
      });
    }

    const patientData = {
      firstname,
      lastname,
      email,
      age: age ? parseInt(age) : null,
      walletaddrss: walletAddress, // Note: keeping the typo from schema
      hospitalId: hospitalId ? parseInt(hospitalId) : null
    };

    const patient = await createPatient(patientData);

    res.status(201).json({
      message: 'Patient registered successfully',
      patient
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Get all patients with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllPatients = async (req, res) => {
  try {
    const { hospitalId, page, limit, search } = req.query;

    const filters = {};
    if (hospitalId) filters.hospitalId = hospitalId;
    if (page) filters.page = page;
    if (limit) filters.limit = limit;
    if (search) filters.search = search;

    const result = await getPatients(filters);

    res.json(result);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Get patient by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await getPatientById(id);

    res.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};


/**
 * Update patient information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePatientInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Convert age to number if provided
    if (updateData.age !== undefined) {
      updateData.age = parseInt(updateData.age);
    }

    // Convert hospitalId to number if provided
    if (updateData.hospitalId !== undefined) {
      updateData.hospitalId = parseInt(updateData.hospitalId);
    }

    const patient = await updatePatient(id, updateData);

    res.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};


/**
 * Delete patient
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deletePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deletePatient(id);

    res.json(result);
  } catch (error) {
    console.error('Delete patient error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};


/**
 * Upload patient document
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadDocument = async (req, res) => {
  try {
    const { patientId, documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!patientId || !documentType) {
      return res.status(400).json({
        error: 'Patient ID and document type are required'
      });
    }

    const document = await uploadPatientDocument(
      file.buffer,
      file.originalname,
      patientId,
      documentType
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Get patient campaigns
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPatientCampaignsList = async (req, res) => {
  try {
    const { id } = req.params;

    const campaigns = await getPatientCampaigns(id);

    res.json({ campaigns });

  } catch (error) {
    console.error('Get patient campaigns error:', error);
    res.status(500).json({ error: error.message });
  }
};
