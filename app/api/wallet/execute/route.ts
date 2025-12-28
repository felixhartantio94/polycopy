import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

// Initialize Privy API client with authorization signing key
// Following: https://docs.privy.io/wallets/using-wallets/signers/use-signers
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || '',
  {
    // Authorization private key from Privy Dashboard
    // This is used to sign requests when executing transactions
    walletApi: {
      authorizationPrivateKey: process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY,
    },
  }
);

/**
 * Check if a wallet has signers (delegated access)
 * Following: https://docs.privy.io/wallets/using-wallets/signers/use-signers
 */
/**
 * Check if a wallet has signers (delegated access)
 * Following: https://docs.privy.io/wallets/using-wallets/signers/use-signers
 * Wallets with signers will have delegated: true
 */
async function walletHasSigners(walletAddress: string, userDid?: string): Promise<boolean> {
  try {
    let user;
    
    // If we have userDid, get user by DID
    if (userDid) {
      user = await privyClient.getUser(userDid);
    } else {
      // Otherwise, get user by wallet address
      user = await privyClient.getUserByWalletAddress(walletAddress);
    }
    
    if (!user) return false;

    // Filter wallets with signers (delegated: true)
    // According to Privy docs: wallets with signers will have delegated: true
    const wallet = user.linkedAccounts?.find(
      (account) => 
        account.type === 'wallet' && 
        'address' in account &&
        account.address === walletAddress &&
        'delegated' in account &&
        account.delegated === true
    );

    return !!wallet;
  } catch (error) {
    console.error('Error checking wallet signers:', error);
    return false;
  }
}

/**
 * Execute a transaction on behalf of a user's wallet
 * Following: https://docs.privy.io/wallets/using-wallets/signers/use-signers
 * 
 * The authorization signing key configured in PrivyClient will be used to sign requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, to, value, data, chainId, userDid } = body;

    if (!walletAddress || !to) {
      return NextResponse.json(
        { error: 'walletAddress and to are required' },
        { status: 400 }
      );
    }

    // Check if wallet has signers (delegated access)
    const hasSigners = await walletHasSigners(walletAddress, userDid);
    if (!hasSigners) {
      return NextResponse.json(
        { 
          error: 'Server-side access not enabled for this wallet. Please enable it first by adding a signer.',
          hint: 'User needs to call addSigners() on their wallet first'
        },
        { status: 403 }
      );
    }

    // Execute transaction using WalletApi.ethereum.sendTransaction
    // Following: https://docs.privy.io/wallets/using-wallets/signers/use-signers
    // The authorization signing key configured in PrivyClient will be used automatically
    const result = await privyClient.walletApi.ethereum.sendTransaction({
      walletId: walletAddress,
      transaction: {
        to,
        value: value || '0',
        data: data || '0x',
        chainId: chainId || 1,
      },
      caip2: `eip155:${chainId || 1}`, // CAIP-2 chain ID format (e.g., "eip155:1" for Ethereum mainnet)
    });

    return NextResponse.json({
      success: true,
      transactionHash: result.hash,
      chainId: result.caip2,
      message: 'Transaction executed successfully',
    });
  } catch (error) {
    console.error('Error executing transaction:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute transaction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

