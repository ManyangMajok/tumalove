import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Profile, Transaction, TopSupporter } from '../types/dashboard';

export function useDashboardData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData?.mpesa_number) { navigate('/setup'); return; }
      setProfile(profileData);

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('creator_id', user.id)
        .in('status', ['COMPLETED', 'SUCCESS']) // Strict Filter
        .order('created_at', { ascending: false });

      if (txData) setTransactions(txData);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logic: Calculate Total Earnings directly from history
  const totalEarnings = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const topSupporters = useMemo(() => {
    const map: Record<string, TopSupporter> = {};
    transactions.forEach((tx) => {
      const name = tx.supporter_name || 'Anonymous';
      if (!map[name]) map[name] = { name, totalAmount: 0, count: 0 };
      map[name].totalAmount += tx.amount;
      map[name].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3);
  }, [transactions]);

  return { loading, profile, transactions, topSupporters, totalEarnings };
}