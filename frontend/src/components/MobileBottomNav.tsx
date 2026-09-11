import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Smile,
  Activity,
  Sparkles,
  Users,
  Bell,
  BarChart3,
  Map,
  Sliders,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'USER';

  const userItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/checkins', label: 'Check-in', icon: Smile },
    { to: '/wellness', label: 'History', icon: Activity },
    { to: '/recommendations', label: 'Support', icon: Sparkles },
  ];

  const counselorItems = [
    { to: '/counselor', label: 'Triage', icon: LayoutDashboard },
    { to: '/counselor/cases', label: 'Cases', icon: Users },
    { to: '/counselor/alerts', label: 'Alerts', icon: Bell },
    { to: '/counselor/interventions', label: 'Actions', icon: Activity },
  ];

  const adminItems = [
    { to: '/admin', label: 'Overview', icon: BarChart3 },
    { to: '/admin/heatmap', label: 'Heatmap', icon: Map },
    { to: '/admin/simulator', label: 'Simulator', icon: Sliders },
  ];

  const items =
    role === 'COUNSELOR' ? counselorItems : role === 'ADMIN' ? adminItems : userItems;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around"
      aria-label="Mobile Bottom Navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-teal-400 font-bold bg-teal-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
