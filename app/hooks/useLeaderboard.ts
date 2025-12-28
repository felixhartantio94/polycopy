import { useState, useEffect, useCallback, useRef } from 'react';
import type { LeaderboardEntry } from '../components/Leaderboard';

interface UseLeaderboardOptions {
  category: string;
  timePeriod: string;
  orderBy: string;
  limit?: number;
}

export function useLeaderboard({
  category,
  timePeriod,
  orderBy,
  limit = 10,
}: UseLeaderboardOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allData, setAllData] = useState<LeaderboardEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const allDataRef = useRef<LeaderboardEntry[]>([]);

  const fetchLeaderboard = useCallback(async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setAllData([]);
      allDataRef.current = [];
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const offset = reset ? 0 : allDataRef.current.length;
      const params = new URLSearchParams({
        category,
        timePeriod,
        orderBy,
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      const response = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const result = await response.json();
      
      if (reset) {
        setAllData(result);
        allDataRef.current = result;
      } else {
        setAllData(prev => {
          const newData = [...prev, ...result];
          allDataRef.current = newData;
          return newData;
        });
      }
      
      // Check if there's more data
      setHasMore(result.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [category, timePeriod, orderBy, limit]);

  // Reset and fetch when filters change
  useEffect(() => {
    setAllData([]);
    allDataRef.current = [];
    setHasMore(true);
    fetchLeaderboard(true);
  }, [category, timePeriod, orderBy, fetchLeaderboard]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore || !hasMore || loading) return;
      
      const scrollTop = window.innerHeight + document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.offsetHeight;
      
      // Load more when user is 200px from bottom
      if (scrollTop >= scrollHeight - 200) {
        fetchLeaderboard(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore, loading, fetchLeaderboard]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    isLoadingMore,
    refetch: () => fetchLeaderboard(true),
  };
}

