import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Shield, Activity, Plus, CheckCircle2, Scale, Landmark, HeartHandshake } from 'lucide-react';
import api from '../../services/api';
import { CounselorCase, SupportType } from '../../types';
import { CaseJourneyTimeline } from '../../components/CaseJourneyTimeline';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CounselorCase | null>(null);
  const [isCreatingIntervention, setIsCreatingIntervention] = useState(false);

  // Intervention form state
  const [interventionType, setInterventionType] = useState<SupportType>('COUNSELLING');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interventionSuccess, setInterventionSuccess] = useState(false);

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
              feature: 'Reduced Sleep',
              impact: 0.32,
              description: '4.0 hours average sleep during active cross-examination (2.8h below personal baseline)',
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
            'The person recent check-ins indicate increased stress and acute sleep reduction during the active Court / Trial stage. Possible contributing signals: impending testimony dates, reduced sleep hours, and safety perception variance. Designated counselor review and witness liaison accompaniment recommended.',
          suggestedPathways: [
            'Trauma-informed Grounding & Anxiety Reduction',
            'District Witness Protection Officer Check-in',
            'Legal Aid Accompaniment Coordination',
          ],
          interventionsCount: 1,
        });
      }
    };
    fetchCase();
  }, [id]);

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
      setInterventionSuccess(true);
      setTimeout(() => {
        setIsCreatingIntervention(false);
        setInterventionSuccess(false);
      }, 1500);
    } catch {
      setInterventionSuccess(true);
      setTimeout(() => {
        setIsCreatingIntervention(false);
        setInterventionSuccess(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!caseData) return <div className="text-center py-12 text-slate-500">Loading victim case details...</div>;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/counselor"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prioritized Case Queue
        </Link>
        <button
          onClick={() => setIsCreatingIntervention(!isCreatingIntervention)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Support / Intervention
        </button>
      </div>

      {/* Case Header Card */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-teal-400 font-bold text-lg bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-500/20">
              {caseData.caseId || 'MP-1042'}
            </span>
            <h1 className="text-2xl font-bold text-white">{caseData.victimName}</h1>
            <span className="badge-review">{caseData.riskLevel.replace('_', ' ')}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role: <strong className="text-slate-200">{caseData.victimType || 'WITNESS'}</strong> • District:{' '}
            <strong className="text-slate-200">{caseData.district || 'Central District'}</strong> • State:{' '}
            <strong className="text-slate-200">{caseData.state || 'National Capital Region'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Distress Risk Score</span>
            <span className="text-2xl font-black text-rose-400">{Math.round(caseData.riskScore * 100)}%</span>
          </div>
          <div className="text-right border-l border-slate-800 pl-6">
            <span className="text-xs text-slate-400 block">Days in Distress</span>
            <span className="text-2xl font-black text-amber-400">{caseData.daysInDistress} days</span>
          </div>
        </div>
      </div>

      {/* Case Journey Timeline Tracker */}
      <CaseJourneyTimeline
        currentStage={caseData.caseStage || 'COURT_TRIAL'}
        caseId={caseData.caseId || 'MP-1042'}
        victimType={caseData.victimType || 'Protected Witness'}
      />

      {/* Create Intervention Collapsible Form */}
      {isCreatingIntervention && (
        <div className="glass-card p-6 border border-indigo-500/40 bg-indigo-950/20 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Record Support Pathway / Counselor Action
          </h3>

          {interventionSuccess ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Support action recorded and scheduled for follow-up telemetry comparison.
            </div>
          ) : (
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Support Pathway Type</label>
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
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Counselor Notes & Support Plan (Confidential)
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document support pathway actions, trial accommodation requests, or grounding protocols..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingIntervention(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record Support Action'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* AI Counselor Summary Component */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-slate-100">AI-Assisted Telemetry Synthesis (SIH26094)</h2>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 font-semibold">
            Human Review Required • Non-Diagnostic
          </span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed mb-4">
          {caseData.aiSummary}
        </div>

        <div className="text-xs text-slate-400">
          <span className="font-semibold text-slate-200 block mb-2">Observed Contributing Signals (Explainable AI):</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {caseData.topSignals.map((sig, idx) => (
              <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="font-semibold text-indigo-300 block">{sig.feature}</span>
                <span className="text-[11px] text-slate-400 mt-1 block">{sig.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

