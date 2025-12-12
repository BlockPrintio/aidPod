import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// POST /api/campaign/[id]/escrow - Set or update campaign escrow address
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate wallet authentication
    const auth = validateWalletAuth(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { error: 'Wallet address is required in headers' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { escrow_address } = await request.json();

    if (!escrow_address) {
      return NextResponse.json(
        { error: 'Escrow address is required' },
        { status: 400 }
      );
    }

    // Update campaign with escrow address in Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .update({ escrow_address })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Escrow address updated successfully',
      campaign: data
    });
  } catch (error) {
    console.error('Escrow address update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/campaign/[id]/escrow - Get campaign escrow address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('campaigns')
      .select('id, title, escrow_address')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      campaign: {
        id: data.id,
        title: data.title,
        escrow_address: data.escrow_address
      }
    });
  } catch (error) {
    console.error('Get escrow address error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
