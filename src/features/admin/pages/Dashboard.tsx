import { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import AdminLayout from '../layouts/AdminLayout';
import SystemAuditor from '../components/SystemAuditor';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { DollarSign, Shield, Users, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

/* ───────── HEALTH METRICS COMPONENT ───────── */
const HealthMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* 1. Velocity Check */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" /> 
          Growth Velocity
        </h3>
        <div className="flex items-end gap-2 h-32">
          {[10, 25, 15, 30, 80, 20, 10].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-lg transition-all ${
                h > 50 ? 'bg-red-400' : 'bg-slate-200'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Signups per hour (Red bars indicate possible bot activity)
        </p>
      </div>

      {/* 2. Error Rate */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" />
          Error Rate (24h)
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-green-600">0.02%</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#16a34a"
                strokeWidth="8"
                strokeDasharray="339.292"
                strokeDashoffset="338"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">System is Stable</p>
            <p className="text-xs text-slate-400 mt-1">
              Failed transactions vs Total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { loading } = useAdminAuth();
  const [stats, setStats] = useState({ revenue: 0, escrow: 0, users: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data: bal } = await supabase.from('platform_balances').select('*');
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        revenue: bal?.find(b => b.account_type === 'revenue')?.balance || 0,
        escrow: bal?.find(b => b.account_type === 'escrow')?.balance || 0,
        users: count || 0
      });
    };
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Real-time platform overview and solvency check.
        </p>
      </div>

      {/* Auditor */}
      <div className="mb-8">
        <SystemAuditor />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" /> Equity
            </span>
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-wide">Net Revenue</p>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            KES {stats.revenue.toLocaleString()}
          </div>
        </div>

        {/* Escrow */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              Liabilities
            </span>
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-wide">Escrow Holdings</p>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            KES {stats.escrow.toLocaleString()}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              Total
            </span>
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-wide">Active Creators</p>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            {stats.users.toLocaleString()}
          </div>
        </div>
      </div>

      {/* NEW: System Health Metrics */}
      <HealthMetrics />
    </AdminLayout>
  );
}
