import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import { ADMIN_ROOT } from '../config'
import { useAdminAuth } from '../hooks/useAdminAuth'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const queryClient = useQueryClient()

  // ─── AUTH CHECK (LAYOUT AS GATEKEEPER) ───
  const { loading, isAdmin } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  // ───────────────────────────────────────

  const navItems = [
    { path: `${ADMIN_ROOT}/dashboard`, label: 'Overview', icon: LayoutGrid },
    { path: `${ADMIN_ROOT}/payouts`, label: 'Payouts', icon: CreditCard },
    { path: `${ADMIN_ROOT}/verifications`, label: 'Verifications', icon: ShieldCheck },
    { path: `${ADMIN_ROOT}/security`, label: 'Security', icon: AlertTriangle },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate(`${ADMIN_ROOT}/login`)
  }

  const prefetchRoute = (path: string) => {
    if (path.includes('payouts')) {
      queryClient.prefetchQuery({
        queryKey: ['withdrawals', 'queue'],
        queryFn: async () => {
          const { data } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('status', 'PENDING')
          return data
        },
      })
    }

    if (path.includes('verifications')) {
      queryClient.prefetchQuery({
        queryKey: ['verifications', 'pending'],
        queryFn: async () => {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('verification_status', 'pending')
          return data
        },
      })
    }
  }

  const NavContent = () => (
    <>
      {/* Logo / Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 tracking-tight leading-none">
            Tumalove
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Admin Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/')

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              onMouseEnter={() => prefetchRoute(item.path)}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive
                  ? 'bg-green-50 text-green-700 border border-green-100 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={18}
                  className={
                    isActive
                      ? 'text-green-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }
                />
                {item.label}
              </div>
              {isActive && (
                <ChevronRight size={14} className="text-green-600 opacity-50" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-rose-600 px-4 py-3 w-full hover:bg-rose-50 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between
        bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={16} />
          </div>
          <span className="font-bold text-slate-800">Tumalove Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-slate-100 rounded-lg"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <NavContent />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col pt-16 lg:pt-0">
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
