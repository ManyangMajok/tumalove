import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight,
  Check, 
  X,
  ShieldCheck,
  Lock,
  Sparkles,
} from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Validation State
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [passwordScore, setPasswordScore] = useState(0)

  // --- 1. ROBUST REAL-TIME USERNAME CHECK ---
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 4) {
        setUsernameAvailable(null)
        setIsCheckingUsername(false)
        return
      }
      
      setIsCheckingUsername(true)
      const cleanUsername = username.toLowerCase().replace(/\s/g, '')

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle()

        if (error) {
            console.error("Check Error:", error.message)
            setUsernameAvailable(null)
        } else {
            setUsernameAvailable(data === null)
        }
      } catch (err) {
        console.error(err)
        setUsernameAvailable(null)
      } finally {
        setIsCheckingUsername(false)
      }
    }

    const timer = setTimeout(checkUsername, 500)
    return () => clearTimeout(timer)
  }, [username])

  // --- 2. PASSWORD STRENGTH CHECK ---
  useEffect(() => {
    let score = 0
    if (password.length > 7) score++        
    if (/[A-Z]/.test(password)) score++     
    if (/[0-9]/.test(password)) score++     
    if (/[^A-Za-z0-9]/.test(password)) score++ 
    setPasswordScore(score)
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Final Validations
    if (username.length < 4) {
        setError("Username must be at least 4 characters long.")
        setLoading(false)
        return
    }
    if (usernameAvailable === false) {
        setError("That username is taken. Please choose another.")
        setLoading(false)
        return
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setLoading(false)
        return
    }
    if (passwordScore < 2) {
        setError("Password is too weak. Add numbers or symbols.")
        setLoading(false)
        return
    }

    const cleanUsername = username.toLowerCase().replace(/\s/g, '')

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: username, 
        },
      },
    })

    if (authError) {
      if (authError.message.includes("already registered") || authError.message.includes("unique constraint")) {
        setError("This email is already registered. Try logging in.")
      } else {
        setError(authError.message)
      }
    } else {
      navigate('/check-email')
    }
    setLoading(false)
  }

  // UI Helpers
  const getStrengthColor = () => {
    if (passwordScore <= 1) return 'bg-red-500'
    if (passwordScore === 2) return 'bg-yellow-500'
    if (passwordScore >= 3) return 'bg-green-500'
    return 'bg-gray-200'
  }

  const getStrengthText = () => {
    if (passwordScore === 0) return ''
    if (passwordScore <= 2) return 'Weak'
    if (passwordScore === 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans selection:bg-green-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Fixed: Back Button - Proper spacing for mobile */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold text-sm bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Main Container with proper top margin for mobile */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8 sm:mt-0">
        
        {/* Header Section - Adjusted spacing */}
        <div className="text-center mb-8 sm:mb-10">
            {/* Fixed: Early Access Badge - More compact on mobile */}
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6 mx-auto">
                <Sparkles className="w-3 h-3" /> 
                <span className="whitespace-nowrap">Early Access</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight px-4 sm:px-0">
                Claim your creative page
            </h1>
            
            <div className="flex flex-col items-center gap-1 sm:gap-2 px-4 sm:px-0">
                <p className="text-gray-500 text-sm sm:text-base md:text-lg">
                    Join 500+ Kenyan creators today.
                </p>
                {/* Fixed: Learn More Link - Adjusted spacing */}
                <Link to="/" className="text-xs sm:text-sm font-bold text-shikilia-green hover:underline flex items-center gap-1 mt-1">
                    Learn more about Shikilia <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>

        {/* Form Card - Matches CreatorProfile Style */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-5 sm:p-8">
          
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSignUp}>
            
            {/* USERNAME FIELD - With Shikilia URL Preview */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Pick a Username
              </label>
              <div className="relative">
                {/* URL Preview - Adjusted for mobile */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs sm:text-sm">
                  shikilia.com/@
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="off"
                  className={`block w-full pl-28 sm:pl-36 pr-10 py-3.5 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 text-sm sm:text-base transition-all bg-gray-50/30 focus:bg-white
                    ${username.length > 0 && username.length < 4 ? 'border-yellow-300 focus:ring-yellow-200' : ''}
                    ${username.length >= 4 && usernameAvailable === false ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : ''}
                    ${username.length >= 4 && usernameAvailable === true ? 'border-green-300 focus:ring-green-200 focus:border-shikilia-brand' : 'border-gray-200'}
                  `}
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                
                {/* Status Icon */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isCheckingUsername ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : username.length >= 4 ? (
                    usernameAvailable ? (
                        <Check className="h-5 w-5 text-green-500" />
                    ) : (
                        <X className="h-5 w-5 text-red-500" />
                    )
                  ) : null}
                </div>
              </div>
              
              {/* Status Text */}
              <div className="mt-2 text-xs min-h-[1.25em]">
                {username.length > 0 && username.length < 4 && (
                  <span className="text-yellow-600">Must be at least 4 characters.</span>
                )}
                {username.length >= 4 && !isCheckingUsername && (
                  <span className={usernameAvailable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                    {usernameAvailable ? '✓ Username available!' : '✗ Username is already taken'}
                  </span>
                )}
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3.5 sm:py-4 border border-gray-200 rounded-xl bg-gray-50/30 focus:bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-shikilia-green text-sm sm:text-base transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full px-4 py-3.5 sm:py-4 border border-gray-200 rounded-xl bg-gray-50/30 focus:bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-shikilia-green text-sm sm:text-base transition-all pr-10"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Meter - Responsive */}
              {password.length > 0 && (
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 font-medium">Password Strength</span>
                        <span className={`text-xs font-bold ${
                            passwordScore <= 2 ? 'text-red-500' : 'text-green-600'
                        }`}>
                            {getStrengthText()}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                            <div 
                                key={step} 
                                className={`flex-1 transition-all duration-300 ${
                                    step <= passwordScore ? getStrengthColor() : 'bg-gray-100'
                                }`} 
                            />
                        ))}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
                        <div className={`text-[10px] text-center px-1 py-0.5 rounded ${password.length > 7 ? 'text-green-700 bg-green-50' : 'text-gray-400'}`}>
                            8+ chars
                        </div>
                        <div className={`text-[10px] text-center px-1 py-0.5 rounded ${/[A-Z]/.test(password) ? 'text-green-700 bg-green-50' : 'text-gray-400'}`}>
                            Uppercase
                        </div>
                        <div className={`text-[10px] text-center px-1 py-0.5 rounded ${/[0-9]/.test(password) ? 'text-green-700 bg-green-50' : 'text-gray-400'}`}>
                            Number
                        </div>
                        <div className={`text-[10px] text-center px-1 py-0.5 rounded ${/[^A-Za-z0-9]/.test(password) ? 'text-green-700 bg-green-50' : 'text-gray-400'}`}>
                            Symbol
                        </div>
                    </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-type your password"
                  className={`appearance-none block w-full pl-10 pr-4 py-3.5 sm:py-4 border rounded-xl bg-gray-50/30 focus:bg-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm sm:text-base transition-all
                     ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200 focus:border-shikilia-green'}
                  `}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                  <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                    <X className="w-3 h-3" /> Passwords do not match
                  </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 font-medium leading-tight">{error}</div>
              </div>
            )}

            {/* Submit Button - Matches CreatorProfile Theme */}
            <div>
              <button
                type="submit"
                disabled={loading || usernameAvailable === false || passwordScore < 2 || password !== confirmPassword || username.length < 4}
                className="w-full flex justify-center items-center gap-2 py-4 sm:py-4 border border-transparent rounded-xl shadow-lg text-base sm:text-sm font-bold text-white bg-gradient-to-r from-green-500 to-shikilia-green hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    Create Secure Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">Already have a page?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Sign in to your account
            </Link>
          </div>

        </div>

        {/* Trust & Safety Info Box - Like CreatorProfile */}
        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <h3 className="text-green-900 font-bold text-sm">Trust & Safety</h3>
          </div>
          <ul className="space-y-2 text-xs text-green-800/80">
            <li className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span>Verified creators only. No impersonation.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span>Secure payments via M-Pesa</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span>Direct support, no middlemen</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Safe Area for Mobile */}
      <div className="h-6 sm:hidden"></div>
    </div>
  )
}