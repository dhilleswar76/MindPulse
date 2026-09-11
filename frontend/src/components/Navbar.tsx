import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity, Shield, UserCheck, LogOut, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-teal group-hover:scale-105 transition-transform">
          <HeartPulse className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-indigo-300 to-white bg-clip-text text-transparent">
            MindPulse
          </span>
          <span className="block text-[10px] uppercase tracking-wider text-teal-400/90 font-semibold">
            Victim Wellbeing & Support
          </span>
        </div>
      </Link>

      {/* Non-Diagnostic Reminder banner */}
      <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1 text-xs text-slate-300">
        <Shield className="w-3.5 h-3.5 text-teal-400" />
        <span>Ministry of Social Justice & Empowerment • Non-Diagnostic Decision Support</span>
      </div>

      {/* Authenticated Portal Badge */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold">
          {user?.role === 'COUNSELOR' ? (
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Counselor Portal
            </span>
          ) : user?.role === 'ADMIN' ? (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              District Admin Portal
            </span>
          ) : (
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Victim & Witness Portal
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-slate-200">{user?.fullName}</div>
            <div className="text-xs text-slate-400">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
