'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from 'antd';

export default function Navbar() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const handleConnect = async () => {
    if (!authenticated) {
      await login();
    }
  };

  const handleDisconnect = async () => {
    await logout();
  };

  const handleEnableServerAccess = async () => {
    if (!authenticated || !wallets[0]) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      // Get the access token from Privy
      const accessToken = await user?.getAccessToken();
      
      if (!accessToken) {
        alert('Failed to get access token');
        return;
      }

      const response = await fetch('/api/wallet/add-signer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: wallets[0].address,
          accessToken,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Server-side access enabled successfully! Signer ID: ' + data.signerId);
      } else {
        alert('Error: ' + (data.error || data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error enabling server access:', error);
      alert('Failed to enable server-side access');
    }
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
                type="primary"
                size="small"
                onClick={handleEnableServerAccess}
              >
                Enable Server Access
              </Button>
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

