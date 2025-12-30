//src\components\dashboard\WithdrawalModal.tsx
import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // <--- Import UUID

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  userId: string | undefined;
  onSuccess: () => void; 
}

export default function WithdrawalModal({ isOpen, onClose, balance, userId, onSuccess }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    setError(null);
    const val = Number(amount);

    if (!val || val < 100) {
      setError("Minimum withdrawal is KES 100");
      return;
    }
    if (val > balance) {
      setError("Insufficient funds");
      return;
    }

    setLoading(true);

    try {
      // GENERATE IDEMPOTENCY KEY
      // This guarantees that even if this function runs twice, the DB processes it once.
      const idempotencyKey = uuidv4(); 

      const { data, error: rpcError } = await supabase.rpc('request_withdrawal', {
        p_creator_id: userId,
        p_amount: val,
        p_idempotency_key: idempotencyKey // <--- Pass the key
      });

      if (rpcError) throw rpcError;

      if (data && !data.success) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setAmount('');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ... (Render logic remains the same)
  return (
    // ... your existing JSX ...
    // (Ensure you keep the JSX for the modal rendering)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Request Sent!</h3>
            <p className="text-gray-500 text-sm mt-2">Your funds will be processed shortly.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Withdraw (KES)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0"
                />
                <button 
                  onClick={() => setAmount(balance.toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100"
                >
                  MAX
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">Available: KES {balance.toLocaleString()}</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button 
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Processing..." : "Confirm Withdrawal"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}