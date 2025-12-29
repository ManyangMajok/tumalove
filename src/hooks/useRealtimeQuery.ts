// src/hooks/useRealtimeQuery.ts
import { useEffect } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

/**
 * Custom hook for fetching data with React Query + Supabase Realtime.
 *
 * @param key - Unique query key
 * @param table - Supabase table to listen to
 * @param queryFn - Async function returning data
 */
export function useRealtimeQuery<T = any>(
  key: readonly unknown[],
  table: string,
  queryFn: () => Promise<T>
): UseQueryResult<T> {
  const queryClient = useQueryClient();

  // Stable key string for useEffect dependencies
  const keyString = JSON.stringify(key);

  // Standard React Query fetch
  const query = useQuery<T>({
    queryKey: key,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Realtime subscription
  useEffect(() => {
    const channelName = `realtime_${table}_${keyString}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          console.log(`⚡ Realtime update: ${table}`);
          queryClient.invalidateQueries({ queryKey: key });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [keyString, table, queryClient]);

  return query;
}
