import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const proxyAddress = searchParams.get('proxyAddress');
    const username = searchParams.get('username');

    if (!proxyAddress) {
      return NextResponse.json(
        { error: 'proxyAddress is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      proxyAddress
    });
    
    if (username) {
      params.append('username', username);
    }

    const apiUrl = `https://polymarket.com/api/profile/stats?${params.toString()}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch profile stats',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

