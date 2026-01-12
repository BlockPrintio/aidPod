import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/middlewares/auth';
import { handleError } from '../../../../lib/errors/handler';
import { logger } from '../../../../lib/logger';

// GET /api/hospital/verified - Get only verified hospitals with NFTs
export async function GET(request: NextRequest) {
    try {
        const hospitals = await prisma.hospital.findMany({
            where: {
                status: 'VERIFIED',
                nftMinted: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                licenseNumber: true,
                walletAddress: true,
                status: true,
                nftTokenId: true,
                createdAt: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        logger.debug(`Retrieved ${hospitals.length} verified hospitals with NFTs`);

        return NextResponse.json({
            hospitals,
            total: hospitals.length,
        });
    } catch (error) {
        return handleError(error);
    }
}
