import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import type { WithdrawalRequest } from '../types';
import { Check, Loader2, Smartphone, Clock, Lock } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth'; // Import hook

export default function WithdrawalQueue() {
  const { role } = useAdminAuth(); // role: 'admin' | 'operator' | 'viewer'
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from('withdrawals')
      .select('*, profiles(username, full_name, mpesa_number)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });
    setRequests(data || []);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const approve = async (id: string) => {
    if (!window.confirm('Are you sure you want to release these funds? This action cannot be undone.')) return;

    setLoadingId(id);
    const { error } = await supabase.rpc('complete_withdrawal', { p_withdrawal_id: id });
    if (error) alert(error.message);
    else await fetchQueue();
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Pending Requests</h3>
        <span className="bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {requests.length} Pending
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-medium">All caught up!</h3>
            <p className="text-slate-500 text-sm mt-1">No withdrawal requests pending approval.</p>
          </div>
        ) : (
          requests.map(req => (
            <div
              key={req.id}
              className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  {req.profiles.username[0].toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">@{req.profiles.username}</h4>
                    <span className="text-xs text-slate-400 border border-slate-200 px-1.5 rounded">
                      {req.profiles.full_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Smartphone size={14} />
                      <span className="font-mono">{req.profiles.mpesa_number}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock size={12} />
                      {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                <div className="text-right">
                  <span className="block font-bold text-lg text-slate-900">
                    KES {req.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">
                    Amount
                  </span>
                </div>

                {/* 🔐 Role-based restriction */}
                {role === 'viewer' ? (
                  <button
                    disabled
                    className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 cursor-not-allowed mt-2 ml-auto"
                  >
                    <Lock size={14} /> View Only
                  </button>
                ) : (
                  <button
                    onClick={() => approve(req.id)}
                    disabled={!!loadingId}
                    className="bg-slate-900 text-white hover:bg-emerald-600 px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all mt-2 ml-auto shadow-sm hover:shadow-emerald-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === req.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
