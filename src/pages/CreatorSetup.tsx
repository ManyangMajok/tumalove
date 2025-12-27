import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  Camera, 
  Loader2, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  ShieldAlert, 
  LogOut 
} from 'lucide-react'

export default function CreatorSetup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form State
  const [bio, setBio] = useState('')
  const [mpesaNumber, setMpesaNumber] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>([
    { platform: 'instagram', url: '' }
  ])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) navigate('/login')
    setUser(user)
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
    } catch (error) {
      alert('Error uploading image!')
    } finally {
      setUploading(false)
    }
  }

  const addSocial = () => setSocials([...socials, { platform: 'twitter', url: '' }])
  const removeSocial = (index: number) => setSocials(socials.filter((_, i) => i !== index))
  const updateSocial = (index: number, field: string, value: string) => {
    const newSocials = [...socials]
    newSocials[index] = { ...newSocials[index], [field]: value }
    setSocials(newSocials)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // STRICT VALIDATION
    if (!avatarUrl) { 
        alert("A profile picture is required for verification.")
        return 
    }
    if (bio.length < 10) { 
        alert("Please write a bio longer than 10 characters.")
        return 
    }
    if (mpesaNumber.length < 9) { 
        alert("Please enter a valid M-Pesa number.")
        return 
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.from('profiles').update({
          bio,
          avatar_url: avatarUrl,
          mpesa_number: mpesaNumber,
          social_links: socials.filter(s => s.url.length > 0),
          // AUTOMATICALLY SET TO PENDING ON SUBMIT
          verification_status: 'pending' 
        }).eq('id', user.id)

      if (error) throw error
      
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      alert("Failed to save profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Verification Banner */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 mb-8 animate-in slide-in-from-top-4">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-800">
                <span className="font-bold">Identity Verification Required.</span><br/>
                Please complete your profile details below. Once submitted, your account will be placed under review for verification.
            </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 space-y-8 relative">
          
          <button type="button" onClick={handleLogout} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors" title="Log out">
            <LogOut className="w-5 h-5" />
          </button>

          {/* AVATAR */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4">Profile Picture <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors
                    ${avatarUrl ? 'border-green-500' : 'border-red-300 bg-red-50'}
                `}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-red-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={uploadAvatar} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Upload a real photo</p>
                <p className="text-xs text-gray-500 mt-1">Fans must be able to recognize you.</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BIO */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">About You <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              placeholder="I am a musician based in Nairobi..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-shikilia-brand outline-none transition-all resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{bio.length}/160</p>
          </div>

          <hr className="border-gray-100" />

          {/* SOCIALS */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Social Proof</label>
            <div className="text-xs text-gray-500 mb-3">Link at least one active social media account to verify your identity.</div>
            <div className="space-y-3">
              {socials.map((social, index) => (
                <div key={index} className="flex gap-2">
                  <select 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium outline-none"
                    value={social.platform}
                    onChange={(e) => updateSocial(index, 'platform', e.target.value)}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <div className="flex-1 relative">
                    <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-shikilia-brand"
                        value={social.url}
                        onChange={(e) => updateSocial(index, 'url', e.target.value)}
                    />
                  </div>
                  {socials.length > 1 && (
                    <button type="button" onClick={() => removeSocial(index)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addSocial} className="mt-3 text-sm font-bold text-shikilia-green flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add another link
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* PAYMENT */}
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-800">
                    <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">Payment Verification</h3>
            </div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">M-Pesa Number <span className="text-red-500">*</span></label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+254</span>
                <input
                    type="tel"
                    placeholder="712 345 678"
                    className="w-full pl-16 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-green-500 font-mono text-lg"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    required
                />
            </div>
            <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                This number will be kept private.
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading || !avatarUrl}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Submit for Verification <ArrowRight className="w-5 h-5" /></>}
          </button>

        </form>
      </div>
    </div>
  )
}