import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

// Initialize Privy API client
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

/**
 * Get wallets with signers (delegated access)
 * Following: https://docs.privy.io/wallets/using-wallets/signers/use-signers
 * 
 * Query params:
 * - userDid (optional): Get wallets for a specific user
 * - all (optional): If true, get all delegated wallets across all users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userDid = searchParams.get('userDid');
    const getAll = searchParams.get('all') === 'true';

    // If getAll is true, return all delegated wallets across all users
    if (getAll) {
      try {
        // Get all users (note: this may be rate-limited for large user bases)
        const allUsers = await privyClient.getUsers();
        
        // Collect all wallets with delegated access
        const allDelegatedWallets: Array<{
          wallet: any;
          userId: string;
          userDid: string;
        }> = [];

        for (const user of allUsers) {
          const delegatedWallets = user.linkedAccounts?.filter(
            (account) => 
              account.type === 'wallet' && 
              'delegated' in account && 
              account.delegated === true
          ) || [];

          for (const wallet of delegatedWallets) {
            allDelegatedWallets.push({
              wallet,
              userId: user.id,
              userDid: user.id, // Privy user ID is the DID
            });
          }
        }

        return NextResponse.json({
          success: true,
          wallets: allDelegatedWallets.map(item => ({
            ...item.wallet,
            userId: item.userId,
            userDid: item.userDid,
          })),
          count: allDelegatedWallets.length,
          totalUsers: allUsers.length,
        });
      } catch (error) {
        console.error('Error getting all delegated wallets:', error);
        return NextResponse.json(
          {
            error: 'Failed to get all delegated wallets',
            message: error instanceof Error ? error.message : 'Unknown error',
            hint: 'This endpoint may be rate-limited. Consider using userDid parameter for specific users.',
          },
          { status: 500 }
        );
      }
    }

    // If userDid is provided, get wallets for that specific user
    if (userDid) {
      let user;
      try {
        // Get user by DID (decentralized ID)
        user = await privyClient.getUser(userDid);
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'User not found',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 404 }
        );
      }
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Filter wallets with signers (delegated: true)
      const walletsWithSigners = user.linkedAccounts?.filter(
        (account) => 
          account.type === 'wallet' && 
          'delegated' in account && 
          account.delegated === true
      ) || [];

      return NextResponse.json({
        success: true,
        wallets: walletsWithSigners.map(wallet => ({
          ...wallet,
          userId: user.id,
          userDid: user.id,
        })),
        count: walletsWithSigners.length,
      });
    }

    // If neither userDid nor all is provided, return error
    return NextResponse.json(
      { 
        error: 'Either userDid parameter or all=true parameter is required',
        hint: 'Use ?userDid=did:privy:XXXXXX for a specific user, or ?all=true for all delegated wallets'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error getting wallets with signers:', error);
    return NextResponse.json(
      {
        error: 'Failed to get wallets with signers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

