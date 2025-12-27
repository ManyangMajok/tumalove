import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  Shield,
  AlertTriangle,
  BarChart3,
  Users,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SecurityMetric {
  name: string
  value: number
  change: number
  icon: React.ReactNode // Fixed: Changed from JSX.Element to React.ReactNode
}

interface Alert {
  id: string
  event_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: any
  created_at: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<SecurityMetric[]>([])
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  // Removed unused totalTransactions state
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    // Set up refresh interval
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch basic metrics
      const [
        { count: transactionsCount },
        { data: alertsData },
        suspiciousResponse // Fixed: Capture full response to get count
      ] = await Promise.all([
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase
          .from('security_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('is_suspicious', true)
      ])

      // Calculate simple metrics
      const processedMetrics: SecurityMetric[] = [
        {
          name: 'Total Transactions',
          value: transactionsCount || 0,
          change: 0,
          icon: <Activity className="w-5 h-5" />
        },
        {
          name: 'Suspicious Activity',
          value: suspiciousResponse.count || 0, // Fixed: Access count correctly
          change: 0,
          icon: <AlertTriangle className="w-5 h-5" />
        },
        {
          name: 'Security Alerts',
          value: alertsData?.length || 0,
          change: 0,
          icon: <Shield className="w-5 h-5" />
        },
        {
          name: 'System Status',
          value: 100, // Mock health score
          change: 0,
          icon: <CheckCircle className="w-5 h-5" />
        }
      ]

      setMetrics(processedMetrics)
      setRecentAlerts(alertsData || [])
      // Removed setTotalTransactions(transactionsCount || 0)

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-shikilia-green animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-shikilia-green to-green-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Security Dashboard</h1>
                <p className="text-sm text-gray-600">Real-time monitoring & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-green-100 text-green-600`}>
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{metric.name}</p>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Recent Security Alerts ({recentAlerts.length})
            </h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            {recentAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p>No security alerts in the last 24 hours</p>
                <p className="text-sm mt-2">All systems operational</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentAlerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {alert.event_type?.replace(/_/g, ' ') || 'Unknown Event'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {alert.details?.error || alert.details?.message || 'No additional details'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-700">M-Pesa API</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-700">Database</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-gray-700">Edge Functions</span>
                </div>
                <span className="text-green-600 text-sm font-medium">Running</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">View Users</p>
                    <p className="text-sm text-gray-500">Manage user accounts</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-500">View detailed reports</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Suspicious Activity</p>
                    <p className="text-sm text-gray-500">Review flagged transactions</p>
                  </div>
                </div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Audit Logs</p>
                    <p className="text-sm text-gray-500">View full audit trail</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}