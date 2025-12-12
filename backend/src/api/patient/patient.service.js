import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const createPatient = async (patientData) => {
  const patient = await prisma.patient.create({
    data: patientData
  });
  return patient;
};

const getPatients = async (filters) => {
  const { hospitalId, page, limit, search } = filters;
  
  let where = {};
  if (hospitalId) where.hospitalId = parseInt(hospitalId);
  if (search) {
    where.OR = [
      { firstname: { contains: search } },
      { lastname: { contains: search } },
      { email: { contains: search } }
    ];
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { hospital: true }
    }),
    prisma.patient.count({ where })
  ]);

  return {
    patients,
    total,
    page: parseInt(page),
    limit: parseInt(limit)
  };
};

const getPatientById = async (id) => {
  const patient = await prisma.patient.findUnique({
    where: { id: parseInt(id) },
    include: { hospital: true, campaigns: true, documents: true }
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  return patient;
};

const updatePatient = async (id, updateData) => {
  const patient = await prisma.patient.update({
    where: { id: parseInt(id) },
    data: updateData
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  return patient;
};

const deletePatient = async (id) => {
  try {
    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });
    return { message: 'Patient deleted successfully' };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Patient not found');
    }
    throw error;
  }
};

const uploadPatientDocument = async (fileBuffer, fileName, patientId, documentType) => {
  // This would typically upload to IPFS and store the URL
  // For now, we'll just create a document record with a placeholder URL
  const document = await prisma.document.create({
    data: {
      patientId: parseInt(patientId),
      type: documentType,
      url: `ipfs://placeholder-${Date.now()}` // This should be the actual IPFS hash
    }
  });

  return document;
};

const getPatientCampaigns = async (id) => {
  const campaigns = await prisma.campaign.findMany({
    where: { patientId: parseInt(id) },
    include: { hospital: true, donations: true }
  });

  return campaigns;
};

export {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  uploadPatientDocument,
  getPatientCampaigns
};

