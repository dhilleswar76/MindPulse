import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Smile,
  BookOpen,
  Activity,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Bot,
  Users,
  ClipboardList,
  BarChart3,
  Map,
  Sliders,
  Bell,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'USER';

  const userLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/checkins', label: 'Daily Check-in', icon: Smile },
    { to: '/journal', label: 'Journal & Reflections', icon: BookOpen },
    { to: '/wellness', label: 'Personal Baseline', icon: Activity },
    { to: '/risk', label: 'Distress Signals & XAI', icon: AlertTriangle },
    { to: '/forecast', label: '7-Day Forecast', icon: TrendingUp },
    { to: '/recommendations', label: 'Support Resources', icon: Sparkles },
    { to: '/support', label: 'Support Assistant', icon: Bot },
  ];

  const counselorLinks = [
    { to: '/counselor', label: 'Triage Queue', icon: Users },
    { to: '/counselor/cases', label: 'Case Summaries', icon: ClipboardList },
    { to: '/counselor/interventions', label: 'Interventions & Outcomes', icon: Activity },
    { to: '/counselor/alerts', label: 'Live Alerts', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Institutional Analytics', icon: BarChart3 },
    { to: '/admin/heatmap', label: 'Campus Wellness Map', icon: Map },
    { to: '/admin/simulator', label: 'Intervention Simulator', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="space-y-6">
        {/* Section: Student Portal */}
        {(role === 'USER' || role === 'ADMIN') && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Student Wellness
            </div>
            <nav className="space-y-1">
              {userLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Section: Counselor Portal */}
        {(role === 'COUNSELOR' || role === 'ADMIN') && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Counselor Decision Support
            </div>
            <nav className="space-y-1">
              {counselorLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Section: Admin Portal */}
        {role === 'ADMIN' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Institutional Admin
            </div>
            <nav className="space-y-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Safety Notice in Sidebar */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-teal-400 block mb-1">Confidential & Safe</span>
          Need immediate help? Call 988 or Campus Health 24/7.
        </div>
      </div>
    </aside>
  );
};
