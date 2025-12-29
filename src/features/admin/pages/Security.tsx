import { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { useRealtimeQuery } from '../../../hooks/useRealtimeQuery'; // The Speed Engine
import { 
  ShieldAlert, 
  Search, 
  Copy, 
  Check, 
  Activity, 
  Lock, 
  AlertTriangle,
  Terminal
} from 'lucide-react';
import type { SecurityAlert } from '../types';

export default function Security() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 🔥 1. SPEED ENGINE: Instant Load + Auto Refresh
  const { data: alerts = [], isLoading } = useRealtimeQuery(
    ['security_logs'], 
    'security_audit_log', 
    async () => {
      const { data } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data as SecurityAlert[];
    }
  );

  // 🔍 2. CLIENT-SIDE SEARCH
  const filteredAlerts = alerts.filter(alert => 
    JSON.stringify(alert).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📋 COPY UTILITY
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 🎨 ICON MAPPER
  const getIcon = (type: string) => {
    if (type.includes('login') || type.includes('auth')) return <Lock size={16} />;
    if (type.includes('payment')) return <Activity size={16} />;
    if (type.includes('error')) return <AlertTriangle size={16} />;
    return <Terminal size={16} />;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Audit Log</h1>
          <p className="text-slate-500 text-sm">Monitor system integrity and real-time events.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72 group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search logs (e.g. 'payment', 'error')..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {isLoading ? (
          // 🦴 SKELETON LOADER
          <div className="divide-y divide-slate-50 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-5 flex gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-4 bg-slate-100 rounded"></div>
                  <div className="w-full h-12 bg-slate-50 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          // 📭 EMPTY STATE
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">System Secure</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">
              {searchTerm ? 'No logs match your search.' : 'No security alerts recorded in the log.'}
            </p>
          </div>
        ) : (
          // 📜 LOG LIST
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-5 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-start gap-4">
                  
                  {/* Status Indicator */}
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    alert.severity === 'critical' ? 'bg-rose-100 border-rose-200 text-rose-600' : 
                    alert.severity === 'high' ? 'bg-orange-100 border-orange-200 text-orange-600' : 
                    'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {getIcon(alert.event_type || '')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900 font-mono text-sm tracking-tight">
                        {alert.event_type}
                      </span>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        alert.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        alert.severity === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {alert.severity || 'INFO'}
                      </span>

                      <span className="text-xs text-slate-400 font-mono ml-auto">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* JSON Details Box */}
                    <div className="relative group/code">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 group-hover:border-slate-200 transition-colors overflow-hidden">
                        <code className="text-xs text-slate-600 font-mono break-all whitespace-pre-wrap block">
                          {typeof alert.details === 'object' 
                            ? JSON.stringify(alert.details, null, 2) 
                            : String(alert.details || '')}
                        </code>
                      </div>
                      
                      {/* Copy Button (Appears on Hover) */}
                      <button 
                        onClick={() => handleCopy(JSON.stringify(alert.details), alert.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded-md shadow-sm opacity-0 group-hover/code:opacity-100 transition-all hover:bg-slate-50 hover:text-emerald-600"
                        title="Copy Details"
                      >
                        {copiedId === alert.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}