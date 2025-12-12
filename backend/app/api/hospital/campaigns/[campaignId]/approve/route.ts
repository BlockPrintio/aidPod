import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

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

// POST /api/hospital/campaigns/[campaignId]/approve - Approve a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
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

    const { campaignId } = params;

    const campaign = await prisma.campaign.update({
      where: { id: parseInt(campaignId) },
      data: { status: 'APPROVED' },
      include: {
        patient: true,
        hospital: true
      }
    });

    return NextResponse.json({
      message: 'Campaign approved successfully',
      campaign
    });
  } catch (error) {
    console.error('Approve campaign error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

