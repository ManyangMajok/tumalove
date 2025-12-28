import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

// Component Imports
import DashboardHeader from '../components/dashboard/DashboardHeader';
import BalanceCard from '../components/dashboard/BalanceCard';
import StatsOverview from '../components/dashboard/StatsOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import Leaderboard from '../components/dashboard/Leaderboard';
import WithdrawalModal from '../components/dashboard/WithdrawalModal'; // New Import

export default function Dashboard() {
  // Now fetching 'balances' instead of just 'totalEarnings'
  const { loading, profile, transactions, topSupporters, balances } = useDashboardData();
  
  const [copied, setCopied] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false); // Modal State

  const copyLink = () => { 
    const baseUrl = window.location.origin.replace('http://', '').replace('https://', '');
    const link = `${baseUrl}/@${profile?.username}`; 
    navigator.clipboard.writeText(link); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-gray-900 pb-20">
      
      <DashboardHeader profile={profile} onCopyLink={copyLink} />

      <main className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* UPDATED: Pass split balances and withdrawal handler */}
          <BalanceCard 
             available={balances.available_balance}
             pending={balances.pending_balance}
             copied={copied} 
             onCopyLink={copyLink} 
             onWithdraw={() => setIsWithdrawOpen(true)}
          />

          <StatsOverview transactions={transactions} />

          <RecentActivity 
            transactions={transactions} 
            onCopyLink={copyLink}
          />
        </div>

        <div className="space-y-6">
          <Leaderboard supporters={topSupporters} />
        </div>
      </main>

      {/* NEW: Withdrawal Modal */}
      <WithdrawalModal 
        isOpen={isWithdrawOpen} 
        onClose={() => setIsWithdrawOpen(false)}
        balance={balances.available_balance}
        userId={profile?.id}
        onSuccess={() => window.location.reload()} // Simple refresh to update balance
      />
    </div>
  );
}