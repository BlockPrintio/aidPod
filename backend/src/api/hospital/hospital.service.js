
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const registerHospitalService = async (hospitalData) => {
  const hospital = await prisma.hospital.create({
    data: hospitalData
  });
  return hospital;
};

const uploadDocumentService = async (documentData) => {
  const document = await prisma.document.create({
    data: documentData,
  });
  return document;
};

const approveCampaignService = async (campaignId) => {
  const campaign = await prisma.campaign.update({
    where: { id: parseInt(campaignId) },
    data: { status: 'APPROVED' },
  });
  return campaign;
};

const getPendingCampaignsService = async () => {
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'PENDING' },
    include: { patient: true, hospital: true },
  });
  return campaigns;
};

export {
  registerHospitalService,
  uploadDocumentService,
  approveCampaignService,
  getPendingCampaignsService,
};
