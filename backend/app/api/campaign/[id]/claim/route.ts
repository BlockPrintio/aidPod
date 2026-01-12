import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../../lib/middlewares/rate-limit';
import { handleError, AppError } from '../../../../../lib/errors/handler';
import { logger } from '../../../../../lib/logger';

// POST /api/campaign/[id]/claim - Allow hospital to claim funds from completed campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = params;

    // Find the hospital by wallet address
    const hospital = await prisma.hospital.findUnique({
      where: { walletAddress: auth.walletAddress },
    });

    if (!hospital) {
      throw new AppError('Hospital not found for this wallet address', 404);
    }

    if (hospital.status !== 'VERIFIED') {
      throw new AppError('Hospital must be verified to claim funds', 403);
    }

    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
      include: {
        hospital: true,
        patient: true,
        donations: true,
      },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (campaign.hospitalId !== hospital.id) {
      throw new AppError('You can only claim funds for campaigns from your hospital', 403);
    }

    if (campaign.claimed) {
      throw new AppError('Funds have already been claimed for this campaign', 400);
    }

    if (campaign.amountRaised < campaign.amountNeeded) {
      throw new AppError('Campaign is not fully funded yet', 400);
    }

    // Update campaign as claimed and completed
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        claimed: true,
        status: 'COMPLETED',
      },
      include: {
        hospital: true,
        patient: true,
      },
    });

    logger.info(`Hospital ${hospital.name} claimed funds for campaign ${campaign.id}`);

    return NextResponse.json({
      message: 'Funds claimed successfully',
      campaign: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        amountNeeded: updatedCampaign.amountNeeded,
        amountRaised: updatedCampaign.amountRaised,
        claimed: updatedCampaign.claimed,
        status: updatedCampaign.status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
