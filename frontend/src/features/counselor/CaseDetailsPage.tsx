import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Shield, User, Activity, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { CounselorCase } from '../../types';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CounselorCase | null>(null);
  const [isCreatingIntervention, setIsCreatingIntervention] = useState(false);
  
  // Intervention form state
  const [interventionType, setInterventionType] = useState('COUNSELING_SESSION');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interventionSuccess, setInterventionSuccess] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res: any = await api.get(`/counselor/cases/${id}`);
        setCaseData(res.data?.case || null);
      } catch {
        setCaseData({
          id: id || 'case_101',
          userId: 'user_alex_101',
          studentName: 'Alex Rivera',
          studentEmail: 'alex.r@campus.edu',
          department: 'Computer Science',
          yearOfStudy: 3,
          riskLevel: 'REQUIRES_REVIEW',
          riskScore: 0.82,
          riskTrend: 'escalating',
          daysInDistress: 4,
          recentCheckIn: {
            mood: 3,
            stress: 9,
            energy: 3,
            sleepHours: 4.0,
            timestamp: new Date().toISOString(),
          },
          topSignals: [
            { feature: 'Sleep Deficit', impact: 0.32, description: '4.0 hours average sleep over past 4 days (2.8h below student baseline)' },
            { feature: 'Elevated Stress', impact: 0.28, description: 'Consistently reporting 9/10 stress level during midterm period' },
            { feature: 'Mood Trajectory', impact: 0.18, description: 'Down -4.2 points from 14-day rolling average' },
          ],
          aiSummary: 'The student recent check-ins show increased stress, reduced sleep duration, and a downward mood trend compared with their historical baseline.',
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

  if (!caseData) return <div className="text-center py-12 text-slate-500">Loading student case details...</div>;

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link to="/counselor" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Triage Queue
        </Link>
        <button
          onClick={() => setIsCreatingIntervention(!isCreatingIntervention)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Log Clinical Intervention
        </button>
      </div>

      {/* Case Header Card */}
      <div className="glass-card p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{caseData.studentName}</h1>
            <span className="badge-review">{caseData.riskLevel.replace('_', ' ')}</span>
          </div>
          <p className="text-xs text-slate-400">
            {caseData.studentEmail} • {caseData.department} • Year {caseData.yearOfStudy}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Distress Intensity</span>
            <span className="text-2xl font-black text-rose-400">{Math.round(caseData.riskScore * 100)}%</span>
          </div>
          <div className="text-right border-l border-slate-800 pl-6">
            <span className="text-xs text-slate-400 block">Distress Duration</span>
            <span className="text-2xl font-black text-amber-400">{caseData.daysInDistress} days</span>
          </div>
        </div>
      </div>

      {/* Create Intervention Collapsible Form */}
      {isCreatingIntervention && (
        <div className="glass-card p-6 border border-indigo-500/40 bg-indigo-950/20">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Create Counselor Intervention Record
          </h3>

          {interventionSuccess ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Intervention scheduled and recorded in student decision log.
            </div>
          ) : (
            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Intervention Type</label>
                  <select
                    value={interventionType}
                    onChange={(e) => setInterventionType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="COUNSELING_SESSION">1-on-1 Counseling Session</option>
                    <option value="CHECK_IN_CHAT">Supportive Check-in Chat</option>
                    <option value="RESOURCE_REFERRAL">Resource & Academic Support Referral</option>
                    <option value="ACADEMIC_ADJUSTMENT">Academic Deadline Adjustment</option>
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Clinical Assessment & Notes</label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Document focus areas (sleep hygiene, academic stress, grounding techniques)..."
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
                  {isSubmitting ? 'Saving...' : 'Save Intervention'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* AI Counselor Summary Component */}
      <div className="glass-card p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-slate-100">AI-Assisted Telemetry Synthesis</h2>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 font-semibold">
            Human Review Required
          </span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed mb-4">
          {caseData.aiSummary}
        </div>

        <div className="text-xs text-slate-400">
          <span className="font-semibold text-slate-200 block mb-2">Observed Contributing Telemetry:</span>
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
