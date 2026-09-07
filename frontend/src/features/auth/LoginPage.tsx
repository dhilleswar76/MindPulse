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
        <div className="flex items-center gap-1 text-xs font-semibold text-teal-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo One-Click Fill:</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillQuickDemo('demo.user@mindpulse.local')}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-300 text-center transition-colors"
          >
            Victim / Witness
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('demo.counselor@mindpulse.local')}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-300 text-center transition-colors"
          >
            Counselor
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('demo.admin@mindpulse.local')}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-slate-300 text-center transition-colors"
          >
            District Admin
          </button>
        </div>
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
