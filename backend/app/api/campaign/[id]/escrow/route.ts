import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../../lib/middlewares/rate-limit';
import { handleError, AppError } from '../../../../../lib/errors/handler';
import { logger } from '../../../../../lib/logger';

// POST /api/campaign/[id]/escrow - Set or update campaign escrow address
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
    const { escrow_address } = await request.json();

    if (!escrow_address) {
      throw new AppError('Escrow address is required', 400);
    }

    // Update campaign with escrow address
    const campaign = await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: { escrowAddress: escrow_address },
      include: {
        patient: true,
        hospital: true,
      },
    });

    logger.info(`Escrow address set for campaign ${campaign.id}: ${escrow_address}`);

    return NextResponse.json({
      message: 'Escrow address updated successfully',
      campaign,
    });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/campaign/[id]/escrow - Get campaign escrow address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        escrowAddress: true,
      },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        escrow_address: campaign.escrowAddress,
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
