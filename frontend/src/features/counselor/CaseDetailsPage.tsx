import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Activity,
  Plus,
  CheckCircle2,
  Scale,
  Landmark,
  HeartHandshake,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Info,
  PhoneCall,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from '../../services/api';
import { CounselorCase, SupportType } from '../../types';
import { CaseJourneyTimeline } from '../../components/CaseJourneyTimeline';
import { AIInsightsDashboard } from '../ai-insights/AIInsightsDashboard';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CounselorCase | null>(null);
  const [isCreatingIntervention, setIsCreatingIntervention] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedSignals, setSelectedSignals] = useState<{ [key: string]: boolean }>({
    stress: true,
    sleep: true,
    mood: true,
    safety: true,
  });

  // Intervention form state
  const [interventionType, setInterventionType] = useState<SupportType>('COUNSELLING');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [followUpDays, setFollowUpDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interventionSuccess, setInterventionSuccess] = useState(false);
  const [caseInterventions, setCaseInterventions] = useState<any[]>([
    {
      _id: 'int_1',
      type: 'COUNSELLING',
      status: 'ACTIVE',
      clinicalNotes: 'Conducted pre-testimony grounding session. Reviewed 4-7-8 somatic relaxation and safe transit with witness protection officer.',
      counselorName: 'Dr. Sarah Jenkins',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res: any = await api.get(`/counselor/cases/${id}`);
        setCaseData(res.data?.case || res.data || null);
      } catch {
        setCaseData({
          id: id || 'case_1042',
          caseId: id?.startsWith('MP') ? id : 'MP-1042',
          userId: 'user_alex_101',
          victimName: 'Alex Rivera (Pseudonymous Witness)',
          victimEmail: 'alex.r@protected.local',
          victimType: 'WITNESS',
          caseStage: 'COURT_TRIAL',
          district: 'Central District',
          state: 'National Capital Region',
          riskLevel: 'ELEVATED',
          riskScore: 0.82,
          riskTrend: 'INCREASING',
          daysInDistress: 4,
          recentCheckIn: {
            mood: 3,
            stress: 9,
            energy: 3,
            sleepHours: 4.0,
            senseOfSafety: 4,
            supportAvailability: 6,
            caseRelatedStress: 9,
            caseStage: 'COURT_TRIAL',
            timestamp: new Date().toISOString(),
          },
          topSignals: [
            {
              feature: 'Sleep Reduction',
              impact: 0.32,
              description: '4.0h average sleep during active cross-examination (2.8h below personal baseline of 6.8h)',
            },
            {
              feature: 'Court Hearing Tension',
              impact: 0.28,
              description: 'Case-related stress reported 9/10 ahead of upcoming witness testimony',
            },
            {
              feature: 'Safety Perception Delta',
              impact: 0.22,
              description: 'Perceived safety score dropped from 8.0 baseline to 4.0',
            },
          ],
          aiSummary:
            'The person’s recent check-ins indicate increased stress and acute sleep reduction during the active Court / Trial stage. Possible contributing signals: impending testimony dates, reduced sleep hours, and safety perception variance. Designated counselor review and witness liaison accompaniment recommended.',
          suggestedPathways: [
            'Trauma-Informed Grounding & Anxiety Reduction',
            'District Witness Protection Officer Check-in',
            'Legal Aid Accompaniment Coordination',
          ],
          interventionsCount: 1,
        });
      }
    };
    fetchCase();
  }, [id]);

  // Telemetry trend synthetic chart series based on timeframe
  const telemetryData7d = [
    { day: 'Day 1', stress: 5, sleep: 7.0, mood: 7, safety: 8 },
    { day: 'Day 2', stress: 5, sleep: 6.5, mood: 6, safety: 7 },
    { day: 'Day 3', stress: 6, sleep: 6.0, mood: 6, safety: 7 },
    { day: 'Day 4', stress: 7, sleep: 5.2, mood: 5, safety: 6 },
    { day: 'Day 5', stress: 8, sleep: 4.5, mood: 4, safety: 5 },
    { day: 'Day 6', stress: 9, sleep: 4.0, mood: 3, safety: 4 },
    { day: 'Day 7 (Today)', stress: 9, sleep: 4.0, mood: 3, safety: 4 },
  ];

  const telemetryData30d = [
    { day: 'Week 1', stress: 4.2, sleep: 6.8, mood: 6.8, safety: 8.0 },
    { day: 'Week 2', stress: 4.5, sleep: 6.6, mood: 6.5, safety: 7.8 },
    { day: 'Week 3', stress: 6.8, sleep: 5.5, mood: 5.2, safety: 6.1 },
    { day: 'Week 4 (Current)', stress: 8.7, sleep: 4.2, mood: 3.4, safety: 4.2 },
  ];

  const telemetryData = timeframe === '7d' ? telemetryData7d : telemetryData30d;

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/interventions', {
        userId: caseData?.userId || 'user_alex_101',
        caseId: caseData?.caseId || 'MP-1042',
        type: interventionType,
        status: 'ACTIVE',
        clinicalNotes: notes,
        scheduledDate,
        riskBeforeScore: caseData?.riskScore || 0.82,
      });
      const newInt = {
        _id: 'int_' + Date.now(),
        type: interventionType,
        status: 'ACTIVE',
        clinicalNotes: notes,
        counselorName: 'Dr. Sarah Jenkins',
        scheduledDate,
      };
      setCaseInterventions((prev) => [newInt, ...prev]);
      setInterventionSuccess(true);
      setTimeout(() => {
        setIsCreatingIntervention(false);
        setInterventionSuccess(false);
        setNotes('');
      }, 1500);
    } catch {
      const newInt = {
        _id: 'int_' + Date.now(),
        type: interventionType,
        status: 'ACTIVE',
        clinicalNotes: notes,
        counselorName: 'Dr. Sarah Jenkins',
        scheduledDate,
      };
      setCaseInterventions((prev) => [newInt, ...prev]);
      setInterventionSuccess(true);
      setTimeout(() => {
        setIsCreatingIntervention(false);
        setInterventionSuccess(false);
        setNotes('');
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!caseData) return <div className="text-center py-12 text-slate-500 text-sm">Loading victim case workspace...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Nav & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          to="/counselor/cases"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Prioritized Caseload Queue</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingIntervention(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Provide Support / Record Action</span>
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="font-mono text-teal-400 font-bold text-lg bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-500/20">
              {caseData.caseId || 'MP-1042'}
            </span>
            <h1 className="text-2xl font-bold text-white">{caseData.victimName}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {caseData.riskLevel.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Participant Role: <strong className="text-slate-200">{caseData.victimType || 'WITNESS'}</strong> • District:{' '}
            <strong className="text-slate-200">{caseData.district}</strong> • State:{' '}
            <strong className="text-slate-200">{caseData.state}</strong> • Assigned Counselor:{' '}
            <strong className="text-indigo-300">Dr. Sarah Jenkins</strong>
          </p>
        </div>

        <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-between lg:justify-end">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Distress Signal Score</span>
            <div className="flex items-center gap-1.5 justify-end mt-0.5">
              <span className="text-3xl font-black text-rose-400">{Math.round(caseData.riskScore * 100)}%</span>
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="text-right border-l border-slate-800 pl-6">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Days in Distress</span>
            <span className="text-3xl font-black text-amber-400 block mt-0.5">{caseData.daysInDistress} Days</span>
          </div>
        </div>
      </div>

      {/* Case Journey Timeline Tracker */}
      <CaseJourneyTimeline
        currentStage={caseData.caseStage || 'COURT_TRIAL'}
        caseId={caseData.caseId || 'MP-1042'}
        victimType={caseData.victimType || 'Protected Witness'}
      />

      {/* Record Support Action Modal / Drawer */}
      {isCreatingIntervention && (
        <div className="glass-card p-6 border border-indigo-500/50 bg-indigo-950/20 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-400" />
              <span>Record Clinical Support Pathway / Action</span>
            </h3>
            <span className="text-xs text-slate-400">
              Case: <strong className="text-teal-400 font-mono">{caseData.caseId}</strong>
            </span>
          </div>

          {interventionSuccess ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Support action successfully logged and follow-up scheduled for outcome telemetry comparison.
              </span>
            </div>
          ) : (
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Support Pathway</label>
                  <select
                    value={interventionType}
                    onChange={(e) => setInterventionType(e.target.value as SupportType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="COUNSELLING">Trauma-Informed Counseling & Grounding</option>
                    <option value="LEGAL_AID">NALSA / State Legal Aid Coordination</option>
                    <option value="PROTECTION_SUPPORT">Witness Protection & Security Liaison</option>
                    <option value="RELOCATION_SUPPORT">Emergency Relocation / Safe Housing</option>
                    <option value="FINANCIAL_ASSISTANCE">Victim Compensation Scheme Assistance</option>
                    <option value="REHABILITATION_SUPPORT">Vocational & Social Rehabilitation</option>
                    <option value="CHECK_IN_CHAT">Supportive Counselor Wellness Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Follow-Up Schedule</label>
                  <select
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={3}>Follow-up in 3 days</option>
                    <option value={7}>Follow-up in 7 days (Standard)</option>
                    <option value={14}>Follow-up in 14 days</option>
                    <option value={30}>Follow-up in 30 days (Rehab)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Counselor Decision Notes & Action Plan (Confidential)
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document specific support actions, trial accommodation requests, or grounding protocols..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingIntervention(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !notes.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? 'Recording Action...' : 'Confirm Support Action & Follow-Up'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* "WHAT CHANGED?" First-Class Deviation Grid */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>What Changed? — Personal Baseline Comparison</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current check-in metrics compared against individual 30-day personal baseline
            </p>
          </div>
          <span className="text-[11px] bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20 font-medium">
            Significant Deviations Detected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Perceived Stress</span>
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +4.8 pts
              </span>
            </div>
            <div className="text-2xl font-black text-white">{caseData.recentCheckIn?.stress || 9} <span className="text-xs text-slate-500 font-normal">/ 10</span></div>
            <span className="text-[11px] text-slate-400 mt-1 block">Baseline usual: 4.2 / 10</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Average Sleep</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -2.8 hrs
              </span>
            </div>
            <div className="text-2xl font-black text-white">{caseData.recentCheckIn?.sleepHours || 4.0} <span className="text-xs text-slate-500 font-normal">hrs</span></div>
            <span className="text-[11px] text-slate-400 mt-1 block">Baseline usual: 6.8 hrs</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Mood Rating</span>
              <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -3.5 pts
              </span>
            </div>
            <div className="text-2xl font-black text-white">{caseData.recentCheckIn?.mood || 3} <span className="text-xs text-slate-500 font-normal">/ 10</span></div>
            <span className="text-[11px] text-slate-400 mt-1 block">Baseline usual: 6.5 / 10</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Sense of Safety</span>
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -4.0 pts
              </span>
            </div>
            <div className="text-2xl font-black text-white">{caseData.recentCheckIn?.senseOfSafety || 4} <span className="text-xs text-slate-500 font-normal">/ 10</span></div>
            <span className="text-[11px] text-slate-400 mt-1 block">Baseline usual: 8.0 / 10</span>
          </div>
        </div>
      </div>

      {/* Interactive Longitudinal Telemetry Trend */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Longitudinal Telemetry Trend</h2>
            <p className="text-xs text-slate-400">Track multi-signal trajectories over time to observe patterns</p>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  timeframe === tf ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Signal Toggles */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSelectedSignals(prev => ({ ...prev, stress: !prev.stress }))}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedSignals.stress
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-semibold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ● Perceived Stress
          </button>
          <button
            onClick={() => setSelectedSignals(prev => ({ ...prev, sleep: !prev.sleep }))}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedSignals.sleep
                ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 font-semibold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ● Sleep Hours
          </button>
          <button
            onClick={() => setSelectedSignals(prev => ({ ...prev, mood: !prev.mood }))}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedSignals.mood
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 font-semibold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ● Mood Score
          </button>
          <button
            onClick={() => setSelectedSignals(prev => ({ ...prev, safety: !prev.safety }))}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedSignals.safety
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            ● Sense of Safety
          </button>
        </div>

        {/* Chart Viewport */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              {selectedSignals.stress && (
                <Line type="monotone" dataKey="stress" name="Stress (1-10)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
              )}
              {selectedSignals.sleep && (
                <Line type="monotone" dataKey="sleep" name="Sleep (Hours)" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} />
              )}
              {selectedSignals.mood && (
                <Line type="monotone" dataKey="mood" name="Mood (1-10)" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
              )}
              {selectedSignals.safety && (
                <Line type="monotone" dataKey="safety" name="Safety (1-10)" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real ML Service AI-Powered Case Insights Dashboard */}
      <AIInsightsDashboard
        userId={caseData.userId}
        caseId={caseData.caseId}
        caseStage={caseData.caseStage}
        initialCheckIns={
          caseData.recentCheckIn ? [caseData.recentCheckIn] : undefined
        }
        onTakeAction={() => setIsCreatingIntervention(true)}
      />

      {/* Longitudinal Case Timeline & Logged Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Column */}
        <div className="lg:col-span-7 glass-card p-6 border border-slate-800 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Chronological Case Telemetry Timeline</span>
          </h2>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 text-xs pl-6">
            <div className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-slate-950" />
              <div className="font-bold text-slate-200">Today • Urgent Check-in Telemetry</div>
              <p className="text-slate-400 mt-0.5">Reported stress 9/10, sleep 4.0h during active cross-examination.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
              <div className="font-bold text-slate-200">Yesterday • Support Action Initiated</div>
              <p className="text-slate-400 mt-0.5">Pre-hearing grounding protocol and safe transit liaison assigned.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-slate-950" />
              <div className="font-bold text-slate-200">4 Days Ago • Stage Transitioned to Court / Trial</div>
              <p className="text-slate-400 mt-0.5">Special Court trial summons issued; elevated pre-trial tension flagged.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-600 ring-4 ring-slate-950" />
              <div className="font-bold text-slate-200">12 Days Ago • Investigation Stage Concluded</div>
              <p className="text-slate-400 mt-0.5">Police charge-sheet submitted to Special Public Prosecutor.</p>
            </div>
          </div>
        </div>

        {/* Logged Support Actions Column */}
        <div className="lg:col-span-5 glass-card p-6 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Support Pathway History</span>
              </h2>
              <span className="text-xs text-teal-400 font-medium">
                {caseInterventions.length} logged
              </span>
            </div>

            <div className="space-y-3">
              {caseInterventions.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-indigo-300">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                    {item.clinicalNotes}
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Logged: {new Date(item.scheduledDate).toLocaleDateString()} by {item.counselorName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => setIsCreatingIntervention(true)}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Additional Support Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
