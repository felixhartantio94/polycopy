'use client';

import { useState } from 'react';
import { 
  ConfigProvider,
  theme
} from 'antd';
import LeaderboardCard from './LeaderboardCard';
import LeaderboardFilters from './LeaderboardFilters';
import { getGradientColor, formatAddress } from '../utils/helpers';
import { useLeaderboard } from '../hooks/useLeaderboard';

// Export interface for use in other components
export interface LeaderboardEntry {
  rank: string;
  proxyWallet: string;
  userName: string;
  vol: number;
  pnl: number;
  profileImage: string;
  xUsername: string;
  verifiedBadge: boolean;
  profileStats?: {
    trades?: number;
    largestWin?: number;
    views?: number;
    joinDate?: string;
  } | null;
  pnlData?: Array<{
    t: number;
    p: number;
  }> | null;
  totalValue?: number | null;
}

export default function Leaderboard() {
  const [category, setCategory] = useState('OVERALL');
  const [timePeriod, setTimePeriod] = useState('MONTH');
  const [orderBy, setOrderBy] = useState('PNL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { data: allData, loading, error, hasMore, isLoadingMore } = useLeaderboard({
    category,
    timePeriod,
    orderBy,
    limit: 10,
  });

  const filteredData = allData.filter((entry: LeaderboardEntry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.userName?.toLowerCase().includes(query) ||
      entry.proxyWallet.toLowerCase().includes(query) ||
      entry.xUsername?.toLowerCase().includes(query)
    );
  });

  const categoryLabels: { [key: string]: string } = {
    'OVERALL': 'All Categories',
    'POLITICS': 'Politics',
    'SPORTS': 'Sports',
    'CRYPTO': 'Crypto',
    'CULTURE': 'Culture',
    'MENTIONS': 'Mentions',
    'WEATHER': 'Weather',
    'ECONOMICS': 'Economics',
    'TECH': 'Tech',
    'FINANCE': 'Finance'
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#0a0a0a',
          colorText: '#ffffff',
          colorBorder: '#333',
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <LeaderboardFilters
            timePeriod={timePeriod}
            category={category}
            searchQuery={searchQuery}
            isSearchModalOpen={isSearchModalOpen}
            categoryLabels={categoryLabels}
            onTimePeriodChange={setTimePeriod}
            onCategoryChange={setCategory}
            onSearchQueryChange={setSearchQuery}
            onSearchModalOpen={setIsSearchModalOpen}
          />

          {/* Error State */}
          {error && (
            <div className="p-4 bg-[#2a1a1a] text-[#ff4444] rounded-lg mb-4 border border-[#442222]">
              Error: {error}
            </div>
          )}

          {/* Card View - Grid layout for all screen sizes */}
          <div>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((record) => {
                  const displayName = record.userName || formatAddress(record.proxyWallet);
                  const gradientColor = getGradientColor(record.proxyWallet);
                  const stats = record.profileStats;
                
                  return (
                    <LeaderboardCard
                      key={record.proxyWallet}
                      record={record}
                      displayName={displayName}
                      gradientColor={gradientColor}
                      stats={stats}
                      timePeriod={timePeriod}
                    />
                  );
                })}
              </div>
            )}
            
            {isLoadingMore && (
              <div className="text-center py-4 text-gray-400">
                Loading more...
              </div>
            )}
            {!hasMore && filteredData.length > 0 && (
              <div className="text-center py-4 text-gray-400">
                No more data to load
              </div>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

