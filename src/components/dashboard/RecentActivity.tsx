import { ChevronRight, Clock, Copy, User } from 'lucide-react'; // Added User icon
import { Link } from 'react-router-dom';
import type { Transaction } from '../../types/dashboard';

interface Props {
  transactions: Transaction[];
  onCopyLink: () => void;
}

export default function RecentActivity({ transactions, onCopyLink }: Props) {
  if (transactions.length === 0) {
    return (
       // ... (Keep your empty state code here) ...
       <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-gray-900 font-bold mb-1">No payments yet</h3>
        <p className="text-gray-500 text-sm mb-6">Share your link to get the ball rolling.</p>
        <button onClick={onCopyLink} className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline">
          <Copy className="w-4 h-4" /> Copy your link
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
        <Link to="/transactions" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2">
        {transactions.slice(0, 10).map((tx) => (
          <div key={tx.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start hover:border-emerald-200 transition-colors">
            
            {/* Simple User Icon (or use their Avatar if you ever add that feature) */}
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border border-gray-200 mt-0.5">
               <User className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                
                {/* COMPACT CHAT STYLE LAYOUT */}
                <div className="text-sm leading-snug pr-4">
                  <span className="font-bold text-gray-900 mr-2">
                    {tx.supporter_name || "Anonymous"}
                  </span>
                  <span className="text-gray-600 break-words">
                    {tx.supporter_message || "Supported you!"}
                  </span>
                </div>
                
                {/* Amount */}
                <span className="text-emerald-600 font-bold text-xs whitespace-nowrap">
                  + {tx.amount.toLocaleString()}
                </span>
              </div>

              {/* Timestamp */}
              <div className="text-[10px] text-gray-400 font-medium mt-1">
                {new Date(tx.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}