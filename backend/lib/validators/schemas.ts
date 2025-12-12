import { z } from 'zod';

// Hospital Registration Schema - Aligned with Prisma Hospital model
export const hospitalRegistrationSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  licenseNumber: z.string().min(5).max(100), // Matches Prisma licenseNumber
  walletAddress: z.string().min(50).optional(), // Optional field
  verificationDoc: z.string().optional(), // IPFS hash or Supabase path
});

// Patient Registration Schema - Aligned with Prisma Patient model
export const patientRegistrationSchema = z.object({
  firstname: z.string().min(2).max(100), // Matches Prisma firstname
  lastname: z.string().min(2).max(100), // Matches Prisma lastname
  email: z.string().email().optional(),
  age: z.number().min(1).max(150).optional(),
  walletaddrss: z.string().min(50).optional(), // Matches Prisma walletaddrss (keeping existing typo)
  hospitalId: z.number().int().optional(),
});

// Campaign Creation Schema - Aligned with Prisma Campaign model
export const campaignCreationSchema = z.object({
  patientId: z.number().int(), // Matches Prisma patientId
  hospitalId: z.number().int(), // Required in Prisma schema
  title: z.string().min(10).max(255),
  story: z.string().min(50), // Matches Prisma story field
  conditionImage: z.string().optional(), // Matches Prisma conditionImage
  amountNeeded: z.number().positive(), // Matches Prisma amountNeeded
  duration: z.number().min(1).max(365), // Matches Prisma duration
  hospitalName: z.string().min(2).max(255), // Required in Prisma schema
});

// Campaign Update Schema - For updating campaign details
export const campaignUpdateSchema = z.object({
  title: z.string().min(10).max(255).optional(),
  story: z.string().min(50).optional(),
  conditionImage: z.string().optional(),
  amountNeeded: z.number().positive().optional(),
  duration: z.number().min(1).max(365).optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FUNDING', 'COMPLETED']).optional(),
});

// Donation Schema - Aligned with Prisma Donation model
export const donationSchema = z.object({
  campaignId: z.number().int(), // Matches Prisma campaignId
  donorAddress: z.string().min(50), // Matches Prisma donorAddress
  amount: z.number().positive(), // Matches Prisma amount
  txHash: z.string().min(50).optional(), // Matches Prisma txHash
});

// Document Upload Schema
export const documentUploadSchema = z.object({
  type: z.enum([
    'HOSPITAL_VERIFICATION',
    'PATIENT_ID',
    'MEDICAL_BILL',
    'MEDICAL_REPORT',
    'CAMPAIGN_PROOF'
  ]),
  url: z.string().url(),
  hospitalId: z.number().int().optional(),
  patientId: z.number().int().optional(),
  campaignId: z.number().int().optional(),
});

// Wallet Authentication Schema
export const walletAuthSchema = z.object({
  walletAddress: z.string().min(50),
  nonce: z.string().min(10),
});

// Common validation utilities
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateWalletAddress = (address: string): boolean => {
  // Basic Cardano wallet address validation (bech32 format)
  const cardanoAddressRegex = /^addr1[0-9a-z]+$/;
  return cardanoAddressRegex.test(address) || address.length >= 50;
};

export const validateTransactionHash = (hash: string): boolean => {
  // Cardano transaction hash validation (64 hex characters)
  const txHashRegex = /^[0-9a-f]{64}$/i;
  return txHashRegex.test(hash);
};

// Query parameter schemas for API filtering
export const paginationSchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).refine((num) => num > 0, 'Page must be positive').optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).refine((num) => num > 0 && num <= 100, 'Limit must be between 1 and 100').optional(),
  search: z.string().optional(),
});

export const hospitalQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
});

export const patientQuerySchema = paginationSchema.extend({
  hospitalId: z.string().transform((val) => parseInt(val, 10)).refine((num) => num > 0, 'Hospital ID must be positive').optional(),
});

export const campaignQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FUNDING', 'COMPLETED']).optional(),
  patientId: z.string().transform((val) => parseInt(val, 10)).refine((num) => num > 0, 'Patient ID must be positive').optional(),
  hospitalId: z.string().transform((val) => parseInt(val, 10)).refine((num) => num > 0, 'Hospital ID must be positive').optional(),
});

// Type exports for TypeScript
export type HospitalRegistration = z.infer<typeof hospitalRegistrationSchema>;
export type PatientRegistration = z.infer<typeof patientRegistrationSchema>;
export type CampaignCreation = z.infer<typeof campaignCreationSchema>;
export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
export type Donation = z.infer<typeof donationSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type WalletAuth = z.infer<typeof walletAuthSchema>;
