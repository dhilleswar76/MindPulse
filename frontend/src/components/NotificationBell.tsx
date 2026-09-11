import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Clock, X, ExternalLink, Check } from 'lucide-react';
import api from '../services/api';
import { AppNotification } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res: any = await api.get('/notifications');
      const data = res.data?.data || res.data || {};
      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(data.unreadCount !== undefined ? data.unreadCount : list.filter((n: any) => !n.read).length);
    } catch {
      // Fallback notifications for demo/presentation
      if (user.role === 'ADMIN') {
        const demoNotifs: AppNotification[] = [
          {
            _id: 'notif_1',
            recipientRole: 'ADMIN',
            caseId: 'MP-1042',
            stage: 'Trial',
            type: 'STAGE_COMPLETION_REQUESTED',
            title: 'Stage completion approval required',
            message: 'Counsellor Dr. Sarah Jenkins submitted Trial stage for Case MP-1042 for admin approval.',
            submittedBy: 'Dr. Sarah Jenkins',
            status: 'Pending Approval',
            read: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setNotifications(demoNotifs);
        setUnreadCount(1);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    handleMarkAsRead(notif._id);
    setIsOpen(false);
    if (user?.role === 'ADMIN') {
      navigate('/admin/inbox');
    } else if (user?.role === 'COUNSELOR' && notif.caseId) {
      navigate(`/counselor/cases/${notif.caseId}`);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Official Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((n) => {
                const isStageReq = n.type === 'STAGE_COMPLETION_REQUESTED';
                const isStageAppr = n.type === 'STAGE_APPROVED';
                const isStageRej = n.type === 'STAGE_REJECTED';

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-850 flex items-start gap-3 ${
                      !n.read ? 'bg-slate-850/50' : 'bg-transparent opacity-80'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isStageAppr ? (
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isStageRej ? (
                        <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : isStageReq ? (
                        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`font-bold text-xs truncate ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {n.message}
                      </p>

                      {n.rejectionReason && (
                        <p className="text-[10px] text-rose-300/90 mt-1 bg-rose-950/40 p-1.5 rounded border border-rose-500/20">
                          <strong>Reason:</strong> {n.rejectionReason}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] text-slate-500">
                        {n.caseId && (
                          <span className="font-mono text-teal-400/90 font-semibold">{n.caseId}</span>
                        )}
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-2 border-t border-slate-800 bg-slate-950 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                if (user.role === 'ADMIN') navigate('/admin/inbox');
                else if (user.role === 'COUNSELOR') navigate('/counselor/cases');
              }}
              className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center justify-center gap-1 mx-auto py-1"
            >
              <span>{user.role === 'ADMIN' ? 'Go to Stage Transition Inbox' : 'Go to Caseload Queue'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
