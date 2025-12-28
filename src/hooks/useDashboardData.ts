import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Profile, Transaction, TopSupporter } from '../types/dashboard';

// New Interface for the Balances Table
interface CreatorBalance {
  available_balance: number;
  pending_balance: number;
  lifetime_earnings: number;
}

export function useDashboardData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // NEW: State for Balances
  const [balances, setBalances] = useState<CreatorBalance>({
    available_balance: 0,
    pending_balance: 0,
    lifetime_earnings: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData?.mpesa_number) { navigate('/setup'); return; }
      setProfile(profileData);

      // 2. NEW: Fetch Real Balances (The Truth Source)
      const { data: balanceData } = await supabase
        .from('creator_balances')
        .select('available_balance, pending_balance, lifetime_earnings')
        .eq('creator_id', user.id)
        .maybeSingle(); // Use maybeSingle in case they are new and row doesn't exist yet

      if (balanceData) {
        setBalances(balanceData);
      }

      // 3. Fetch Transactions (For display only, not for math)
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('creator_id', user.id)
        .in('status', ['COMPLETED', 'SUCCESS'])
        .order('created_at', { ascending: false });

      if (txData) setTransactions(txData);

    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Top Supporters Logic (Stays the same - purely visual)
  const topSupporters = transactions.reduce<Record<string, TopSupporter>>((acc, tx) => {
      const name = tx.supporter_name || 'Anonymous';
      if (!acc[name]) acc[name] = { name, totalAmount: 0, count: 0 };
      acc[name].totalAmount += tx.amount; // Rank by Gross Amount (Generosity)
      acc[name].count += 1;
      return acc;
  }, {});

  const sortedSupporters = Object.values(topSupporters)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3);

  return { 
    loading, 
    profile, 
    transactions, 
    topSupporters: sortedSupporters,
    balances // <--- Return the real balances
  };
}