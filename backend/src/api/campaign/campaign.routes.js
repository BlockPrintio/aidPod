import express from "express";
import multer from "multer";
import walletAuth from "../../middlewares/authMiddleware.js";
import {
  createCampaign,
  uploadCampaignDocument,
  setCampaignEscrowAddress,
  getCampaign
} from "./campaign.controller.js";

const router = express.Router();
const upload = multer();

// Create a new campaign with image upload
router.post("/create", walletAuth, upload.single("image"), createCampaign);

// Upload document to IPFS for a campaign
router.post("/document", walletAuth, upload.single("document"), uploadCampaignDocument);

// Set or update campaign escrow address
router.post("/escrow/:id", walletAuth, setCampaignEscrowAddress);

// Get campaign by ID
router.get("/:id", getCampaign);

export default router;

