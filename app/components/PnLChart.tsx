'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PnLDataPoint {
  t: number;
  p: number;
}

interface PnLChartProps {
  data: PnLDataPoint[];
  currentPnL: number;
}

export default function PnLChart({ data, currentPnL }: PnLChartProps) {
  // Transform data for chart
  const chartData = data.map((point) => ({
    timestamp: point.t * 1000, // Convert to milliseconds
    value: point.p,
    date: new Date(point.t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Format value for display
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{formatValue(payload[0].value)}</p>
          <p className="text-gray-400 text-sm">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#666', fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

