import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Get origin from request
    const origin = request.headers.get('origin');

    // Allow requests from Vite frontend (development and production)
    const allowedOrigins = [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:4173',  // Vite preview
        process.env.FRONTEND_URL, // Production frontend
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-wallet-address, x-signature, x-nonce');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: response.headers
        });
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
