import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import AdminLayout from '../layouts/AdminLayout';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { ShieldAlert, Search, } from 'lucide-react';
import type { SecurityAlert } from '../types';

export default function Security() {
  const { loading } = useAdminAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setAlerts(data || []);
    };
    fetchLogs();
  }, []);

  if (loading) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Audit Log</h1>
          <p className="text-slate-500 text-sm">Monitor system integrity and suspicious events.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {alerts.length === 0 ? (
            <div className="p-16 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
              <h3 className="text-lg font-medium text-slate-900">System Secure</h3>
              <p className="text-slate-500">No security alerts recorded in the log.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-5 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    alert.severity === 'critical' ? 'bg-rose-500' : 
                    alert.severity === 'high' ? 'bg-orange-500' : 
                    'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 font-mono text-sm">
                        {alert.event_type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        alert.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        alert.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {alert.severity || 'INFO'}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 mt-2 border border-slate-100 group-hover:border-slate-200 transition-colors">
                      <code className="text-xs text-slate-600 font-mono break-all block">
                        {typeof alert.details === 'object' 
                          ? JSON.stringify(alert.details, null, 2) 
                          : String(alert.details || '')}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}