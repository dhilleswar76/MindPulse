import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Shield, ArrowRight, Eye, Check, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const AlertsQueuePage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'ACKNOWLEDGED'>('ALL');

  const fetchAlerts = async () => {
    try {
      const res: any = await api.get('/alerts');
      setAlerts(res.data?.alerts || []);
    } catch {
      setAlerts([
        {
          _id: 'alert_1',
          caseId: 'MP-1042',
          studentName: 'Alex Rivera',
          department: 'Protected Witness • Court / Trial Stage',
          riskLevel: 'COUNSELOR_REVIEW',
          status: 'OPEN',
          triggerReason: 'Severe sleep reduction (4.0h avg, -2.8h below baseline) combined with high pre-trial tension (9/10) and low sense of safety (4/10)',
          signals: ['Sleep -2.8h below baseline', 'Court Hearing Tension 9/10', 'Safety Score Variance -4.0'],
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'alert_2',
          caseId: 'MP-1001',
          studentName: 'Jordan Chen',
          department: 'Direct Victim • Investigation Stage',
          riskLevel: 'WATCH',
          status: 'OPEN',
          triggerReason: 'Sudden safety perception drop (-3.0 pts) during ongoing evidence phase and delayed interim compensation application.',
          signals: ['Safety Delta -3.0 pts', 'Evidence Phase Stress 8/10'],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: 'alert_3',
          caseId: 'MP-1003',
          studentName: 'Taylor Morgan',
          department: 'Family Member • Rehabilitation Stage',
          riskLevel: 'STABLE',
          status: 'ACKNOWLEDGED',
          triggerReason: 'Periodic check-in completed. Telemetry trajectory stabilized following vocational rehabilitation grant.',
          signals: ['Sleep Restored 7.0h', 'Support Engagement High'],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    } catch {}
    setAlerts((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Escalation Triage
            </span>
            <span className="text-xs text-slate-400">• Automated Baseline Deviation Flags</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bell className="w-8 h-8 text-amber-400" />
            Live Distress Alerts & Escalations
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Automated escalation flags triggered by persistent high distress signals, significant baseline deviations, or critical trial milestones requiring counselor attention.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'OPEN', 'ACKNOWLEDGED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === tab ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Alerts' : tab === 'OPEN' ? 'Open Alerts' : 'Acknowledged'}
            </button>
          ))}
        </div>
      </div>

      {/* Human-in-the-Loop Safeguard */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5 font-semibold">Triage Protocol Policy</strong>
          Alerts highlight observable telemetry variations. Acknowledging an alert marks it as reviewed by the counselor. Direct outreach, safety measures, and counseling remain under human clinician judgment.
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-12 text-center border border-slate-800 rounded-2xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No active alerts matching filter</h3>
            <p className="text-xs text-slate-400">All monitored cases are currently within expected parameters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-6 rounded-2xl border transition-all ${
                alert.status === 'OPEN'
                  ? 'glass-card border-amber-500/30 bg-gradient-to-r from-amber-950/10 via-slate-900 to-slate-950'
                  : 'glass-card border-slate-800/80 bg-slate-900/40 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-teal-400 font-bold text-xs bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
                    {alert.caseId || 'MP-1042'}
                  </span>
                  <span className="text-base font-bold text-white">{alert.studentName}</span>
                  <span className="text-xs text-slate-400">({alert.department})</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      alert.riskLevel === 'COUNSELOR_REVIEW'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {alert.riskLevel.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Flagged: {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="mx-1">•</span>
                  <span className={`font-semibold ${alert.status === 'OPEN' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Status: {alert.status}
                  </span>
                </div>
              </div>

              {/* Rationale & Signals */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/90 text-xs space-y-2 mb-4">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Observed Escalation Trigger Rationale:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{alert.triggerReason}</p>
                {alert.signals && alert.signals.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {alert.signals.map((sig: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="bg-slate-900 text-teal-300 text-[11px] px-2.5 py-0.5 rounded border border-teal-500/20 font-medium"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions with Clear Semantics */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  {alert.status === 'OPEN'
                    ? 'Recommended: Review participant case workspace to verify context before taking action.'
                    : 'Alert acknowledged. Clinical review in progress.'}
                </div>

                <div className="flex items-center gap-3">
                  {alert.status === 'OPEN' && (
                    <button
                      onClick={() => handleAcknowledge(alert._id)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge Alert</span>
                    </button>
                  )}
                  <Link
                    to={`/counselor/cases/${alert.caseId || 'MP-1042'}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Case Review Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
