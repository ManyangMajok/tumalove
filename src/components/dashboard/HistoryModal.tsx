import { useState } from 'react';
import { X, Search } from 'lucide-react';
import type { Transaction } from '../../types/dashboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export default function HistoryModal({ isOpen, onClose, transactions }: Props) {
  const [historySearch, setHistorySearch] = useState('');

  if (!isOpen) return null;

  // Filter Logic
  const filteredHistory = transactions.filter(tx => 
     (tx.supporter_name || "").toLowerCase().includes(historySearch.toLowerCase()) ||
     (tx.mpesa_code || "").toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-500">Only successful payments shown.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or M-Pesa code..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No transactions found.</p>
            </div>
          ) : (
            filteredHistory.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 text-lg">
                    ☕
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{tx.supporter_name || "Anonymous"}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                      {tx.mpesa_code && (
                        <span className="font-mono bg-gray-200 px-1 rounded text-[10px]">{tx.mpesa_code}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">+ KES {tx.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-green-600 font-bold uppercase bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
                    Paid
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
          Export CSV feature coming soon.
        </div>
      </div>
    </div>
  );
}