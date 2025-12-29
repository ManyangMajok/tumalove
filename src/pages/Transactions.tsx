import { useState, useMemo } from 'react';
import { Download, Search, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useRealtimeQuery } from '../hooks/useRealtimeQuery';
import { useUser } from '../layouts/HeadlessAuth'; // <--- 1. INSTANT USER ACCESS
import DashboardHeader from '../components/dashboard/DashboardHeader';

type TimeFilter = 'all' | '30_days' | '6_months' | 'this_year';

export default function Transactions() {
  // 1. GET USER INSTANTLY (No waiting)
  const { user } = useUser();
  
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [search, setSearch] = useState('');
  const [, setCopied] = useState(false); // Add missing state for header

  // 2. 🔥 THE SPEED ENGINE (Fetches data immediately)
  const { data: pageData, isLoading } = useRealtimeQuery(
    ['transactions_page', user.id], 
    'transactions', 
    async () => {
      // Parallel fetch: Profile (for header) + ALL Transactions (for history)
      const [profileReq, txReq] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('transactions')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(500) // Get more history for this page
      ]);

      return {
        profile: profileReq.data,
        transactions: txReq.data || []
      };
    }
  );

  // 3. FILTERING LOGIC (Kept exactly the same)
  const filteredData = useMemo(() => {
    if (!pageData?.transactions) return [];
    
    const now = new Date();
    const searchLower = search.toLowerCase();

    return pageData.transactions.filter((tx: any) => {
      const matchesSearch =
        (tx.supporter_name || '').toLowerCase().includes(searchLower) ||
        (tx.supporter_message || '').toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      const txDate = new Date(tx.created_at);
      if (filter === '30_days') return txDate >= new Date(now.setDate(now.getDate() - 30));
      if (filter === '6_months') return txDate >= new Date(now.setMonth(now.getMonth() - 6));
      if (filter === 'this_year') return txDate.getFullYear() === new Date().getFullYear();

      return true;
    });
  }, [pageData?.transactions, filter, search]);

  const totalAmount = filteredData.reduce((sum, tx) => sum + tx.amount, 0);

  // 4. COPY LINK LOGIC
  const copyLink = () => { 
    const baseUrl = window.location.origin.replace(/(^\w+:|^)\/\//, '');
    const username = pageData?.profile?.username;
    if (username) {
        const link = `${window.location.protocol}//${baseUrl}/${username}`; 
        navigator.clipboard.writeText(link); 
        setCopied(true); 
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin opacity-50" />
      </div>
    );
  }

  const { profile } = pageData;

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-gray-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header needs 'copied' prop if your component uses it, otherwise ignore */}
      <DashboardHeader profile={profile} onCopyLink={copyLink} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500">Manage your earnings and support history.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
            {(['all', '30_days', '6_months', 'this_year'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filter === f
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all'
                  ? 'All Time'
                  : f.replace('_', ' ').replace('days', 'Days').replace('year', 'Year')}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or message..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="font-medium text-gray-500">Found:</span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
            {filteredData.length} records
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-500">Total:</span>
          <span className="text-gray-900 font-bold">
            KES {totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Supporter</th>
                  <th className="px-6 py-4 w-1/2">Message</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50 group transition-colors">
                      
                      {/* DATE */}
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px]">
                          {new Date(tx.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* SUPPORTER */}
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {tx.supporter_name || 'Anonymous'}
                      </td>

                      {/* MESSAGE */}
                      <td className="px-6 py-4 text-gray-600">
                        {tx.supporter_message ? (
                          <span className="text-sm text-gray-700">
                            "{tx.supporter_message}"
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300 italic">No message</span>
                        )}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-6 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                        + {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}