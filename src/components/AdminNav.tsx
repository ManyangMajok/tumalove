import { Link, useLocation } from 'react-router-dom'
import { 
  Shield, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Activity
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function AdminNav() {
  const location = useLocation()

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/transactions', label: 'Transactions', icon: <Activity className="w-5 h-5" /> },
    { path: '/admin/alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
  }

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-shikilia-green to-green-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Shikilia Admin</h2>
            <p className="text-xs text-gray-500">Security Portal</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Navigation
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-shikilia-green text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}