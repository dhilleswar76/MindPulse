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
    { to: '/dashboard', label: 'Case Journey & Home', icon: LayoutDashboard },
    { to: '/checkins', label: 'Wellbeing Check-in', icon: Smile },
    { to: '/journal', label: 'Journal & Reflections', icon: BookOpen },
    { to: '/wellness', label: 'Personal Baseline', icon: Activity },
    { to: '/risk', label: 'Distress Signals & XAI', icon: AlertTriangle },
    { to: '/forecast', label: 'Early Risk Forecast', icon: TrendingUp },
    { to: '/recommendations', label: 'Support Pathways', icon: Sparkles },
    { to: '/support', label: 'Support Assistant', icon: Bot },
  ];

  const counselorLinks = [
    { to: '/counselor', label: 'Prioritized Case Queue', icon: Users },
    { to: '/counselor/cases', label: 'Case Summaries & AI', icon: ClipboardList },
    { to: '/counselor/interventions', label: 'Support & Follow-ups', icon: Activity },
    { to: '/counselor/alerts', label: 'Distress Alerts', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin', label: 'District / State Analytics', icon: BarChart3 },
    { to: '/admin/heatmap', label: 'Regional Distress Map', icon: Map },
    { to: '/admin/simulator', label: 'Intervention Impact Sim', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between py-6 px-4 shrink-0 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Section: Victim / Witness Portal */}
        {role === 'USER' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-teal-400 flex items-center justify-between">
              <span>Victim & Witness Portal</span>
              <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20">Active</span>
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
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Section: Counselor Decision Support */}
        {role === 'COUNSELOR' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
              <span>Counselor Portal</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">Active</span>
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
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Section: District / State Welfare Admin */}
        {role === 'ADMIN' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>District Welfare Admin</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">Active</span>
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
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
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
          <span className="font-semibold text-teal-400 block mb-1">Confidential & Protected</span>
          Need immediate support? Contact the National Atrocity Helpline (14566) or your designated case officer.
        </div>
      </div>
    </aside>
  );
};
