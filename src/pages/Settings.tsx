import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  Loader2, Camera, Save, ArrowLeft, Building, Smartphone, AlertTriangle 
} from 'lucide-react'

export default function Settings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Profile Data
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  // Payment Data
  const [mpesaNumber, setMpesaNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    setUser(user)

    // Load Public Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile) {
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url)
        setMpesaNumber(profile.mpesa_number || '')
    }

    // Load Private Bank Details
    const { data: bank } = await supabase.from('private_details').select('*').eq('id', user.id).single()
    if (bank) {
        setBankName(bank.bank_name || '')
        setAccountNumber(bank.bank_account_number || '')
        setAccountName(bank.bank_account_name || '')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setLoading(true)
    const file = e.target.files[0]
    const filePath = `${user.id}/${Math.random()}.png`
    
    await supabase.storage.from('avatars').upload(filePath, file)
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    setAvatarUrl(data.publicUrl)
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Update Public Profile
    await supabase.from('profiles').update({
        bio,
        avatar_url: avatarUrl,
        mpesa_number: mpesaNumber
    }).eq('id', user.id)

    // 2. Update Private Bank Details (Upsert handles Insert or Update)
    await supabase.from('private_details').upsert({
        id: user.id,
        bank_name: bankName,
        bank_account_number: accountNumber,
        bank_account_name: accountName
    })

    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 font-sans">
        <div className="max-w-2xl mx-auto">
            
            {/* Nav Back */}
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>

            <h1 className="text-3xl font-black text-gray-900 mb-8">Page Settings</h1>

            <form onSubmit={handleSave} className="space-y-8">
                
                {/* --- CARD 1: PUBLIC PROFILE --- */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-gray-400" /> Public Profile
                    </h2>

                    <div className="flex items-start gap-6 mb-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden relative group">
                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl">🦁</div>}
                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bio / Pitch</label>
                            <textarea 
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-shikilia-brand/50 outline-none resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* --- CARD 2: PAYMENT METHODS --- */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <WalletIcon className="w-5 h-5 text-green-600" /> Withdrawal Methods
                    </h2>

                    {/* Method A: M-Pesa */}
                    <div className="mb-8 p-5 bg-green-50/50 rounded-2xl border border-green-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Smartphone className="w-5 h-5 text-green-700" />
                            <span className="font-bold text-green-900">M-Pesa (Instant)</span>
                        </div>
                        <input 
                            type="text" 
                            value={mpesaNumber}
                            onChange={e => setMpesaNumber(e.target.value)}
                            placeholder="0712 345 678"
                            className="w-full p-3 border border-gray-200 rounded-xl font-mono"
                        />
                    </div>

                    {/* Method B: Bank */}
                    <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Building className="w-5 h-5 text-gray-700" />
                            <span className="font-bold text-gray-900">Bank Transfer (1-3 Days)</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Bank Name</label>
                                <input 
                                    type="text" 
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    placeholder="e.g. KCB, Equity"
                                    className="w-full p-3 border border-gray-200 rounded-xl mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Account Number</label>
                                <input 
                                    type="text" 
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value)}
                                    placeholder="1234..."
                                    className="w-full p-3 border border-gray-200 rounded-xl mt-1"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Account Name</label>
                                <input 
                                    type="text" 
                                    value={accountName}
                                    onChange={e => setAccountName(e.target.value)}
                                    placeholder="Matches your ID"
                                    className="w-full p-3 border border-gray-200 rounded-xl mt-1"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> 
                            Bank withdrawals are processed manually upon request.
                        </p>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <> <Save className="w-5 h-5" /> Save Changes </>}
                </button>

            </form>
        </div>
    </div>
  )
}

function WalletIcon({className}: {className?: string}) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
    )
}