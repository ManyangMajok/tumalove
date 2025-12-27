import { TrendingUp, Users } from 'lucide-react';
import type { Transaction } from '../../types/dashboard';

interface Props {
  transactions: Transaction[];
}

export default function StatsOverview({ transactions }: Props) {
  // Calculate unique fans
  const uniqueFans = new Set(transactions.map(t => t.supporter_name)).size;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Total Payments Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-100 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Payments</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
      </div>

      {/* Unique Fans Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-100 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Unique Fans</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{uniqueFans}</div>
      </div>
    </div>
  );
}