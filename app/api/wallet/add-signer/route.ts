import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

// Initialize Privy API client
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, accessToken } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'accessToken is required' },
        { status: 400 }
      );
    }

    // Get user from access token to verify authentication
    // Note: We need to get the user JWT from the access token
    // For now, we'll get the user by wallet address to verify they exist
    const user = await privyClient.getUserByWalletAddress(walletAddress);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User or wallet not found' },
        { status: 404 }
      );
    }

    // Generate a user signer for server-side access
    // This creates a new key pair that can be used to sign transactions
    // Note: The accessToken from the client should be a JWT that can be used here
    // The walletApi.generateUserSigner method requires a userJwt parameter
    const signerResponse = await privyClient.walletApi.generateUserSigner({
      userJwt: accessToken,
    });

    // Store the signer's private key securely on your server
    // IMPORTANT: Store this securely (e.g., in a database with encryption)
    // The response structure may vary - check Privy docs for exact structure
    // Accessing properties that may exist on the response
    const response = signerResponse as any;
    const signerId = response.id || response.signerId || response.signer?.id;
    const privateKey = response.privateKey || response.key || response.signer?.privateKey;
    
    if (!signerId || !privateKey) {
      return NextResponse.json(
        { 
          error: 'Failed to extract signer information from response',
          debug: process.env.NODE_ENV === 'development' ? response : undefined
        },
        { status: 500 }
      );
    }

    // TODO: Store signerId and privateKey in your database
    // associated with the user's wallet address
    // Example:
    // await db.signers.create({
    //   walletAddress,
    //   signerId,
    //   privateKey: encrypt(privateKey), // Encrypt before storing
    //   userId: user.id
    // });

    return NextResponse.json({
      success: true,
      signerId,
      message: 'Signer created successfully. Store the private key securely on your server.',
      // NOTE: In production, never return the private key to the client
      // This is only for demonstration purposes
      privateKey: process.env.NODE_ENV === 'development' ? privateKey : undefined,
    });
  } catch (error) {
    console.error('Error creating signer:', error);
    return NextResponse.json(
      {
        error: 'Failed to create signer',
        message: error instanceof Error ? error.message : 'Unknown error',
        // Include more details in development
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.stack : undefined 
        })
      },
      { status: 500 }
    );
  }
}

