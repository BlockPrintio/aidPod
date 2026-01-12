import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { uploadToSupabase } from '../../../lib/storage/supabase';
import { requireAuth, optionalAuth } from '../../../lib/middlewares/auth';
import { apiRateLimiter } from '../../../lib/middlewares/rate-limit';
import { handleError } from '../../../lib/errors/handler';
import { validateImageFile } from '../../../lib/validators/file-validator';
import { campaignCreationSchema } from '../../../lib/validators/schemas';
import { logger } from '../../../lib/logger';

// POST /api/campaign - Create a new campaign with image upload
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = apiRateLimiter(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();

    // Extract and validate fields
    const data = {
      patientId: parseInt(formData.get('patient_id') as string),
      hospitalId: parseInt(formData.get('hospital_id') as string),
      title: formData.get('title') as string,
      story: formData.get('story') as string,
      amountNeeded: parseFloat(formData.get('amount_needed') as string),
      duration: parseInt(formData.get('duration_days') as string),
      hospitalName: formData.get('hospitalName') as string,
    };

    // Validate with Zod
    const validated = campaignCreationSchema.parse(data);

    // Handle image upload
    let conditionImage: string | null = null;
    const image = formData.get('image') as File;

    if (image) {
      const validation = validateImageFile(image);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      const imageBuffer = await image.arrayBuffer();
      conditionImage = await uploadToSupabase(
        Buffer.from(imageBuffer),
        image.name,
        'campaign-images'
      );
      logger.info(`Image uploaded to Supabase: ${conditionImage}`);
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        patientId: validated.patientId,
        hospitalId: validated.hospitalId,
        title: validated.title,
        story: validated.story,
        conditionImage,
        amountNeeded: validated.amountNeeded,
        amountRaised: 0,
        duration: validated.duration,
        hospitalName: validated.hospitalName,
        status: 'PENDING',
      },
      include: {
        patient: true,
        hospital: true,
      },
    });

    logger.info(`Campaign created: ${campaign.id} by wallet: ${auth.walletAddress}`);

    return NextResponse.json(
      {
        message: 'Campaign created successfully',
        campaign
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/campaign - Get all campaigns or specific campaign by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific campaign
      const campaign = await prisma.campaign.findUnique({
        where: { id: parseInt(id) },
        include: {
          patient: true,
          hospital: true,
          documents: true,
          donations: true,
        },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ campaign });
    }

    // Get all campaigns with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
          hospital: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
            },
          },
          donations: {
            select: {
              id: true,
              amount: true,
              donorAddress: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.campaign.count({ where }),
    ]);

    logger.debug(`Retrieved ${campaigns.length} campaigns (page ${page})`);

    return NextResponse.json({
      campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleError(error);
  }
}
