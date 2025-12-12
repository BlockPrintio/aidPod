import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { uploadToIPFS } from '../../../../lib/uploader';

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

// POST /api/campaign/document - Upload document to IPFS for a campaign
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
    
    const campaign_id = formData.get('campaign_id') as string;
    const document_type = formData.get('document_type') as string;
    const document = formData.get('document') as File;

    if (!campaign_id || !document_type) {
      return NextResponse.json(
        { error: 'Campaign ID and document type are required' },
        { status: 400 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Upload document to IPFS
    const documentBuffer = await document.arrayBuffer();
    const ipfsHash = await uploadToIPFS(Buffer.from(documentBuffer), document.name);

    // Store document reference in Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        campaign_id: parseInt(campaign_id),
        type: document_type,
        url: `ipfs://${ipfsHash}`
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { 
        message: 'Document uploaded successfully', 
        document: data 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/campaign/document - Get documents for a campaign
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ documents: data });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
