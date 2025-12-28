import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import QRCode from 'qrcode';
import AdminLayout from '../layouts/AdminLayout';
import { Loader2, Trash2, CheckCircle, Smartphone, Copy, ArrowRight, AlertTriangle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ROOT } from '../config'; // <--- IMPORT

export default function MfaSetup() {
  const [qr, setQr] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'LOADING' | 'READY' | 'CONFLICT' | 'SUCCESS'>('LOADING');
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setStatus('READY');
  }, []);

  const generateQRCode = async () => {
    setStatus('LOADING');
    try {
      const uniqueName = `Tumalove Admin ${Math.floor(Math.random() * 1000)}`;
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: uniqueName,
      });
      if (error) throw error;
      if (!data) throw new Error("No data");

      setFactorId(data.id);
      setManualSecret(data.totp.secret);

      try {
        const url = await QRCode.toDataURL(data.totp.uri, { errorCorrectionLevel: 'L', width: 300 });
        setQr(url);
      } catch {
        console.warn("QR Gen failed, falling back to manual");
      }
      setStatus('READY');
    } catch (err: any) {
      if (err.message?.includes('already exists')) setStatus('CONFLICT');
      else setStatus('READY');
    }
  };

  const forceReset = async () => {
    setStatus('LOADING');
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      if (data?.totp) {
        for (const f of data.totp) await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      setTimeout(() => generateQRCode(), 500);
    } catch {
      setStatus('CONFLICT');
    }
  };

  const verify = async () => {
    setStatus('LOADING');
    try {
      const { data: challenge, error: chError } = await supabase.auth.mfa.challenge({ factorId });
      if (chError) throw chError;

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (error) throw error;

      setStatus('SUCCESS');
      setTimeout(() => navigate(`${ADMIN_ROOT}/dashboard`), 2000); // <--- USE CONFIG
    } catch {
      alert("Invalid Code. Try again.");
      setStatus('READY');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(manualSecret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Progress Header */}
          <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
            <div>
              <h1 className="font-bold text-lg">Secure Your Account</h1>
              <p className="text-slate-400 text-xs">Mandatory Security Setup</p>
            </div>
            <div className="flex gap-2">
              <div className={`w-2 h-2 rounded-full ${!qr ? 'bg-green-500' : 'bg-slate-700'}`} />
              <div className={`w-2 h-2 rounded-full ${qr && status !== 'SUCCESS' ? 'bg-green-500' : 'bg-slate-700'}`} />
              <div className={`w-2 h-2 rounded-full ${status === 'SUCCESS' ? 'bg-green-500' : 'bg-slate-700'}`} />
            </div>
          </div>

          <div className="p-8">
            {/* STEP 1: START */}
            {status === 'READY' && !qr && !manualSecret && (
              <div className="text-center py-8">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Authenticator App Required</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  You need an app like Google Authenticator or Authy to generate secure login codes for Tumalove.
                </p>
                <button onClick={generateQRCode} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  Start Setup <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: SCAN */}
            {(qr || manualSecret) && status === 'READY' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="text-center">
                  <h3 className="font-bold text-slate-800">Scan QR Code</h3>
                  <p className="text-xs text-slate-500">Open your app and scan this image.</p>
                </div>

                {qr ? (
                  <img src={qr} alt="QR" className="mx-auto rounded-xl border-2 border-slate-100 p-2" />
                ) : (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                    <p className="text-xs font-bold text-amber-700 mb-2">QR Failed - Use Manual Code</p>
                    <div className="flex items-center gap-2 bg-white border border-amber-200 p-2 rounded-lg cursor-pointer hover:border-amber-400 transition-colors" onClick={copySecret}>
                      <code className="flex-1 font-mono text-slate-700 tracking-wider text-sm">{manualSecret}</code>
                      {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enter Verification Code</label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="000 000"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-3xl tracking-[0.5em] font-mono border-b-2 border-slate-200 focus:border-green-500 outline-none py-2 bg-transparent text-slate-800"
                    maxLength={6}
                  />
                  <button 
                    onClick={verify}
                    disabled={code.length !== 6}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold mt-6 hover:bg-green-700 transition-all disabled:opacity-50 disabled:shadow-none shadow-lg shadow-green-200"
                  >
                    Verify & Complete
                  </button>
                </div>
              </div>
            )}

            {/* LOADING */}
            {status === 'LOADING' && (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Securing connection...</p>
              </div>
            )}

            {/* SUCCESS */}
            {status === 'SUCCESS' && (
              <div className="text-center py-12 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h2>
                <p className="text-slate-500">Redirecting to portal...</p>
              </div>
            )}

            {/* CONFLICT ERROR */}
            {status === 'CONFLICT' && (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900">Setup Conflict</h3>
                <p className="text-sm text-slate-500 mb-6">An incomplete setup was found.</p>
                <button onClick={forceReset} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2">
                  <Trash2 size={18} /> Reset & Try Again
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
