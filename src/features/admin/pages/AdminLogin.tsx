import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { ShieldCheck, Loader2, Smartphone, ArrowRight, Lock } from 'lucide-react';
import { ADMIN_ROOT } from '../config'; // <--- IMPORT

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Authenticate
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // 2. Check Admin Permissions
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Account not authorized.");
      }

      // 3. Check Security Level (2FA)
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factors?.totp?.find(f => f.status === 'verified');

      if (verifiedFactor) {
        setStep('2FA');
      } else {
        // Enforce Setup
        navigate(`${ADMIN_ROOT}/setup-2fa`); // <--- USE CONFIG
      }
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Access Denied')) await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factorId = factors?.totp?.[0]?.id;
      if (!factorId) throw new Error("Security factor not found.");

      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId });
      if (chError) throw chError;

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (error) throw new Error("Invalid or expired code.");

      // Success
      navigate(`${ADMIN_ROOT}/dashboard`); // <--- USE CONFIG

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-green-500/20">
            <ShieldCheck className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tumalove Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Management Portal</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Lock size={16} /> {error}
            </div>
          )}

          {step === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium text-slate-900"
                  placeholder="name@tumalove.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium text-slate-900"
                  placeholder="••••••••••••"
                />
              </div>
              <button 
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={verify2FA} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-full mb-3 text-green-600">
                  <Smartphone size={24} />
                </div>
                <h3 className="font-bold text-slate-900">Two-Factor Auth</h3>
                <p className="text-xs text-slate-500 px-8">Enter the 6-digit code from your authenticator app.</p>
              </div>

              <input 
                type="text" 
                autoFocus
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-3xl tracking-[0.5em] font-mono border-b-2 border-slate-200 focus:border-green-500 outline-none py-2 bg-transparent transition-colors text-slate-800"
                maxLength={6}
                placeholder="000000"
              />

              <button 
                disabled={loading || code.length !== 6}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:shadow-none shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep('LOGIN')}
                className="w-full text-xs text-slate-400 font-medium hover:text-slate-600"
              >
                Cancel and go back
              </button>
            </form>
          )}
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">
            <Lock size={10} className="inline mr-1" />
            End-to-end encrypted session
          </p>
        </div>
      </div>
    </div>
  );
}
