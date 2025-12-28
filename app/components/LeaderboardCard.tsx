'use client';

import { useState, useEffect } from 'react';
import { Button, Avatar } from 'antd';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import type { LeaderboardEntry } from './Leaderboard';
import { formatNumber } from '../utils/helpers';

interface LeaderboardCardProps {
  record: LeaderboardEntry;
  displayName: string;
  gradientColor: string;
  stats: any;
  timePeriod: string;
}

// Custom Tooltip component that updates state properly
function CustomTooltip({ active, payload, onValueChange }: any) {
  useEffect(() => {
    if (active && payload && payload[0]) {
      onValueChange(payload[0].value);
    } else {
      onValueChange(null);
    }
  }, [active, payload, onValueChange]);
  
  return null;
}

export default function LeaderboardCard({
  record,
  displayName,
  gradientColor,
  stats,
  timePeriod,
}: LeaderboardCardProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  // Get the last value from pnlData as default
  const lastValue = record.pnlData && record.pnlData.length > 0 
    ? record.pnlData[record.pnlData.length - 1].p 
    : record.pnl;
  const displayValue = hoveredValue !== null ? hoveredValue : lastValue;

  return (
    <div
      className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333] flex flex-col h-full cursor-pointer transition-all duration-200 hover:border-[#555] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1"
      onClick={() => {
        const username = record.userName || record.xUsername;
        if (username) {
          window.open(`https://polymarket.com/@${username}`, '_blank');
        }
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-3">
        {/* Left: Avatar and User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            src={record.profileImage && record.profileImage.trim() !== '' ? record.profileImage : undefined}
            style={{
              background: (record.profileImage && record.profileImage.trim() !== '')
                ? 'transparent' 
                : `linear-gradient(135deg, ${gradientColor}, ${gradientColor}dd)`,
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
            size={48}
            className="flex-shrink-0"
          >
            {(!record.profileImage || record.profileImage.trim() === '') && displayName.charAt(0).toUpperCase()}
          </Avatar>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-base text-white truncate">
                {displayName}
              </span>
              {record.verifiedBadge && (
                <span className="text-yellow-400 flex-shrink-0">👑</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">
              Joined {stats?.joinDate}
            </div>
          </div>
        </div>
        
        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[80px]">
          <Button 
            size="small" 
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(record.proxyWallet).then(() => {
                console.log('Copied to clipboard');
              }).catch(err => {
                console.error('Failed to copy:', err);
              });
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Left Column: PnL with Chart */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Small PnL Chart */}
          <div className="text-xs text-gray-400 mb-1 flex-shrink-0 flex items-center justify-between">
            <span>All-time PnL</span>
            {record.pnlData && record.pnlData.length > 0 && (
              <span className={`font-semibold ${displayValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {displayValue >= 0 ? '+' : ''}${formatNumber(displayValue)}
              </span>
            )}
          </div>
          {record.pnlData && record.pnlData.length > 0 && (
            <div 
              className="flex-1 -ml-2 -mr-2 min-h-0 w-full"
              onMouseLeave={() => setHoveredValue(null)}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={record.pnlData.map((point) => ({
                    timestamp: point.t * 1000,
                    value: point.p,
                  }))} 
                  margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                >
                  <Tooltip
                    content={<CustomTooltip onValueChange={setHoveredValue} />}
                    cursor={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={record.pnl >= 0 ? "#10b981" : "#ef4444"} 
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Column: Total Value and Other Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-gray-400 mb-1">
              {timePeriod === 'DAY' ? '1D' : 
              timePeriod === 'WEEK' ? '7D' : 
              timePeriod === 'MONTH' ? '30D' : 
              'All'} PnL
            </div>
            <div className={`font-semibold text-sm ${record.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {record.pnl >= 0 ? '+' : ''}${formatNumber(record.pnl)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">
            {timePeriod === 'DAY' ? '1D' : 
              timePeriod === 'WEEK' ? '7D' : 
              timePeriod === 'MONTH' ? '30D' : 
              'All'} Vol
            </div>
            <div className="text-white font-semibold text-xs">
              ${formatNumber(record.vol)}
            </div>
          </div>
          {record.totalValue !== null && record.totalValue !== undefined && (
            <div>
              <div className="text-xs text-gray-400 mb-1">
                AUM
              </div>
              <div className="text-white font-semibold text-xs">
                ${formatNumber(record.totalValue)}
              </div>
            </div>
          )}
          {stats?.trades !== undefined && (
            <div>
              <div className="text-xs text-gray-400 mb-1">
                Prediction
              </div>
              <div className="text-white font-semibold text-xs">
                {formatNumber(stats.trades)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

