import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../../lib/middlewares/rate-limit';
import { handleError } from '../../../../lib/errors/handler';
import { logger } from '../../../../lib/logger';
import { z } from 'zod';

const mintNFTSchema = z.object({
    patientId: z.number().int().positive('Patient ID must be a positive integer'),
    tokenId: z.string().min(1, 'Token ID is required'),
    txHash: z.string().min(1, 'Transaction hash is required'),
});

// POST /api/patient/mint-nft - Record patient NFT minting
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

        // Find patient
        const patient = await prisma.patient.findUnique({
            where: { id: validated.patientId },
        });

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 }
            );
        }

        // Verify wallet address matches
        if (patient.walletAddress !== auth.walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address does not match patient record' },
                { status: 403 }
            );
        }

        // Verify NFT not already minted
        if (patient.nftMinted) {
            return NextResponse.json(
                { error: 'Patient NFT already minted' },
                { status: 400 }
            );
        }

        // Update patient with NFT info
        const updatedPatient = await prisma.patient.update({
            where: { id: patient.id },
            data: {
                nftMinted: true,
                nftTokenId: validated.tokenId,
                nftMintedAt: new Date(),
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                nftMinted: true,
                nftTokenId: true,
                nftMintedAt: true,
            },
        });

        logger.info(`Patient ${patient.id} minted NFT: ${validated.tokenId} (tx: ${validated.txHash})`);

        return NextResponse.json({
            message: 'Patient NFT recorded successfully',
            patient: updatedPatient,
        });
    } catch (error) {
        return handleError(error);
    }
}
