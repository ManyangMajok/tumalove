import { Wallet, Check, Share2, Clock, Lock } from 'lucide-react';
// Removed unused 'useState' import

interface Props {
  available: number;
  pending: number;
  copied: boolean;
  onCopyLink: () => void;
  onWithdraw: () => void;
}

export default function BalanceCard({ available, pending, copied, onCopyLink, onWithdraw }: Props) {
  return (
    <div className="bg-emerald-600 text-white rounded-3xl p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-emerald-100 text-sm font-medium mb-1 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Available for Withdrawal
            </div>
            <div className="text-4xl font-bold tracking-tight mb-2">
              KES {available.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Pending Balance Section */}
        {pending > 0 && (
          <div className="mb-6 bg-emerald-700/40 rounded-lg p-3 inline-flex items-center gap-3 border border-emerald-500/30">
            <div className="p-1.5 bg-emerald-500/20 rounded-full">
               <Clock className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <div>
              <span className="text-xs text-emerald-200 block font-medium uppercase tracking-wider">Pending Settlement</span>
              <span className="text-sm font-bold">KES {pending.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button 
            onClick={onWithdraw}
            disabled={available < 100} 
            className="flex-1 bg-white text-emerald-600 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg active:scale-95 transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {available < 100 ? <Lock className="w-4 h-4" /> : null}
            Withdraw Funds
          </button>
          
          <button onClick={onCopyLink} className="flex-1 bg-emerald-700/50 text-white border border-emerald-500 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Share Link"}
          </button>
        </div>
      </div>
    </div>
  );
}