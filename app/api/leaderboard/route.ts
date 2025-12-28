import { NextRequest, NextResponse } from 'next/server';

// Helper function to fetch profile stats
async function fetchProfileStats(proxyAddress: string, username?: string) {
  try {
    const params = new URLSearchParams({ proxyAddress });
    if (username) {
      params.append('username', username);
    }

    const apiUrl = `https://polymarket.com/api/profile/stats?${params.toString()}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Error fetching profile stats for ${proxyAddress}:`, error);
    return null;
  }
}

// Helper function to fetch P&L data
async function fetchPnLData(userAddress: string, interval: string = '1m', fidelity: string = '1d') {
  try {
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

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Error fetching P&L data for ${userAddress}:`, error);
    return null;
  }
}

// Helper function to fetch total value of user's positions
async function fetchTotalValue(userAddress: string) {
  try {
    const params = new URLSearchParams({
      user: userAddress
    });

    const apiUrl = `https://data-api.polymarket.com/value?${params.toString()}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      // The API returns an array with one object: [{ "user": "...", "value": 123 }]
      if (Array.isArray(data) && data.length > 0) {
        return data[0].value || 0;
      }
      return 0;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching total value for ${userAddress}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from request
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'OVERALL';
    const timePeriod = searchParams.get('timePeriod') || 'DAY';
    const orderBy = searchParams.get('orderBy') || 'PNL';
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const user = searchParams.get('user');
    const userName = searchParams.get('userName');

    // Build query string for Polymarket API
    const queryParams = new URLSearchParams({
      category,
      timePeriod,
      orderBy
    });

    // Add optional parameters only if provided and not empty
    if (limit && limit.trim() !== '') {
      queryParams.append('limit', limit);
    }
    if (offset && offset.trim() !== '') {
      queryParams.append('offset', offset);
    }
    if (user && user.trim() !== '') {
      queryParams.append('user', user);
    }
    if (userName && userName.trim() !== '') {
      queryParams.append('userName', userName);
    }

    // Fetch leaderboard data from Polymarket API
    const apiUrl = `https://data-api.polymarket.com/v1/leaderboard?${queryParams.toString()}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch leaderboard data',
          status: response.status,
          statusText: response.statusText
        },
        { status: response.status }
      );
    }

    const leaderboardData = await response.json();

    // Fetch profile stats for all users in parallel (with rate limiting)
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    const enrichedData = [];
    
    for (let i = 0; i < leaderboardData.length; i += batchSize) {
      const batch = leaderboardData.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (entry: any) => {
          const [profileStats, pnlData, totalValue] = await Promise.all([
            fetchProfileStats(entry.proxyWallet, entry.userName),
            fetchPnLData(entry.proxyWallet, '1m', '1d'),
            fetchTotalValue(entry.proxyWallet)
          ]);
          return {
            ...entry,
            profileStats: profileStats || null,
            pnlData: pnlData || null,
            totalValue: totalValue !== null ? totalValue : null
          };
        })
      );
      enrichedData.push(...batchResults);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < leaderboardData.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

