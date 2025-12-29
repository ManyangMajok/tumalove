import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useRealtimeQuery } from '../hooks/useRealtimeQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../layouts/HeadlessAuth';

// Component Imports
import DashboardHeader from '../components/dashboard/DashboardHeader';
import BalanceCard from '../components/dashboard/BalanceCard';
import StatsOverview from '../components/dashboard/StatsOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import Leaderboard from '../components/dashboard/Leaderboard';
import WithdrawalModal from '../components/dashboard/WithdrawalModal';
import WithdrawalHistory from '../components/dashboard/WithdrawalHistory';

export default function Dashboard() {
  // 1. INSTANT USER ACCESS
  const { user } = useUser();
  
  const [copied, setCopied] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const queryClient = useQueryClient();

  // 2. 🔥 THE SPEED ENGINE
  const { data: dashboardData, isLoading } = useRealtimeQuery(
    ['creator_dashboard_full', user.id], 
    'transactions', 
    async () => {
      const [profileReq, balanceReq, activityReq] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('creator_balances').select('*').eq('creator_id', user.id).single(),
        supabase.from('transactions')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      return {
        profile: profileReq.data,
        balances: balanceReq.data || { available_balance: 0, pending_balance: 0 },
        transactions: activityReq.data || []
      };
    }
  );

  // 3. SMART ANALYTICS
  const topSupporters = useMemo(() => {
    if (!dashboardData?.transactions) return [];
    
    const supporters: Record<string, { name: string; totalAmount: number; count: number }> = {};
    
    dashboardData.transactions.forEach((t: any) => {
      if (t.status === 'COMPLETED' && t.amount > 0) {
        const name = t.supporter_name || 'Anonymous';
        if (!supporters[name]) {
          supporters[name] = { name, totalAmount: 0, count: 0 };
        }
        supporters[name].totalAmount += t.amount;
        supporters[name].count += 1;
      }
    });

    return Object.values(supporters)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, [dashboardData?.transactions]);

  // 4. CLEAN COPY LOGIC
  const copyLink = () => { 
    const baseUrl = window.location.origin.replace(/(^\w+:|^)\/\//, '');
    const username = dashboardData?.profile?.username;
    
    if (username) {
        const link = `${window.location.protocol}//${baseUrl}/${username}`; 
        navigator.clipboard.writeText(link); 
        setCopied(true); 
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin opacity-50" />
      </div>
    );
  }

  const { profile, balances, transactions } = dashboardData;

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-slate-900 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* HEADER SECTION */}
      <DashboardHeader profile={profile} onCopyLink={copyLink} />

      {/* MAIN CONTENT GRID */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (Main Stats) - Spans 8 cols on large screens */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Financials */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
                <BalanceCard 
                    available={balances.available_balance}
                    pending={balances.pending_balance}
                    onWithdraw={() => setIsWithdrawOpen(true)}
                    copied={copied} 
                    onCopyLink={copyLink} 
                />
            </div>

            {/* Metrics */}
            <StatsOverview transactions={transactions} />

            {/* Activity Feed */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <RecentActivity 
                    transactions={transactions} 
                    onCopyLink={copyLink}
                />
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar) - Spans 4 cols on large screens */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Leaderboard - REMOVED 'sticky' so it scrolls naturally */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <Leaderboard supporters={topSupporters} />
            </div>
            
            {/* History Widget */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <WithdrawalHistory userId={profile?.id} />
            </div>
          </div>
        </div>
      </main>

      {/* WITHDRAWAL MODAL */}
      <WithdrawalModal 
        isOpen={isWithdrawOpen} 
        onClose={() => setIsWithdrawOpen(false)}
        balance={balances.available_balance}
        userId={profile?.id}
        onSuccess={() => {
            setIsWithdrawOpen(false);
            queryClient.invalidateQueries({ queryKey: ['creator_dashboard_full'] });
            queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
        }}
      />
    </div>
  );
}