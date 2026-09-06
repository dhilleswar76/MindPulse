import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HeartPulse, Shield } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-teal">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-teal-400 via-indigo-300 to-white bg-clip-text text-transparent">
              MindPulse
            </span>
          </Link>
          <p className="text-sm text-slate-400">
            Privacy-First Mental Wellness Monitoring & Early Support
          </p>
        </div>

        <div className="glass-card p-8 border border-slate-800 shadow-2xl">
          <Outlet />
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span>Strict Non-Diagnostic Decision Support Policy</span>
        </div>
      </div>
    </div>
  );
};
