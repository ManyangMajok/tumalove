// CreatorProfile.tsx - COMPLETE FIXED VERSION
import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { formatPhoneNumber } from '../utils/formatters'
import { paymentSecurity } from '../utils/paymentSecurity'
import { 
  Loader2, 
  BadgeCheck, // <--- CHANGED: Using BadgeCheck for the Instagram look
  Globe, 
  Instagram, 
  Twitter, 
  Youtube,
  Music, 
  SearchX,
  ArrowRight,
  X,
  Coffee,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
  social_links: any[]
  verification_status: string
}

// Define RealtimePayload interface for TypeScript
interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Record<string, any>
  old: Record<string, any>
  schema: string
  table: string
  commit_timestamp: string
  errors: any[]
}

export default function CreatorProfile() {
  const { username } = useParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isImageOpen, setIsImageOpen] = useState(false)

  // Payment State
  const [amount, setAmount] = useState<number>(50) 
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [supporterName, setSupporterName] = useState('')
  const [paying, setPaying] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'waiting' | 'success' | 'failed'>('idle')
  
  // Track the checkout ID for this specific payment attempt
  const currentCheckoutId = useRef<string | null>(null)
  const paymentChannelRef = useRef<any>(null)
  const paymentTimeoutRef = useRef<number | null>(null)
  const paymentPollingRef = useRef<number | null>(null)

  const CUP_PRICE = 50

  useEffect(() => {
    fetchProfile()
    
    // Initialize secure session
    const initSession = async () => {
      try {
        await paymentSecurity.initSecureSession()
      } catch (error) {
        console.log('Session note:', error)
      }
    }
    
    initSession()
    
    // Cleanup on unmount
    return () => {
      cleanupPaymentListeners()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      if (!username) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single()

      if (error || !data || data.verification_status !== 'verified') {
        setNotFound(true)
        return
      }
      setProfile(data)
    } catch (error) {
      console.error(error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomAmount = (val: string) => {
      const newAmount = Number(val)
      setAmount(newAmount)
  }

  // Enhanced cleanup function
  const cleanupPaymentListeners = () => {
    console.log('🧹 Cleaning up payment listeners and timers')
    
    // Clear polling interval
    if (paymentPollingRef.current) {
      clearInterval(paymentPollingRef.current)
      paymentPollingRef.current = null
    }
    
    // Remove Supabase channel
    if (paymentChannelRef.current) {
      supabase.removeChannel(paymentChannelRef.current)
      paymentChannelRef.current = null
    }
    
    // Clear timeout
    if (paymentTimeoutRef.current) {
      clearTimeout(paymentTimeoutRef.current)
      paymentTimeoutRef.current = null
    }
    
    currentCheckoutId.current = null
  }

  // Debug function to check database status
  const checkDatabaseStatus = async (checkoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('status, checkout_request_id, amount, supporter_name, supporter_message')
        .eq('checkout_request_id', checkoutId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) {
        console.log('Debug: Database query error:', error)
        return null
      }
      
      console.log('Debug: Database status for checkout', checkoutId, ':', data)
      return data
    } catch (error) {
      console.error('Debug: Error checking database:', error)
      return null
    }
  }

  // Enhanced handlePayment function with all fixes
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!profile || !profile.id) {
      alert("Creator profile not found")
      return
    }
    
    const cleanedPhone = phone.replace(/\D/g, '')
    if (!phone || cleanedPhone.length < 9) {
      alert("Please enter a valid phone number (at least 9 digits)")
      return
    }
    
    if (amount < 10) {
      alert("Minimum amount is KES 10.")
      return
    }

    // Reset state
    setPaying(true)
    setPaymentStatus('waiting')
    cleanupPaymentListeners()

    try {
      const formattedPhone = formatPhoneNumber(phone)
      
      // Generate a unique reference for this payment
      const checkoutId = `tip_${profile.id}_${Date.now()}`
      
    /* console.log('🚀 Sending payment request:', {
        phone: formattedPhone,
        amount: amount,
        creatorId: profile.id,
        checkoutId
      })*/
      
      // 1. Initiate payment using securePaymentRequest
      const paymentData = await paymentSecurity.securePaymentRequest({
        phoneNumber: formattedPhone,
        amount: amount,
        accountReference: checkoutId,
        creatorId: profile.id,
        message: message || '',
        supporterName: supporterName || 'Anonymous',
        // Include metadata for debugging
        metadata: {
          source: 'creator_profile',
          timestamp: new Date().toISOString()
        }
      })

      console.log('✅ Payment API response:', paymentData)

      if (!paymentData?.checkout_request_id) {
        throw new Error('No checkout ID received from payment gateway')
      }

      const checkoutRequestId = paymentData.checkout_request_id
      currentCheckoutId.current = checkoutRequestId
      
      console.log('🎯 Setting up monitoring for checkout:', checkoutRequestId)
      
      // 2. Set up realtime listener for transaction updates
      const channel = supabase
        .channel(`payment-${checkoutRequestId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to ALL events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'transactions',
            filter: `checkout_request_id=eq.${checkoutRequestId}`
          },
          (payload: RealtimePayload) => {
            /*console.log('📡 Realtime event:', payload.eventType, 'Data:', payload.new)*/
            
            const transaction = payload.new
            if (!transaction || transaction.checkout_request_id !== currentCheckoutId.current) return
            
            switch (transaction.status) {
              case 'COMPLETED':
              case 'SUCCESS':
                console.log('🎉 Payment completed via realtime!')
                setPaymentStatus('success')
                setPaying(false)
                cleanupPaymentListeners()
                
                // Optional: Store success in local storage for persistence
                localStorage.setItem(`payment_${checkoutRequestId}`, 'success')
                break;
                
              case 'FAILED':
              case 'CANCELLED':
              case 'REJECTED':
                console.log('❌ Payment failed via realtime:', transaction.status)
                setPaymentStatus('failed')
                setPaying(false)
                cleanupPaymentListeners()
                break;
                
              default:
                // Still processing (PENDING, etc.)
                console.log('⏳ Payment status:', transaction.status)
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime listener active')
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('❌ Realtime channel error - falling back to polling')
          }
        })
      
      paymentChannelRef.current = channel
      
      // 3. Fallback polling (every 2 seconds) - in case realtime fails
      paymentPollingRef.current = window.setInterval(async () => {
        try {
          if (!currentCheckoutId.current) {
            cleanupPaymentListeners()
            return
          }

        /* console.log('🔍 Polling database for checkout:', currentCheckoutId.current)*/
          const transaction = await checkDatabaseStatus(currentCheckoutId.current)
          
          if (transaction) {
            console.log('📊 Found transaction:', transaction?.status)
            
            if (transaction?.status === 'COMPLETED' || transaction?.status === 'SUCCESS') {
              console.log('🎉 Payment completed via polling!')
              setPaymentStatus('success')
              setPaying(false)
              cleanupPaymentListeners()
            } 
            else if (['FAILED', 'CANCELLED', 'REJECTED'].includes(transaction?.status)) {
              console.log('❌ Payment failed via polling:', transaction?.status)
              setPaymentStatus('failed')
              setPaying(false)
              cleanupPaymentListeners()
            }
            // If status is PENDING, do nothing - continue waiting
          } else {
            console.log('📭 No transaction found yet for checkout:', currentCheckoutId.current)
            // Transaction hasn't been inserted yet - this is normal for first few seconds
          }
        } catch (error) {
          console.error('⚠️ Polling error:', error)
        }
      }, 2000) // Poll every 2 seconds
      
      // 4. Safety timeout (2.5 minutes for M-Pesa)
      paymentTimeoutRef.current = window.setTimeout(() => {
        if (paymentStatus === 'waiting') {
          console.warn('⏰ Payment timeout after 150 seconds')
          setPaymentStatus('idle')
          setPaying(false)
          cleanupPaymentListeners()
          alert('Payment is taking longer than expected. Please check your phone for an M-Pesa prompt.')
        }
      }, 150000) // 2.5 minutes
      
    } catch (error: any) {
      console.error('💥 Payment initiation failed:', error)
      
      // User-friendly error messages
      let errorMessage = 'Payment failed. Please try again.'
      
      if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
        errorMessage = 'Insufficient balance in your M-Pesa account.'
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Payment request timed out. Please try again.'
      } else if (error.message?.includes('Invalid Kenyan phone')) {
        errorMessage = 'Please enter a valid Kenyan phone number (07XXXXXXXX or +2547XXXXXXXX)'
      } else if (error.message?.includes('Maximum amount')) {
        errorMessage = 'Maximum payment amount is KES 150,000'
      } else if (error.message?.includes('Minimum amount')) {
        errorMessage = 'Minimum amount is KES 10'
      } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        errorMessage = 'Too many attempts. Please wait 5 minutes.'
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication error. Please refresh the page and try again.'
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many payment attempts. Please wait a few minutes.'
      }
      
      setPaymentStatus('failed')
      setPaying(false)
      cleanupPaymentListeners()
      alert(errorMessage)
    }
  }

  // Reset payment after success/failure
  useEffect(() => {
    if (paymentStatus === 'success' || paymentStatus === 'failed') {
      const timer = window.setTimeout(() => {
        setPaymentStatus('idle')
        setPaying(false)
        
        // Reset form after 5 seconds (keep phone for convenience)
        setTimeout(() => {
          setMessage('')
          setAmount(50)
          // Don't clear phone - it's convenient for repeated payments-i changed this ahaha
          setSupporterName('')
          setPhone('')
        }, 100)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [paymentStatus])

  const getSocialIcon = (platform: string) => {
      const p = platform.toLowerCase()
      if (p.includes('instagram')) return <Instagram className="w-5 h-5" />
      if (p.includes('twitter')) return <Twitter className="w-5 h-5" />
      if (p.includes('youtube')) return <Youtube className="w-5 h-5" />
      if (p.includes('tiktok')) return <Music className="w-5 h-5" />
      return <Globe className="w-5 h-5" />
  }

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-Tumalove-green animate-spin" /></div>

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 max-w-md w-full border border-gray-100">
            <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-black text-gray-900">User not found</h1>
            <p className="text-gray-500 mb-6 text-sm">This page is either private or doesn't exist.</p>
            <Link to="/" className="inline-block bg-black text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-gray-800 transition-colors">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFDFC] font-sans flex flex-col">
      
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <Link to="/" className="font-black text-xl sm:text-2xl tracking-tighter hover:opacity-80 transition-opacity">
                Tumalove<span className="text-Tumalove-green">.</span>
            </Link>
            <Link to="/signup" className="text-xs sm:text-sm font-bold bg-black text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-gray-800 transition-colors">
                Start my Page
            </Link>
          </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8 w-full">
        
        {/* Success Toast */}
        {paymentStatus === 'success' && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Payment successful! 🎉</p>
                <p className="text-sm text-green-600">Thank you for supporting {profile.full_name.split(' ')[0]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Failure Toast */}
        {paymentStatus === 'failed' && (
          <div className="mb-6 animate-in slide-in-from-top duration-300">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Payment failed</p>
                <p className="text-sm text-red-600">Please try again or use a different number</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: PROFILE CARD */}
            <div className="lg:col-span-5 w-full relative group mb-6 lg:mb-0">
                 <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] z-0">
                    <img 
                        src={profile.avatar_url} 
                        className="w-full h-full object-cover blur-[40px] sm:blur-[60px] opacity-70 sm:opacity-80 scale-150" 
                        alt="Background glow"
                    />
                </div>

                <div className="relative z-10 bg-white/50 sm:bg-white/40 backdrop-blur-xl sm:backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border border-white/50 shadow-lg sm:shadow-2xl shadow-gray-200/20 p-6 sm:p-8 text-center transition-all">
                    
                    <button 
                        onClick={() => setIsImageOpen(true)}
                        className="block w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto rounded-full p-1 bg-white/80 shadow-lg mb-4 sm:mb-5 relative hover:scale-105 transition-transform cursor-zoom-in group/avatar"
                    >
                        <img 
                            src={profile.avatar_url} 
                            className="w-full h-full rounded-full object-cover"
                            alt={profile.full_name}
                        />
                    </button>

                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight drop-shadow-sm line-clamp-1">{profile.full_name}</h1>
                        {/* CHANGED: Instagram Style Blue Badge */}
                        <BadgeCheck className="w-6 h-6 text-white fill-blue-500 flex-shrink-0" />
                    </div>
                    <p className="text-gray-700 font-bold text-xs sm:text-sm mb-4 sm:mb-6 tracking-wide">@{profile.username}</p>

                    <p className="text-gray-900 font-medium leading-relaxed text-sm sm:text-base mb-6 sm:mb-8 px-1 sm:px-2 drop-shadow-sm">
                        {profile.bio}
                    </p>

                    <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                        {profile.social_links?.map((link: any, i: number) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm border border-gray-100">
                                {getSocialIcon(link.platform)}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: PAYMENT CARD */}
            <div className="lg:col-span-7 w-full">
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-5 sm:p-6 md:p-8 relative">
                    <div className="relative z-10">
                        <h2 className="font-black text-xl sm:text-2xl text-gray-900 mb-2 flex items-center gap-2">
                            Support <span className="text-Tumalove-green truncate">{profile.full_name.split(' ')[0]}</span>
                            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-Tumalove-green flex-shrink-0" />
                        </h2>
                        <p className="text-gray-500 mb-6 sm:mb-8 text-xs sm:text-sm font-medium">
                            Send any amount directly via M-Pesa
                        </p>

                        <form onSubmit={handlePayment} className="space-y-4 sm:space-y-5">
                            
                            {/* Amount Selector */}
                            <div className="bg-green-50/40 p-4 sm:p-5 rounded-2xl border border-green-100/50">
                                <div className="mb-3 sm:mb-4">
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Quick Amounts:</p>
                                    
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        {[50, 100, 200, 500, 1000, 2000].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() => setAmount(amt)}
                                                // CHANGED: Fixed Active State to use Solid Green (bg-green-600) for visibility
                                                className={`h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center
                                                    ${amount === amt 
                                                        ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200' 
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}
                                                `}
                                            >
                                                KES {amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Or enter custom amount:</p>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="10"
                                            step="10"
                                            max="150000"
                                            className="w-full pl-4 pr-12 py-3 sm:py-4 rounded-xl border border-green-100 focus:border-Tumalove-green focus:outline-none font-bold text-gray-900 bg-white text-sm sm:text-base"
                                            value={amount || ''}
                                            onChange={(e) => handleCustomAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            disabled={paying}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <span className="text-gray-400 text-xs font-bold tracking-wider">KES</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Maximum amount: KES 150,000</p>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        M-Pesa Number (07XXXXXXXX or +2547XXXXXXXX)
                                    </label>
                                    <input 
                                        id="phone"
                                        type="tel" 
                                        placeholder="0712345678"
                                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-black focus:outline-none transition-all font-medium text-sm sm:text-base"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        disabled={paying}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <label htmlFor="supporterName" className="block text-xs sm:text-sm font-medium text-gray-700">
                                            Your Name (Optional)
                                        </label>
                                    </div>
                                    <input 
                                        id="supporterName"
                                        type="text" 
                                        placeholder="How you want to be shown"
                                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-black focus:outline-none transition-all font-medium text-sm sm:text-base"
                                        value={supporterName}
                                        onChange={(e) => setSupporterName(e.target.value)}
                                        disabled={paying}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Leave blank to show as "Anonymous"</p>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Optional Message
                                    </label>
                                    <textarea 
                                        id="message"
                                        rows={2}
                                        placeholder="Say something nice..."
                                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-black focus:outline-none transition-all resize-none text-sm sm:text-base font-medium"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={paying}
                                    />
                                </div>
                            </div>

                            {/* Total Display */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                                        <p className="text-lg sm:text-xl font-bold text-gray-900">KES {amount?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                        <span className="text-sm font-medium text-gray-600">
                                            {amount >= CUP_PRICE ? `${Math.floor(amount / CUP_PRICE)} cup${Math.floor(amount / CUP_PRICE) > 1 ? 's' : ''}` : 'Support'}
                                        </span>
                                    </div>
                                </div>
                                {supporterName && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">From: <span className="font-medium text-gray-700">{supporterName}</span></p>
                                    </div>
                                )}
                                <div className="mt-2 text-xs text-gray-400">
                                    <p>🔒 Secure payment powered by M-Pesa</p>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button 
                                type="submit" 
                                disabled={paying || !phone || !amount || amount < 10}
                                className="w-full bg-gradient-to-r from-green-500 to-Tumalove-green text-white py-4 rounded-xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 group"
                            >
                                {paying ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
                                        <span>
                                            {paymentStatus === 'waiting' ? 'Check your phone...' : 'Processing...'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send KES {amount?.toLocaleString()}</span>
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            {/* Security Note */}
                            <div className="text-center pt-2">
                                <p className="text-xs text-gray-400">
                                    💚 Your payment is secured with end-to-end encryption and fraud detection
                                </p>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 sm:py-8 text-center border-t border-gray-100 bg-white/50 backdrop-blur-sm mt-auto">
        <div className="flex justify-center gap-4 sm:gap-6 mb-4 text-xs sm:text-sm font-bold text-gray-500 flex-wrap px-4">
            <Link to="/terms" className="hover:text-black transition-colors px-2 py-1">Terms</Link>
            <Link to="/privacy" className="hover:text-black transition-colors px-2 py-1">Privacy</Link>
            <Link to="/contact" className="hover:text-black transition-colors px-2 py-1">Contact</Link>
            <Link to="/faq" className="hover:text-black transition-colors px-2 py-1">FAQ</Link>
        </div>
        <p className="text-xs text-gray-400 px-4">
            &copy; {new Date().getFullYear()} Tumalove Inc. Nairobi, Kenya 🇰🇪
        </p>
      </footer>

      {/* PROFILE IMAGE MODAL */}
      {isImageOpen && profile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setIsImageOpen(false)}
            ></div>
            
            <div className="relative bg-white p-2 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl max-w-xs sm:max-w-sm w-full animate-in zoom-in-95 duration-200 mx-auto">
                <button 
                    onClick={() => setIsImageOpen(false)}
                    className="absolute -top-10 sm:-top-12 right-0 bg-white/10 text-white rounded-full p-2 hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="aspect-square rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden bg-gray-100">
                    <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name} 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-4 sm:p-5 text-center">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-900">{profile.full_name}</h3>
                    <p className="text-gray-500 text-sm sm:text-base">@{profile.username}</p>
                    <div className="mt-3 flex items-center justify-center gap-1">
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          <BadgeCheck className="w-3 h-3 text-white fill-blue-500" />
                          <span>Verified Creator</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}