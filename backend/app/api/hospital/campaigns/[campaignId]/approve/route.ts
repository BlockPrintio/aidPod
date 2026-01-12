import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { requireAuth } from '../../../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../../../lib/middlewares/rate-limit';
import { handleError } from '../../../../../../lib/errors/handler';
import { logger } from '../../../../../../lib/logger';

// POST /api/hospital/campaigns/[campaignId]/approve - Approve a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { campaignId } = params;

    // Find the hospital by wallet address
    const hospital = await prisma.hospital.findUnique({
      where: { walletAddress: auth.walletAddress },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found for this wallet address' },
        { status: 404 }
      );
    }

    if (hospital.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Hospital must be verified to approve campaigns' },
        { status: 403 }
      );
    }

    // Find the campaign and verify it belongs to this hospital
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(campaignId) },
      include: {
        patient: true,
        hospital: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.hospitalId !== hospital.id) {
      return NextResponse.json(
        { error: 'You can only approve campaigns for your hospital' },
        { status: 403 }
      );
    }

    if (campaign.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Campaign is not in pending status' },
        { status: 400 }
      );
    }

    // Update campaign status to FUNDING (approved and ready for donations)
    const updatedCampaign = await prisma.campaign.update({
      where: { id: parseInt(campaignId) },
      data: { status: 'FUNDING' },
      include: {
        patient: true,
        hospital: true,
      },
    });

    logger.info(`Campaign ${updatedCampaign.id} approved by ${auth.walletAddress}`);

    return NextResponse.json({
      message: 'Campaign approved successfully',
      campaign: updatedCampaign,
    });
  } catch (error) {
    return handleError(error);
  }
}
