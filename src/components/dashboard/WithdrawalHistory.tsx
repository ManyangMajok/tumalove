import { ArrowUpRight, Clock, CheckCircle, AlertCircle, History, ChevronDown } from 'lucide-react';
import { useWithdrawals, type Withdrawal } from '../../hooks/useWithdrawals';

interface Props {
  userId: string | undefined;
}

export default function WithdrawalHistory({ userId }: Props) {
  const { withdrawals, loading, viewAll, setViewAll } = useWithdrawals(userId);

  // Helper for Status Badges
  const getStatusStyle = (status: Withdrawal['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'MANUAL_REVIEW': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIcon = (status: Withdrawal['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-3 h-3" />;
      case 'PENDING': return <Clock className="w-3 h-3" />;
      case 'FAILED': return <AlertCircle className="w-3 h-3" />;
      default: return <History className="w-3 h-3" />;
    }
  };

  if (loading && withdrawals.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-500 animate-pulse">Loading history...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-gray-400" /> Withdrawals
        </h3>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setViewAll(!viewAll)}
          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          {viewAll ? 'Show Recent' : 'View All'}
          <ChevronDown className={`w-3 h-3 transition-transform ${viewAll ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
              <History className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500">No withdrawals {viewAll ? 'found' : 'in last 30 days'}.</p>
          </div>
        ) : (
          withdrawals.map((tx) => (
            <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${getStatusStyle(tx.status)}`}>
                    {getIcon(tx.status)} {tx.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                {tx.mpesa_reference && (
                  <p className="text-[10px] text-gray-400 font-mono">
                    Ref: <span className="text-gray-600 select-all">{tx.mpesa_reference}</span>
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="block font-bold text-gray-900 text-sm">
                  KES {tx.amount.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer Info */}
      {!viewAll && withdrawals.length > 0 && (
        <div className="p-2 bg-gray-50 text-center text-[10px] text-gray-400 border-t border-gray-100">
          Showing last 30 days
        </div>
      )}
    </div>
  );
}