import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAuth } from '../../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../../lib/middlewares/rate-limit';
import { handleError, AppError } from '../../../../../lib/errors/handler';
import { logger } from '../../../../../lib/logger';

// PUT /api/hospital/[id]/verify - Verify hospital
export async function PUT(
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
    const { status } = await request.json();

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    // Validate status values
    const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new AppError(
        'Invalid status. Must be PENDING, VERIFIED, or REJECTED',
        400
      );
    }

    const hospital = await prisma.hospital.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    logger.info(`Hospital ${hospital.id} status updated to ${status} by ${auth.walletAddress}`);

    return NextResponse.json({
      message: 'Hospital verification status updated successfully',
      hospital,
    });
  } catch (error) {
    return handleError(error);
  }
}
