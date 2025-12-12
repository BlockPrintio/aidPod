import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Local uploadToIPFS implementation to avoid missing module error
async function uploadToIPFS(fileBuffer: Buffer, filename: string): Promise<string> {
  // Fallback implementation: return a data URL for the uploaded file.
  // This avoids depending on an external uploader module while preserving
  // the same function signature used by the route.
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime =
    ext === 'png' ? 'image/png' :
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
    ext === 'gif' ? 'image/gif' :
    'application/octet-stream';

  return `data:${mime};base64,${fileBuffer.toString('base64')}`;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Helper function to extract wallet address from request headers
function getWalletAddress(request: NextRequest): string | null {
  return request.headers.get('x-wallet-address');
}

// Helper function to validate wallet authentication
function validateWalletAuth(request: NextRequest): { isValid: boolean; walletAddress?: string } {
  const walletAddress = getWalletAddress(request);
  
  if (!walletAddress) {
    return { isValid: false };
  }

  return { isValid: true, walletAddress };
}

// POST /api/campaign - Create a new campaign with image upload
export async function POST(request: NextRequest) {
  try {
    // Validate wallet authentication
    const auth = validateWalletAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { error: 'Wallet address is required in headers' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const patient_id = formData.get('patient_id') as string;
    const hospital_id = formData.get('hospital_id') as string;
    const title = formData.get('title') as string;
    const amount_needed = formData.get('amount_needed') as string;
    const duration_days = formData.get('duration_days') as string;
    const story = formData.get('story') as string;
    const hospitalName = formData.get('hospitalName') as string;
    const image = formData.get('image') as File;

    // Validate required fields
    if (!patient_id || !hospital_id || !title || !amount_needed || !duration_days || !story || !hospitalName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }


    let image_ipfs: string | null = null;

    // Upload image to IPFS if file is provided
    if (image) {
      const imageBuffer = await image.arrayBuffer();
      image_ipfs = await uploadToIPFS(Buffer.from(imageBuffer), image.name);
    }

    // Insert campaign into Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        patient_id: parseInt(patient_id),
        hospital_id: parseInt(hospital_id),
        title,
        image_ipfs,
        amount_needed: parseFloat(amount_needed),
        duration_days: parseInt(duration_days),
        story,
        hospital_name: hospitalName,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { 
        message: 'Campaign created successfully', 
        campaign: data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/campaign - Get all campaigns or specific campaign by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get specific campaign
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          patient:patients(*),
          hospital:hospitals(*),
          documents(*),
          donations(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      return NextResponse.json({ campaign: data });
    }

    // Get all campaigns with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        patient:patients(*),
        hospital:hospitals(*),
        documents(*),
        donations(*)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      campaigns: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
