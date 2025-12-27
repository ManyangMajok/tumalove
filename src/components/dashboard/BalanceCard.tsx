import { Wallet, Check, Share2 } from 'lucide-react';

interface Props {
  balance: number;
  copied: boolean;
  onCopyLink: () => void;
}

export default function BalanceCard({ balance, copied, onCopyLink }: Props) {
  const handleWithdraw = () => alert("Instant B2C withdrawals coming in V1.1 update!");

  return (
    <div className="bg-emerald-600 text-white rounded-3xl p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="relative z-10">
        <div className="text-emerald-100 text-sm font-medium mb-1 flex items-center gap-2">
          <Wallet className="w-4 h-4" /> Available Balance
        </div>
        <div className="text-4xl font-bold mb-8 tracking-tight">
          KES {balance?.toLocaleString() || '0.00'}
        </div>
        <div className="flex gap-3">
          <button onClick={handleWithdraw} className="flex-1 bg-white text-emerald-600 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-lg active:scale-95 transform duration-100">
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