import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('user_address');
    const interval = searchParams.get('interval') || '1m';
    const fidelity = searchParams.get('fidelity') || '1d';

    if (!userAddress) {
      return NextResponse.json(
        { error: 'user_address is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      user_address: userAddress,
      interval,
      fidelity
    });

    const apiUrl = `https://user-pnl-api.polymarket.com/user-pnl?${params.toString()}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch P&L data',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching P&L data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

