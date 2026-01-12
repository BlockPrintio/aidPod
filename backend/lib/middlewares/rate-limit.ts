import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
    windowMs?: number;  // Time window in milliseconds
    max?: number;       // Max requests per window
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar distributed cache
 */
export function rateLimit(options: RateLimitOptions = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    const max = options.max || 100;

    return (request: NextRequest): NextResponse | null => {
        const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
        const key = `${ip}`;
        const now = Date.now();

        // Initialize or get current count
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return null; // Allow request
        }

        store[key].count++;

        if (store[key].count > max) {
            const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                        'X-RateLimit-Limit': max.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': store[key].resetTime.toString(),
                    },
                }
            );
        }

        return null; // Allow request
    };
}

// Export configured rate limiter for API routes
export const apiRateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 attempts
});
