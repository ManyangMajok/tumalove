import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { ShieldCheck, AlertOctagon, RefreshCw } from 'lucide-react';

export default function SystemAuditor() {
  const [status, setStatus] = useState<'HEALTHY' | 'CRITICAL' | 'LOADING'>('LOADING');
  const [gap, setGap] = useState(0);

  const checkHealth = async () => {
    const { data } = await supabase.from('escrow_reconciliation').select('*').single();
    if (data) {
      setGap(data.reconciliation_gap);
      setStatus(data.reconciliation_gap === 0 ? 'HEALTHY' : 'CRITICAL');
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'LOADING') return null;

  return (
    <div className={`p-4 rounded-xl border-l-4 shadow-sm mb-6 flex items-center justify-between ${
      status === 'HEALTHY' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
    }`}>
      <div className="flex items-center gap-3">
        {status === 'HEALTHY' ? <ShieldCheck className="text-green-600" /> : <AlertOctagon className="text-red-600" />}
        <div>
          <h4 className="font-bold text-gray-900">Ledger Integrity</h4>
          <p className="text-xs text-gray-600">
            {status === 'HEALTHY' ? 'Assets match Liabilities' : `CRITICAL: KES ${gap} Gap`}
          </p>
        </div>
      </div>
      <button onClick={checkHealth}><RefreshCw className="w-4 h-4 text-gray-500" /></button>
    </div>
  );
}