import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../../lib/middlewares/rate-limit';
import { handleError, AppError } from '../../../../../lib/errors/handler';
import { logger } from '../../../../../lib/logger';
import { z } from 'zod';

const donateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  txHash: z.string().min(1, 'Transaction hash is required'),
});

// POST /api/campaign/[id]/donate - Record a donation to a campaign
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
    const body = await request.json();
    const validated = donateSchema.parse(body);

    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
      include: {
        hospital: true,
        patient: true,
      },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (campaign.status !== 'FUNDING') {
      throw new AppError('Campaign is not accepting donations', 400);
    }

    // Create the donation record
    const donation = await prisma.donation.create({
      data: {
        donorAddress: auth.walletAddress,
        amount: validated.amount,
        txHash: validated.txHash,
        campaignId: campaign.id,
      },
    });

    // Update the campaign's amount raised
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        amountRaised: {
          increment: validated.amount,
        },
      },
      include: {
        hospital: true,
        patient: true,
        donations: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Include recent donations
        },
      },
    });

    logger.info(`Donation of ${validated.amount} ADA recorded for campaign ${campaign.id} by ${auth.walletAddress}`);

    return NextResponse.json({
      message: 'Donation recorded successfully',
      donation,
      campaign: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        amountNeeded: updatedCampaign.amountNeeded,
        amountRaised: updatedCampaign.amountRaised,
        status: updatedCampaign.status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/campaign/[id]/donate - Get donations for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: { campaignId: parseInt(id) },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.donation.count({
        where: { campaignId: parseInt(id) },
      }),
    ]);

    return NextResponse.json({
      donations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(error);
  }
}
