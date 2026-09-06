import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export const AlertsQueuePage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res: any = await api.get('/alerts');
      setAlerts(res.data?.alerts || []);
    } catch {
      setAlerts([
        {
          _id: 'alert_1',
          studentName: 'Alex Rivera',
          department: 'Computer Science',
          riskLevel: 'COUNSELOR_REVIEW',
          status: 'OPEN',
          triggerReason: 'Severe sleep reduction (3.5h avg) combined with 3 consecutive days of stress score >= 8',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'alert_2',
          studentName: 'Jordan Chen',
          department: 'Biomedical Engineering',
          riskLevel: 'WATCH',
          status: 'OPEN',
          triggerReason: 'Sudden mood decline deviation (-3.2 from personal baseline)',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/status`, { status: 'ACKNOWLEDGED' });
      fetchAlerts();
    } catch {
      setAlerts(alerts.map((a) => (a._id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Bell className="w-7 h-7 text-amber-400" />
          Live Counselor Alerts Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated escalation flags triggered by persistent high distress or severe baseline deviations.
        </p>
      </div>

      <div className="glass-card p-6 border border-slate-800 space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No active alerts at this time.</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-100">{alert.studentName || 'Student Case'}</span>
                  <span className="text-xs text-slate-400">({alert.department})</span>
                  <span className="badge-review">{alert.riskLevel.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.triggerReason}</p>
                <div className="text-[11px] text-slate-500">
                  Triggered: {new Date(alert.createdAt).toLocaleTimeString()} • Status: {alert.status}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alert.status === 'OPEN' && (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={() => alert('Opening clinical review modal')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
                >
                  Review Case
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
