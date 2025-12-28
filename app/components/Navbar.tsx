'use client';

import { usePrivy, useWallets, useSigners, useLogin } from '@privy-io/react-auth';
import { Button } from 'antd';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { ready, authenticated, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { addSigners } = useSigners();
  const [hasCheckedDelegation, setHasCheckedDelegation] = useState(false);
  
  const authorizationKeyId = process.env.NEXT_PUBLIC_PRIVY_AUTHORIZATION_ID;

  // Use useLogin with onComplete callback to automatically delegate for new users
  const { login } = useLogin({
    onComplete: async ({ user, isNewUser }) => {
      if (isNewUser && user.wallet?.address && authorizationKeyId) {
        try {
          // Automatically add session signers for new users
          await addSigners({
            address: user.wallet.address,
            signers: [{
              signerId: authorizationKeyId,
              // Empty array means full permission, or specify policy IDs for restricted access
              policyIds: []
            }]
          });
          console.log('✅ Auto-delegation successful for new user:', user.wallet.address);
        } catch (error) {
          // If signer already exists (duplicate), treat it as success
          if (error instanceof Error && 
              (error.message.includes('Duplicate signer') || 
               error.message.includes('already been added'))) {
            console.log('✅ Signer already exists for new user:', user.wallet.address);
          } else {
            console.error('❌ Error auto-delegating for new user:', error);
            // If wallet proxy not initialized, the useEffect will handle it later
          }
        }
      }
    }
  });

  const handleConnect = async () => {
    if (!authenticated) {
      await login();
    }
  };

  const handleDisconnect = async () => {
    setHasCheckedDelegation(false);
    await logout();
  };

  if (!ready) {
    return (
      <nav className="bg-[#1a1a1a] border-b border-[#333] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white m-0">
            PolyCopy
          </h1>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#333] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white m-0">
          PolyCopy
        </h1>
        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              {wallets[0] && (
                <div className="text-sm text-gray-400 mr-2">
                  {wallets[0].address.slice(0, 6)}...{wallets[0].address.slice(-4)}
                </div>
              )}
              <Button
                size="small"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={handleConnect}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

