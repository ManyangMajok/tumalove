import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { 
  Check, 
  X, 
  ShieldCheck,
  Loader2, 
  Instagram, 
  Twitter, 
  Youtube, 
  Globe,
  Search,
  Users,
  Smartphone,
  TrendingUp,
  BarChart3,
  Bell,
  CreditCard,
  LogOut,
  Menu,
  X as XIcon,
  Eye,
  EyeOff,
  RefreshCw,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react'

export default function Admin() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({ 
    pending: 0, 
    verified: 0, 
    total: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeUsers: 0
  })
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'verification' | 'analytics' | 'payments' | 'notifications'>('overview')
  const [activeVerificationTab, setActiveVerificationTab] = useState<'pending' | 'verified' | 'unverified'>('pending')
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Analytics filters
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [revenueVisible, setRevenueVisible] = useState(true)

  useEffect(() => {
    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isAdmin) fetchAllData()
  }, [isAdmin, activeVerificationTab, activeMainTab, timeRange])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserEmail(user?.email || null)

    if (!user) {
        setInitialLoading(false)
        return
    }

    const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('id', user.id)
        .single()
    
    if (data && !error) {
        setIsAdmin(true)
    } else {
        setIsAdmin(false)
    }
    setInitialLoading(false)
  }

  const fetchAllData = async () => {
    setDataLoading(true)
    
    try {
      // Only fetch verification data if we're on verification tab
      if (activeMainTab === 'verification') {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('verification_status', activeVerificationTab)
          .order('updated_at', { ascending: false })
        
        setUsers(userData || [])
      }

      // Fetch stats (optimized)
      const [{ count: pendingCount }, { count: verifiedCount }, { count: totalCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ])

      // Fetch revenue data (simulated for now)
      const today = new Date().toISOString().split('T')[0]
      const { data: todayTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', today)

      const todayRevenue = todayTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
      
      // Calculate total revenue (simulated)
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('amount')
      
      const totalRevenue = allTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

      setStats({
        pending: pendingCount || 0,
        verified: verifiedCount || 0,
        total: totalCount || 0,
        totalRevenue,
        todayRevenue,
        // Fix: Use nullish coalescing (?? 0) to ensure totalCount is a number before math
        activeUsers: Math.floor((totalCount ?? 0) * 0.6) 
      })

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleAction = async (id: string, newStatus: 'verified' | 'unverified') => {
    setUsers(users.filter(u => u.id !== id))
    setStats(prev => ({
        ...prev,
        pending: activeVerificationTab === 'pending' ? prev.pending - 1 : prev.pending,
        verified: newStatus === 'verified' ? prev.verified + 1 : prev.verified
    }))

    const { error } = await supabase
        .from('profiles')
        .update({ verification_status: newStatus })
        .eq('id', id)
    
    if (error) {
        alert("Action failed!")
        fetchAllData() // Revert
    }
  }

  const getSocialIcon = (platform: string) => {
    const p = platform?.toLowerCase() || ''
    if (p.includes('instagram')) return <Instagram className="w-3 h-3" />
    if (p.includes('twitter')) return <Twitter className="w-3 h-3" />
    if (p.includes('youtube')) return <Youtube className="w-3 h-3" />
    return <Globe className="w-3 h-3" />
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Loading overlay (green theme)
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-shikilia-green animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Checking admin privileges...</p>
        </div>
      </div>
    )
  }

  // ACCESS DENIED SCREEN - Green theme
  if (!isAdmin) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-green-50 to-emerald-100 font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-green-100/50 border border-green-100 max-w-md w-full">
                <ShieldCheck className="w-16 h-16 text-green-600 mb-4 mx-auto" />
                <h1 className="text-2xl font-black text-gray-900 mb-2">Admin Access Required</h1>
                <p className="text-gray-500 mb-6">
                    Logged in as <strong className="text-green-600">{currentUserEmail}</strong>
                </p>
                <div className="bg-green-50 p-4 rounded-xl text-xs text-green-800 text-left font-mono mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Admin privileges required</span>
                    </div>
                    <p className="text-green-700">Contact system administrator to gain access to the admin panel.</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-green-500 to-shikilia-green text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout & Return Home
                </button>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 font-sans relative">
      
      {/* Data Loading Overlay (Green Theme) */}
      {dataLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-shikilia-green animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Loading data...</p>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-green-100 sticky top-0 z-40 lg:hidden">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-shikilia-green rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">Admin Panel</h1>
              <p className="text-xs text-gray-500">@{currentUserEmail?.split('@')[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white border-t border-green-100 shadow-lg p-4 animate-in slide-in-from-top-2">
            <div className="space-y-1 mb-4">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'verification', label: 'Verification', icon: ShieldCheck },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'notifications', label: 'Notifications', icon: Bell }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveMainTab(tab.id as any)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeMainTab === tab.id 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-green-100 lg:bg-white/80 lg:backdrop-blur-md">
        <div className="p-6 border-b border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-shikilia-green rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-lg">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">@{currentUserEmail?.split('@')[0]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'verification', label: 'Verification', icon: ShieldCheck },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeMainTab === tab.id 
                  ? 'bg-gradient-to-r from-green-500 to-shikilia-green text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`lg:pl-64 ${mobileMenuOpen ? 'hidden lg:block' : ''}`}>
        <div className="p-4 sm:p-6">
          
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {activeMainTab === 'overview' && 'Dashboard Overview'}
                {activeMainTab === 'verification' && 'Creator Verification'}
                {activeMainTab === 'analytics' && 'Analytics & Insights'}
                {activeMainTab === 'payments' && 'Payment Management'}
                {activeMainTab === 'notifications' && 'Notification Center'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeMainTab === 'overview' && 'Real-time platform metrics and insights'}
                {activeMainTab === 'verification' && 'Review and manage creator verification requests'}
                {activeMainTab === 'analytics' && 'Detailed analytics and performance metrics'}
                {activeMainTab === 'payments' && 'Transaction history and revenue management'}
                {activeMainTab === 'notifications' && 'Send announcements and manage alerts'}
              </p>
            </div>
            
            <button 
              onClick={fetchAllData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-xl text-green-700 hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>

          {/* Stats Overview - Always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Revenue</p>
                  <div className="text-2xl font-bold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% from last week
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Active Creators</p>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {stats.verified} verified • {stats.pending} pending
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Today's Revenue</p>
                  <div className="text-2xl font-bold text-gray-900">KES {stats.todayRevenue.toLocaleString()}</div>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                Today's transactions
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Users</p>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Platform growth
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          {activeMainTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-green-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveMainTab('verification')}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-left hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-bold text-gray-900">Review Verifications</span>
                    </div>
                    <p className="text-sm text-gray-500">{stats.pending} pending requests</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveMainTab('analytics')}
                    className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl text-left hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-bold text-gray-900">View Analytics</span>
                    </div>
                    <p className="text-sm text-gray-500">Platform performance insights</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'New creator signup', time: '2 min ago', type: 'signup' },
                    { action: 'Payment processed', time: '15 min ago', type: 'payment' },
                    { action: 'Creator verified', time: '1 hour ago', type: 'verification' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'signup' ? 'bg-green-500' :
                        item.type === 'payment' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMainTab === 'verification' && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
              {/* Verification Header */}
              <div className="p-6 border-b border-green-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Creator Verification</h3>
                    <p className="text-gray-500 text-sm">Review and verify creator accounts</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Tabs */}
                <div className="flex gap-1 mt-4 overflow-x-auto">
                  {[
                    { id: 'pending', label: 'Pending Review', count: stats.pending },
                    { id: 'verified', label: 'Verified', count: stats.verified },
                    { id: 'unverified', label: 'Rejected', count: 0 }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveVerificationTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        activeVerificationTab === tab.id
                          ? 'bg-gradient-to-r from-green-500 to-shikilia-green text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{tab.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        activeVerificationTab === tab.id
                          ? 'bg-white/20'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification List */}
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No {activeVerificationTab} creators found.</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">Try a different search term</p>
                    )}
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 truncate">@{user.username}</h4>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                {user.verification_status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.full_name}</p>
                            {user.mpesa_number && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                {user.mpesa_number}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex flex-wrap gap-2">
                          {user.social_links?.slice(0, 2).map((link: any, i: number) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-green-400 hover:text-green-600 transition-all"
                            >
                              {getSocialIcon(link.platform || link.url)}
                              Verify
                            </a>
                          ))}
                          {user.social_links?.length > 2 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{user.social_links.length - 2} more
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {activeVerificationTab === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(user.id, 'verified')}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                <Check className="w-4 h-4 inline mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(user.id, 'unverified')}
                                className="px-4 py-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-sm font-medium transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {activeVerificationTab === 'verified' && (
                            <button
                              onClick={() => handleAction(user.id, 'unverified')}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-100 rounded-lg text-sm font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                          
                          {activeVerificationTab === 'unverified' && (
                            <button
                              onClick={() => handleAction(user.id, 'verified')}
                              className="px-4 py-2 text-green-600 hover:bg-green-50 border border-green-100 rounded-lg text-sm font-medium transition-colors"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeMainTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Analytics Dashboard</h3>
                  <p className="text-gray-500 text-sm">Platform performance insights</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  
                  <button
                    onClick={() => setRevenueVisible(!revenueVisible)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    {revenueVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {revenueVisible ? 'Hide Revenue' : 'Show Revenue'}
                  </button>
                </div>
              </div>

              {/* Analytics Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <h4 className="font-bold text-gray-900 mb-3">User Growth</h4>
                  <div className="h-48 flex items-end gap-2">
                    {[40, 60, 80, 100, 120, 140, 160].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-green-400 to-green-500 rounded-t-lg"
                          style={{ height: `${height}px` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">Day {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-3">Revenue Trends</h4>
                  <div className="h-48 flex items-end gap-2">
                    {[30, 50, 70, 90, 110, 130, 150].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-lg"
                          style={{ height: `${height}px` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">Day {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Avg. Transaction', value: 'KES 450', change: '+5.2%', positive: true },
                  { label: 'Conversion Rate', value: '4.8%', change: '+0.3%', positive: true },
                  { label: 'User Retention', value: '68%', change: '+2.1%', positive: true },
                  { label: 'Support Tickets', value: '12', change: '-3', positive: false }
                ].map((metric, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                    <div className="flex items-end justify-between">
                      <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                      <span className={`text-xs font-medium ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMainTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Payment Management</h3>
                <p className="text-gray-500 text-sm">View and manage all transactions</p>
              </div>

              {/* Payment Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-gray-500 mb-1">Total Processed</p>
                  <div className="text-2xl font-bold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-gray-500 mb-1">Today's Volume</p>
                  <div className="text-2xl font-bold text-gray-900">KES {stats.todayRevenue.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-500 mb-1">Avg. Transaction</p>
                  <div className="text-2xl font-bold text-gray-900">KES 450</div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900">Recent Transactions</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Payment from Creator {i}</p>
                            <p className="text-sm text-gray-500">2 hours ago • M-Pesa</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">KES {Math.floor(Math.random() * 1000) + 100}</p>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMainTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Notification Center</h3>
                <p className="text-gray-500 text-sm">Send announcements and manage alerts</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Announcement */}
                <div className="lg:col-span-2">
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <h4 className="font-bold text-gray-900 mb-3">Send Announcement</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                          type="text" 
                          placeholder="Announcement title..." 
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea 
                          rows={4}
                          placeholder="Type your announcement here..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none"
                        ></textarea>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-gradient-to-r from-green-500 to-shikilia-green text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-colors">
                          Send to All Users
                        </button>
                        <button className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                          Save Draft
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Announcements */}
                <div>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">Recent Announcements</h4>
                    <div className="space-y-3">
                      {[
                        { title: 'Platform Update', time: 'Yesterday', status: 'sent' },
                        { title: 'New Feature Alert', time: '3 days ago', status: 'sent' },
                        { title: 'Maintenance Notice', time: '1 week ago', status: 'draft' }
                      ].map((announcement, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-gray-900">{announcement.title}</h5>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              announcement.status === 'sent' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {announcement.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{announcement.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 p-2 shadow-lg">
          <div className="flex justify-around">
            {[
              { id: 'overview', icon: BarChart3 },
              { id: 'verification', icon: ShieldCheck },
              { id: 'analytics', icon: TrendingUp },
              { id: 'payments', icon: CreditCard },
              { id: 'notifications', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  activeMainTab === tab.id
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-500'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">
                  {tab.id === 'overview' ? 'Home' : 
                   tab.id === 'verification' ? 'Verify' :
                   tab.id === 'analytics' ? 'Stats' :
                   tab.id === 'payments' ? 'Pay' : 'Alerts'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Bottom Safe Area */}
        <div className="h-16 lg:hidden"></div>
      </main>
    </div>
  )
}