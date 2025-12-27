import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  LogOut, 
  Share2, 
  Wallet, 
  TrendingUp, 
  Users, 
  Copy, 
  Check, 
  MessageCircle,
  Coffee,
  Menu,
  X,
  Trophy,
  Settings as SettingsIcon,
  Loader2,
  Shield,
  Clock
} from 'lucide-react'

// Data Interfaces
interface Transaction {
  id: string
  amount: number
  supporter_name: string
  supporter_message: string
  created_at: string
}

interface Profile {
  username: string
  full_name: string
  avatar_url: string
  goal_current: number
  bio: string
  mpesa_number: string
  verification_status: 'unverified' | 'pending' | 'verified' 
}

interface TopSupporter {
    name: string;
    totalAmount: number;
    count: number;
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [copied, setCopied] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // --- IDENTITY FIREWALL: THE BOUNCER LOGIC ---
      // If profile is incomplete, KICK them to setup
      if (!profileData || !profileData.avatar_url || !profileData.bio || !profileData.mpesa_number) {
          navigate('/setup', { replace: true })
          return
      }
      // -------------------------

      setProfile(profileData)

      // Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
      if (txData) setTransactions(txData)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    navigate('/login') 
  }

  const copyLink = () => { 
    const link = `shikilia.com/${profile?.username}`; 
    navigator.clipboard.writeText(link); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000) 
  }
  
  // Calculate Top Supporters
  const topSupporters = useMemo(() => {
    const map: Record<string, TopSupporter> = {}
    transactions.forEach(tx => {
        const name = tx.supporter_name || "Anonymous"
        if (!map[name]) map[name] = { name, totalAmount: 0, count: 0 }
        map[name].totalAmount += tx.amount
        map[name].count += 1
    })
    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 3) 
  }, [transactions])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-shikilia-green animate-spin" /></div>
  }

  // STATUS HELPER - only keep what's actually used
  const isVerified = profile?.verification_status === 'verified'

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-gray-900 pb-20">
      
      {/* --- STICKY HEADER --- */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* Logo / Identity */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl overflow-hidden border border-gray-200">
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover"/> : "🦁"}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-bold text-sm text-gray-900 leading-tight">@{profile?.username}</h1>
                      {/* STATUS BADGES */}
                      {isVerified ? (
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </div>
                </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
                 <button onClick={() => navigate('/settings')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4" /> Edit Profile
                 </button>
                 <div className="h-4 w-px bg-gray-200"></div>
                 <button onClick={copyLink} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                    Share Page
                 </button>
                 <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    <LogOut className="w-4 h-4" /> Log out
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg p-4 flex flex-col gap-2 animate-in slide-in-from-top-2">
                <button onClick={() => navigate('/settings')} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 text-left">
                    <SettingsIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Edit Profile</span>
                </button>
                <button onClick={copyLink} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 text-left">
                    <Share2 className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Share Page</span>
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-left text-red-600">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">

        {/* --- LEFT COLUMN (2/3 width) --- */}
        <div className="md:col-span-2 space-y-8">
            
            {/* Balance Card */}
            <div className="bg-shikilia-green text-white rounded-3xl p-8 shadow-xl shadow-green-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <div className="text-green-100 text-sm font-medium mb-1 flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Available Balance
                    </div>
                    <div className="text-4xl font-bold mb-8">
                        KES {profile?.goal_current?.toLocaleString() || '0.00'}
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white text-shikilia-green py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors shadow-lg">
                            Withdraw
                        </button>
                        <button onClick={copyLink} className="flex-1 bg-green-700/50 text-white border border-green-600 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            {copied ? "Copied!" : "Share Link"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 mb-3">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Supporters</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-3">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{new Set(transactions.map(t => t.supporter_name)).size}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Unique Fans</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Recent Support
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{transactions.length}</span>
                </h2>

                {transactions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Coffee className="w-8 h-8" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No support yet</h3>
                        <p className="text-gray-500 text-sm mb-6">Share your link to start receiving M-Pesa payments.</p>
                        <button onClick={copyLink} className="inline-flex items-center gap-2 text-shikilia-green font-bold text-sm hover:underline">
                            <Copy className="w-4 h-4" /> Copy your link
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:border-shikilia-brand/30 transition-colors">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center text-lg shrink-0">
                                    ☕
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 truncate">
                                            {tx.supporter_name || "Anonymous"}
                                        </h3>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                            + KES {tx.amount}
                                        </span>
                                    </div>
                                    {tx.supporter_message && (
                                        <div className="bg-gray-50 p-2 rounded-lg text-sm text-gray-600 italic mb-2 relative">
                                            <MessageCircle className="w-3 h-3 absolute -top-1 -left-1 text-gray-400 fill-white" />
                                            "{tx.supporter_message}"
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400">
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* --- RIGHT COLUMN (1/3 width) - LEADERBOARD --- */}
        <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                        <Trophy className="w-4 h-4 fill-current" />
                    </div>
                    <h2 className="font-bold text-gray-900">Top Supporters</h2>
                </div>

                {topSupporters.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Leaderboard needs more data.</p>
                ) : (
                    <div className="space-y-4">
                        {topSupporters.map((supporter, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 
                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                      index === 1 ? 'bg-gray-100 text-gray-600' : 
                                      'bg-orange-50 text-orange-800'}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-900 text-sm truncate">{supporter.name}</div>
                                    <div className="text-xs text-gray-400">{supporter.count} payments</div>
                                </div>
                                <div className="font-bold text-sm text-shikilia-green">
                                    KES {supporter.totalAmount}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* TRUST & SAFETY STATUS CARD */}
            {isVerified ? (
                // GREEN STATE (VERIFIED)
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <h3 className="text-blue-900 font-bold text-sm">Account Verified</h3>
                    </div>
                    <p className="text-blue-800/80 text-xs leading-relaxed mb-3">
                        Your identity is confirmed. You have full access to withdrawals and the "Verified" badge is visible to all fans.
                    </p>
                    <ul className="space-y-2 text-xs text-blue-800/80">
                        <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-blue-600 mt-0.5" />
                            <span>Identity confirmed</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-3 h-3 text-blue-600 mt-0.5" />
                            <span>Withdrawals enabled</span>
                        </li>
                    </ul>
                </div>
            ) : (
                // YELLOW STATE (PENDING)
                <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-yellow-900 font-bold text-sm">Review in Progress</h3>
                    </div>
                    <p className="text-yellow-800/80 text-xs leading-relaxed mb-3">
                        Your profile is currently being reviewed by our team. This process helps us keep Shikilia safe for everyone.
                    </p>
                    <div className="bg-white/50 p-3 rounded-lg border border-yellow-100/50">
                        <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-wide mb-1">What happens next?</p>
                        <p className="text-xs text-yellow-800/80">
                            We will check your social links manually. You will receive an email once your account is approved (approx 24hrs).
                        </p>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  )
}