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

    const campaign = await prisma.campaign.update({
      where: { id: parseInt(campaignId) },
      data: { status: 'APPROVED' },
      include: {
        patient: true,
        hospital: true,
      },
    });

    logger.info(`Campaign ${campaign.id} approved by ${auth.walletAddress}`);

    return NextResponse.json({
      message: 'Campaign approved successfully',
      campaign,
    });
  } catch (error) {
    return handleError(error);
  }
}
