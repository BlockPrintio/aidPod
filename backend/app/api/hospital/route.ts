




import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { uploadToIPFS } from '../../../src/utils/uploader';

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

// POST /api/hospital - Register a new hospital
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
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const walletAddress = formData.get('walletAddress') as string;
    const verificationDoc = formData.get('verificationDoc') as File;

    // Validate required fields
    if (!name || !email || !licenseNumber) {
      return NextResponse.json(
        { error: 'Name, email, and license number are required' },
        { status: 400 }
      );
    }


    let verificationDocIPFS: string | null = null;

    // Upload verification document to IPFS if provided
    if (verificationDoc) {
      const docBuffer = await verificationDoc.arrayBuffer();
      verificationDocIPFS = await uploadToIPFS(Buffer.from(docBuffer), verificationDoc.name);
    }

    // Insert hospital using Prisma
    const hospital = await prisma.hospital.create({
      data: {
        name,
        email,
        licenseNumber,
        walletAddress,
        verificationDoc: verificationDocIPFS,
        status: 'PENDING'
      }
    });

    return NextResponse.json(
      {
        message: 'Hospital registered successfully',
        hospital
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Hospital registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/hospital - Get all hospitals with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let where: any = {};
    if (status) {
      where.status = status;
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaigns: true,
          documents: true
        }
      }),
      prisma.hospital.count({ where })
    ]);

    return NextResponse.json({
      hospitals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
