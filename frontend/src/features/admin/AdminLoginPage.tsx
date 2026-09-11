import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, ArrowRight, ShieldCheck, Landmark, KeyRound, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo.admin@mindpulse.local');
  const [password, setPassword] = useState('MindPulseDemo2026!');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const fillAdminDemo = () => {
    setEmail('demo.admin@mindpulse.local');
    setPassword('MindPulseDemo2026!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Institutional Amber Ambient Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Government / Institutional Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 shadow-glow mb-3 border border-amber-400/30">
            <Landmark className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            District Welfare Administration
          </h1>
          <p className="text-xs uppercase font-semibold tracking-wider text-amber-400/90 mt-1">
            Department of Social Justice & Empowerment • Government of India
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Restricted Authorized Personnel Only</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-amber-500/20 shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Administrative Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter official administrative credentials to access regional distress analytics and case telemetry.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Administrative Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@district.gov.in"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Administrative Access Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Verifying Credentials...' : 'Access Admin Portal'}
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>

          {/* Quick Demo Credential Button */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Demo Admin Credentials:
            </div>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="w-full p-2.5 rounded-xl text-left border bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-amber-300 transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Marcus Vance (District Welfare Officer)
                </div>
                <div className="text-[11px] text-slate-400 font-mono">demo.admin@mindpulse.local</div>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                Auto-Fill
              </span>
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Default Demo Password: <code className="text-amber-300 font-mono">MindPulseDemo2026!</code>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/login" className="text-teal-400 hover:underline inline-flex items-center gap-1">
            ← Return to Victim & Counselor Support Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
