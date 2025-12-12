import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/middlewares/auth';
import { handleError } from '../../../../lib/errors/handler';
import { logger } from '../../../../lib/logger';

// GET /api/patient/nft-status - Check patient NFT status
export async function GET(request: NextRequest) {
    try {
        // Authentication
        const auth = await requireAuth(request);
        if (auth instanceof NextResponse) return auth;

        // Find patient by wallet address
        const patient = await prisma.patient.findUnique({
            where: { walletAddress: auth.walletAddress },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                nftMinted: true,
                nftTokenId: true,
                nftMintedAt: true,
            },
        });

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        logger.debug(`Patient ${patient.id} NFT status: nftMinted=${patient.nftMinted}`);

        return NextResponse.json({
            nftMinted: patient.nftMinted,
            nftTokenId: patient.nftTokenId,
            nftMintedAt: patient.nftMintedAt,
            patientId: patient.id,
        });
    } catch (error) {
        return handleError(error);
    }
}
