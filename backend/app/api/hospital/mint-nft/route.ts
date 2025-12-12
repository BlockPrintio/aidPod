import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../lib/middlewares/rate-limit';
import { handleError } from '../../../../lib/errors/handler';
import { logger } from '../../../../lib/logger';
import { z } from 'zod';

const mintNFTSchema = z.object({
    tokenId: z.string().min(1, 'Token ID is required'),
    txHash: z.string().min(1, 'Transaction hash is required'),
});

// POST /api/hospital/mint-nft - Record hospital NFT minting
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResponse = apiRateLimiter(request);
        if (rateLimitResponse) return rateLimitResponse;

        // Authentication
        const auth = await requireAuth(request);
        if (auth instanceof NextResponse) return auth;

        const body = await request.json();
        const validated = mintNFTSchema.parse(body);

        // Find hospital by wallet address
        const hospital = await prisma.hospital.findUnique({
            where: { walletAddress: auth.walletAddress },
        });

        if (!hospital) {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }

        // Verify hospital is verified
        if (hospital.status !== 'VERIFIED') {
            return NextResponse.json(
                { error: 'Hospital must be verified before minting NFT' },
                { status: 403 }
            );
        }

        // Verify NFT not already minted
        if (hospital.nftMinted) {
            return NextResponse.json(
                { error: 'Hospital NFT already minted' },
                { status: 400 }
            );
        }

        // Update hospital with NFT info
        const updatedHospital = await prisma.hospital.update({
            where: { id: hospital.id },
            data: {
                nftMinted: true,
                nftTokenId: validated.tokenId,
                nftMintedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
                nftMinted: true,
                nftTokenId: true,
                nftMintedAt: true,
            },
        });

        logger.info(`Hospital ${hospital.id} minted NFT: ${validated.tokenId} (tx: ${validated.txHash})`);

        return NextResponse.json({
            message: 'Hospital NFT recorded successfully',
            hospital: updatedHospital,
        });
    } catch (error) {
        return handleError(error);
    }
}
