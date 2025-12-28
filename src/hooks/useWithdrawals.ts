import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface Withdrawal {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW';
  created_at: string;
  mpesa_reference?: string;
}

export function useWithdrawals(userId: string | undefined) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAll, setViewAll] = useState(false); // Controls the mode

  useEffect(() => {
    if (userId) fetchWithdrawals();
  }, [userId, viewAll]); // Re-fetch when mode changes

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('withdrawals')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      // EFFICIENCY: Only verify date if we are NOT in 'View All' mode
      if (!viewAll) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  return { withdrawals, loading, viewAll, setViewAll, refresh: fetchWithdrawals };
}