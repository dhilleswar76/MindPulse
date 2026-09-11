import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo.user@mindpulse.local');
  const [password, setPassword] = useState('MindPulseDemo2026!');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      if (email.includes('counselor')) navigate('/counselor');
      else if (email.includes('admin')) navigate('/admin');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const fillQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('MindPulseDemo2026!');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome back</h2>
      <p className="text-sm text-slate-400 mb-6">Sign in to access your confidential wellness portal</p>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@support.portal"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Accounts (Click to Auto-Fill):</span>
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fillQuickDemo('demo.user@mindpulse.local')}
            className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
              email === 'demo.user@mindpulse.local'
                ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                Victim / Protected Witness
              </div>
              <div className="text-[11px] text-slate-400 font-mono">demo.user@mindpulse.local</div>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
              /dashboard
            </span>
          </button>

          <button
            type="button"
            onClick={() => fillQuickDemo('demo.counselor@mindpulse.local')}
            className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
              email === 'demo.counselor@mindpulse.local'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Designated Counselor
              </div>
              <div className="text-[11px] text-slate-400 font-mono">demo.counselor@mindpulse.local</div>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              /counselor
            </span>
          </button>

          <button
            type="button"
            onClick={() => fillQuickDemo('demo.admin@mindpulse.local')}
            className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
              email === 'demo.admin@mindpulse.local'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                District Welfare Admin (Hidden)
              </div>
              <div className="text-[11px] text-slate-400 font-mono">demo.admin@mindpulse.local</div>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              /admin
            </span>
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400 text-center">
          Default Password: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-teal-300 font-mono">MindPulseDemo2026!</code>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-teal-400 hover:underline font-medium">
          Create one now
        </Link>
      </p>
    </div>
  );
};
