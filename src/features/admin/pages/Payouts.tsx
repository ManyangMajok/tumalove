import { useState } from 'react';
import { supabase } from '../../../supabaseClient';

import { AdminToast, useToast } from '../components/AdminToast';
import { useRealtimeQuery } from '../../../hooks/useRealtimeQuery';
import {
  Check,
  X,
  Clock,
  Banknote,
  History,
  ArrowRight,
  Loader2,
  Copy,
  Wallet,
} from 'lucide-react';

/* =======================
   Types
======================= */
interface Withdrawal {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  mpesa_reference?: string;
  profiles: {
    username: string;
    full_name: string;
    mpesa_number: string;
  };
}

/* =======================
   Skeleton Loader
======================= */
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="flex items-center justify-between px-6 py-4 border-b border-slate-50"
      >
        <div className="w-24 h-4 bg-slate-100 rounded" />
        <div className="w-32 h-4 bg-slate-100 rounded" />
        <div className="w-20 h-4 bg-slate-100 rounded" />
        <div className="w-16 h-4 bg-slate-100 rounded" />
        <div className="w-20 h-8 bg-slate-100 rounded-lg" />
      </div>
    ))}
  </div>
);

/* =======================
   Component
======================= */
export default function Payouts() {
  
  const { toast, showToast, hideToast } = useToast();

  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refCode, setRefCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =======================
     Realtime + Cache Engine
  ======================= */
  const { data: withdrawals = [], isLoading } = useRealtimeQuery(
    ['withdrawals', activeTab],
    'withdrawals',
    async () => {
      let query = supabase
        .from('withdrawals')
        .select('*, profiles(username, full_name, mpesa_number)')
        .order('created_at', { ascending: false });

      if (activeTab === 'queue') {
        query = query.eq('status', 'PENDING');
      } else {
        query = query.neq('status', 'PENDING');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Withdrawal[];
    }
  );

  /* =======================
     Actions
  ======================= */
  const handleApprove = async () => {
    if (!selectedId || !refCode) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc('complete_withdrawal', {
        p_withdrawal_id: selectedId,
        p_mpesa_reference: refCode.toUpperCase(),
      });

      if (error) throw error;

      showToast(`Payout confirmed • ${refCode.toUpperCase()}`, 'success');
      setSelectedId(null);
      setRefCode('');
    } catch (err: any) {
      showToast(err.message || 'Failed to process payout', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'info');
  };



  return (
    <>
      <AdminToast {...toast} onClose={hideToast} />

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Payouts Manager
          </h1>
          <p className="text-slate-500 mt-1">
            Process withdrawals and reconcile M-Pesa transactions.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition ${
              activeTab === 'queue'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Banknote size={16} />
            Queue
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition ${
              activeTab === 'history'
                ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : withdrawals.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Wallet size={32} />
            </div>
            <p className="font-medium text-slate-500">All caught up!</p>
            <p className="text-sm mt-1">No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase">
                    M-Pesa
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-right">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w: Withdrawal) => (
                  <FragmentRow
                    key={w.id}
                    w={w}
                    activeTab={activeTab}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    refCode={refCode}
                    setRefCode={setRefCode}
                    isSubmitting={isSubmitting}
                    handleApprove={handleApprove}
                    copyToClipboard={copyToClipboard}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* =======================
   Fragment Row (clean)
======================= */
function FragmentRow({
  w,
  activeTab,
  selectedId,
  setSelectedId,
  refCode,
  setRefCode,
  isSubmitting,
  handleApprove,
  copyToClipboard,
}: any) {
  return (
    <>
      <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 text-xs font-mono text-slate-600">
          <Clock size={12} className="inline mr-1" />
          {new Date(w.created_at).toLocaleString()}
        </td>

        <td className="px-6 py-4">
          <div className="font-bold">{w.profiles.full_name}</div>
          <div className="text-xs text-slate-500">@{w.profiles.username}</div>
        </td>

        <td className="px-6 py-4">
          <button
            onClick={() => copyToClipboard(w.profiles.mpesa_number)}
            className="font-mono text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-2"
          >
            {w.profiles.mpesa_number}
            <Copy size={12} />
          </button>
        </td>

        <td className="px-6 py-4 text-right font-bold">
          KES {w.amount.toLocaleString()}
        </td>

        <td className="px-6 py-4 text-center">
          {activeTab === 'queue' ? (
            <button
              onClick={() => setSelectedId(w.id)}
              className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs flex items-center gap-1"
            >
              Pay <ArrowRight size={14} />
            </button>
          ) : (
            <span className="text-xs font-bold text-green-600 flex items-center justify-center gap-1">
              <Check size={12} />
              COMPLETED
            </span>
          )}
        </td>
      </tr>

      {selectedId === w.id && (
        <tr className="bg-emerald-50">
          <td colSpan={5} className="px-6 py-4">
            <div className="flex gap-4 items-center">
              <input
                placeholder="M-Pesa Ref"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border"
              />
              <button
                onClick={handleApprove}
                disabled={!refCode || isSubmitting}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Confirm
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
