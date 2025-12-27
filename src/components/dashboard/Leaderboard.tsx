import { Trophy } from 'lucide-react';
import type { TopSupporter } from '../../types/dashboard';

export default function Leaderboard({ supporters }: { supporters: TopSupporter[] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
          <Trophy className="w-4 h-4 fill-current" />
        </div>
        <h2 className="font-bold text-gray-900">Top Supporters</h2>
      </div>

      {supporters.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Leaderboard needs more data.</p>
      ) : (
        <div className="space-y-4">
          {supporters.map((supporter, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 
                 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-800'}`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm truncate">{supporter.name}</div>
                <div className="text-xs text-gray-400">{supporter.count} payments</div>
              </div>
              <div className="font-bold text-sm text-emerald-600">KES {supporter.totalAmount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}