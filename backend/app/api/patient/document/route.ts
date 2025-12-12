import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

import { uploadToIPFS } from '../../../../lib/uploader';

// Helper function to extract wallet address from request headers
function getWalletAddress(request: NextRequest): string | null {
  return request.headers.get('x-wallet-address');
}

// Helper function to validate wallet authentication
function validateWalletAuth(request: NextRequest): { isValid: boolean; walletAddress?: string } {
  const walletAddress = getWalletAddress(request);
  
  if (!walletAddress) {
    return { isValid: false };
  }

  return { isValid: true, walletAddress };
}

// POST /api/patient/document - Upload patient document
export async function POST(request: NextRequest) {
  try {
    // Validate wallet authentication
    const auth = validateWalletAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { error: 'Wallet address is required in headers' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const patient_id = formData.get('patient_id') as string;
    const document_type = formData.get('document_type') as string;
    const file = formData.get('file') as File;

    if (!patient_id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    if (!document_type) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Upload document to IPFS
    const fileBuffer = await file.arrayBuffer();
    const ipfsHash = await uploadToIPFS(Buffer.from(fileBuffer), file.name);

    // Store document reference
    const document = await prisma.document.create({
      data: {
        patientId: parseInt(patient_id),
        type: document_type as any, // Will be validated by Prisma
        url: `ipfs://${ipfsHash}`
      }
    });

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document
    }, { status: 201 });

  } catch (error) {
    console.error('Patient document upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

