
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { uploadToSupabase } from '../../../lib/storage/supabase';
import { requireAuth } from '../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../lib/middlewares/rate-limit';
import { handleError } from '../../../lib/errors/handler';
import { validateDocumentFile } from '../../../lib/validators/file-validator';
import { hospitalRegistrationSchema } from '../../../lib/validators/schemas';
import { logger } from '../../../lib/logger';

// POST /api/hospital - Register a new hospital
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      licenseNumber: formData.get('licenseNumber') as string,
      walletAddress: formData.get('walletAddress') as string,
    };

    // Validate with Zod
    const validated = hospitalRegistrationSchema.parse(data);

    // Handle verification document upload
    let verificationDoc: string | null = null;
    const docFile = formData.get('verificationDoc') as File;

    if (docFile) {
      const validation = validateDocumentFile(docFile);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      const docBuffer = await docFile.arrayBuffer();
      verificationDoc = await uploadToSupabase(
        Buffer.from(docBuffer),
        docFile.name,
        'hospital-verification'
      );
      logger.info(`Verification document uploaded: ${verificationDoc}`);
    }

    // Create hospital using Prisma
    const hospital = await prisma.hospital.create({
      data: {
        name: validated.name,
        email: validated.email,
        licenseNumber: validated.licenseNumber,
        walletAddress: validated.walletAddress,
        verificationDoc,
        status: 'PENDING',
      },
    });

    logger.info(`Hospital registered: ${hospital.id} - ${hospital.name}`);

    return NextResponse.json(
      {
        message: 'Hospital registered successfully',
        hospital,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/hospital - Get all hospitals with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaigns: {
            select: {
              id: true,
              title: true,
              status: true,
              amountNeeded: true,
              amountRaised: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              url: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.hospital.count({ where }),
    ]);

    logger.debug(`Retrieved ${hospitals.length} hospitals (page ${page})`);

    return NextResponse.json({
      hospitals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(error);
  }
}
