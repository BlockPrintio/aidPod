import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '../logger';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// Type guard for Prisma errors
function isPrismaError(error: unknown): error is { code: string; meta?: unknown } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as { code: unknown }).code === 'string' &&
        (error as { code: string }).code.startsWith('P')
    );
}

export function handleError(error: unknown): NextResponse {
    logger.error('API Error:', error);

    // Zod validation errors
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: 'Validation error',
                details: error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
            { status: 400 }
        );
    }

    // Prisma errors (using duck typing to avoid import issues)
    if (isPrismaError(error)) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A record with this value already exists' },
                { status: 409 }
            );
        }
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Record not found' },
                { status: 404 }
            );
        }
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Foreign key constraint failed' },
                { status: 400 }
            );
        }
    }

    // Custom app errors
    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.statusCode }
        );
    }

    // Generic errors
    if (error instanceof Error) {
        return NextResponse.json(
            {
                error: process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'Internal server error'
            },
            { status: 500 }
        );
    }

    return NextResponse.json(
        { error: 'Unknown error occurred' },
        { status: 500 }
    );
}
