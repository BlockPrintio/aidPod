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

// POST /api/hospital/upload-documents - Upload hospital verification documents
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
    
    const hospital_id = formData.get('hospital_id') as string;
    const file = formData.get('file') as File;

    if (!hospital_id) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
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
        hospitalId: parseInt(hospital_id),
        type: 'HOSPITAL_VERIFICATION',
        url: `ipfs://${ipfsHash}`
      }
    });

    return NextResponse.json({
      message: 'Verification document uploaded successfully',
      document
    }, { status: 201 });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

