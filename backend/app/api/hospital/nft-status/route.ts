import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/middlewares/auth';
import { handleError } from '../../../../lib/errors/handler';
import { logger } from '../../../../lib/logger';

// GET /api/hospital/nft-status - Check if hospital can mint NFT
export async function GET(request: NextRequest) {
    try {
        // Authentication
        const auth = await requireAuth(request);
        if (auth instanceof NextResponse) return auth;

        // Find hospital by wallet address
        const hospital = await prisma.hospital.findUnique({
            where: { walletAddress: auth.walletAddress },
            select: {
                id: true,
                name: true,
                status: true,
                nftMinted: true,
                nftTokenId: true,
                nftMintedAt: true,
            },
        });

        if (!hospital) {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }

        const canMint = hospital.status === 'VERIFIED' && !hospital.nftMinted;

        logger.debug(`Hospital ${hospital.id} NFT status: canMint=${canMint}`);

        return NextResponse.json({
            canMint,
            status: hospital.status,
            nftMinted: hospital.nftMinted,
            nftTokenId: hospital.nftTokenId,
            nftMintedAt: hospital.nftMintedAt,
        });
    } catch (error) {
        return handleError(error);
    }
}
