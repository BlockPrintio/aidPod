import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

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

// GET /api/patient/[id] - Get patient by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        hospital: true,
        campaigns: true,
        documents: true
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/patient/[id] - Update patient information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate wallet authentication
    const auth = validateWalletAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { error: 'Wallet address is required in headers' },
        { status: 401 }
      );
    }

    const { id } = params;
    const updateData = await request.json();

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Convert numeric fields if provided
    if (updateData.age !== undefined) {
      updateData.age = parseInt(updateData.age);
    }
    if (updateData.hospitalId !== undefined) {
      updateData.hospitalId = parseInt(updateData.hospitalId);
    }

    const patient = await prisma.patient.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      message: 'Patient updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient/[id] - Delete patient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate wallet authentication
    const auth = validateWalletAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { error: 'Wallet address is required in headers' },
        { status: 401 }
      );
    }

    const { id } = params;

    await prisma.patient.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

