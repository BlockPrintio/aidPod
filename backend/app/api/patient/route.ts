import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

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

// POST /api/patient - Register a new patient
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

    const {
      firstname,
      lastname,
      email,
      age,
      walletAddress,
      hospitalId
    } = await request.json();

    // Validate required fields
    if (!firstname || !lastname) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const patientData = {
      firstname,
      lastname,
      email,
      age: age ? parseInt(age) : null,
      walletaddrss: walletAddress, // Note: keeping the typo from schema
      hospitalId: hospitalId ? parseInt(hospitalId) : null
    };

    const patient = await prisma.patient.create({
      data: patientData
    });

    return NextResponse.json(
      {
        message: 'Patient registered successfully',
        patient
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Patient registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/patient - Get all patients with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    let where: any = {};
    if (hospitalId) {
      where.hospitalId = parseInt(hospitalId);
    }
    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hospital: true,
          campaigns: true,
          documents: true
        }
      }),
      prisma.patient.count({ where })
    ]);

    return NextResponse.json({
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

