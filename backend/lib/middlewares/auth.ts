import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../logger';

export interface AuthenticatedRequest extends NextRequest {
    walletAddress?: string;
}

/**
 * Middleware to validate wallet authentication
 * For development: Simple header validation
 * For production: Should implement signature verification
 */
export async function requireAuth(
    request: NextRequest
): Promise<NextResponse | { walletAddress: string }> {
    const walletAddress = request.headers.get('x-wallet-address');

    if (!walletAddress) {
        logger.warn('Authentication failed: No wallet address provided');
        return NextResponse.json(
            { error: 'Wallet address is required in headers' },
            { status: 401 }
        );
    }

    // Basic wallet address validation
    if (!isValidCardanoAddress(walletAddress)) {
        logger.warn(`Authentication failed: Invalid wallet address format: ${walletAddress}`);
        return NextResponse.json(
            { error: 'Invalid wallet address format' },
            { status: 401 }
        );
    }

    logger.debug(`Authentication successful for wallet: ${walletAddress.substring(0, 10)}...`);
    return { walletAddress };
}

/**
 * Optional authentication - doesn't fail if no wallet provided
 */
export async function optionalAuth(
    request: NextRequest
): Promise<{ walletAddress?: string }> {
    const walletAddress = request.headers.get('x-wallet-address');

    if (!walletAddress) {
        return {};
    }

    if (!isValidCardanoAddress(walletAddress)) {
        return {};
    }

    return { walletAddress };
}

/**
 * Basic Cardano address validation
 */
function isValidCardanoAddress(address: string): boolean {
    // Cardano addresses start with 'addr' or 'addr_test'
    // and are typically 58-108 characters long
    const cardanoAddressRegex = /^(addr|addr_test)1[a-z0-9]{53,103}$/;
    return cardanoAddressRegex.test(address) || address.length >= 50;
}

/**
 * Check if user has specific role (for future use)
 */
export async function requireRole(
    walletAddress: string,
    role: 'hospital' | 'patient' | 'admin'
): Promise<boolean> {
    // TODO: Implement role checking logic
    // This would query the database to check user's role
    return true;
}
