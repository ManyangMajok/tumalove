import { Link } from 'react-router-dom'
import { supabase } from '../../../supabaseClient'
import SystemAuditor from '../components/SystemAuditor'

import { useRealtimeQuery } from '../../../hooks/useRealtimeQuery'
import { ADMIN_ROOT } from '../config'
import {
  DollarSign,
  Shield,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'

/* ───────── HEALTH METRICS COMPONENT (UNCHANGED) ───────── */
const HealthMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Growth Velocity (Wrapped in Link) */}
      <Link
        to={`${ADMIN_ROOT}/analytics`}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-200 group cursor-pointer"
      >
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-blue-500" />
          Growth Velocity
        </h3>
        <div className="flex items-end gap-2 h-32">
          {[10, 25, 15, 30, 80, 20, 10].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-lg ${h > 50 ? 'bg-red-400' : 'bg-slate-200'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Signups per hour (Red bars indicate possible bot activity)
        </p>
        <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
          View Growth Report <TrendingUp size={12} />
        </p>
        <div className="absolute top-4 right-4">
          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
        </div>
      </Link>

      {/* Error Rate */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" />
          Error Rate (24h)
        </h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-green-600">0.02%</span>
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
  )
}

/* ───────── DASHBOARD PAGE ───────── */

type AdminStats = {
  revenue: number
  escrow: number
  users: number
  pendingVerifications: number
}

export default function Dashboard() {
  /* 🔥 SINGLE CACHED + REALTIME QUERY */
  const { data: stats, isLoading } = useRealtimeQuery(
    ['admin_stats'],
    'transactions',
    async () => {
      const [balancesRes, usersRes, pendingRes] = await Promise.all([
        supabase.from('platform_balances').select('*'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending')
      ])

      const balances = balancesRes.data ?? []

      return {
        revenue: balances.find(b => b.account_type === 'revenue')?.balance ?? 0,
        escrow: balances.find(b => b.account_type === 'escrow')?.balance ?? 0,
        users: usersRes.count ?? 0,
        pendingVerifications: pendingRes.count ?? 0
      }
    }
  )

  const safeStats: AdminStats = stats ?? {
    revenue: 0,
    escrow: 0,
    users: 0,
    pendingVerifications: 0
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time platform overview and solvency check.
        </p>
      </div>

      {/* Auditor */}
      <div className="mb-8">
        <SystemAuditor />
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Pending Verifications */}
        <Link
          to={`${ADMIN_ROOT}/verifications`}
          className={`relative p-6 rounded-2xl shadow-sm border transition-all hover:-translate-y-1 hover:shadow-md group ${
            safeStats.pendingVerifications > 0
              ? 'bg-orange-50 border-orange-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>

            {safeStats.pendingVerifications > 0 && (
              <span className="text-[10px] uppercase font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>

          <p className="text-sm uppercase tracking-wide text-slate-500">
            Pending Approvals
          </p>

          <div className="flex items-center justify-between mt-1">
            <div className="text-3xl font-bold text-slate-900">
              {isLoading ? '—' : safeStats.pendingVerifications}
            </div>
            {safeStats.pendingVerifications > 0 && (
              <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </Link>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" /> Equity
            </span>
          </div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Net Revenue
          </p>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            {isLoading ? '—' : `KES ${safeStats.revenue.toLocaleString()}`}
          </div>
        </div>

        {/* Escrow */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Escrow Holdings
          </p>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            {isLoading ? '—' : `KES ${safeStats.escrow.toLocaleString()}`}
          </div>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Active Creators
          </p>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            {isLoading ? '—' : safeStats.users.toLocaleString()}
          </div>
        </div>

      </div>

      {/* System Health */}
      <HealthMetrics />
    </>
  )
}
