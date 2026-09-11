import React from 'react';
import {
  Shield,
  HeartHandshake,
  Wind,
  BookOpen,
  Scale,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  PhoneCall,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AIInsightsDashboard } from '../ai-insights/AIInsightsDashboard';

export const RiskAssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const isProfessional = user?.role === 'COUNSELOR' || user?.role === 'ADMIN';

  // Professional View: Authorized counselors and administrators see detailed AI decision-support inferences
  if (isProfessional) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Professional Decision-Support Interface</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              AI Case Insights & Clinical Telemetry
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Detailed machine learning inferences, longitudinal anomaly detection, and SHAP explainability for professional counselor review.
            </p>
          </div>

          <Link
            to="/counselor/cases"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-colors self-start sm:self-auto"
          >
            <span>Return to Caseload Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Safety Notice */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-200 block mb-0.5">Professional Review Standard</strong>
            AI decision-support only. AI outputs are non-diagnostic and require human professional judgment. Inferences must assist the counselor, not replace clinical evaluation or automatic decision-making.
          </div>
        </div>

        {/* Full AI Insights Dashboard for Authorized Professionals */}
        <AIInsightsDashboard
          userId={user?.id || 'user_alex_101'}
          caseId={user?.caseId || 'MP-1042'}
          caseStage={user?.caseStage || 'COURT_TRIAL'}
          title="PROFESSIONAL AI CASE INSIGHTS"
          subtitle="Real-time distress prediction, anomaly screening, and trajectory forecasting powered by MindPulse ML Engine"
        />
      </div>
    );
  }

  // Victim / Participant View: Safe, non-diagnostic wellbeing summary without raw numerical scores or alarming classifications
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supportive Wellbeing Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Understanding Your Wellbeing Signals
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            A safe, non-diagnostic reflection of your recent self-reported check-in patterns with personalized connections to your support team.
          </p>
        </div>

        <Link
          to="/support"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow transition-colors self-start sm:self-auto"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Connect With Support</span>
        </Link>
      </div>

      {/* Calm, Non-Diagnostic Recommendation Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/20 border border-teal-500/30 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-wide">
                Your wellbeing may benefit from additional support
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Your recent check-ins indicate that connecting with your support team or engaging in restorative practices may be helpful. Your designated counselor has been notified to provide gentle accompaniment.
              </p>
            </div>
          </div>

          <Link
            to="/victim/counsellor-chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span>Talk With Counselor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <Link to="/victim/counsellor-chat" className="flex items-center gap-1.5 text-teal-300 hover:text-teal-200 transition-colors">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Assigned Counselor: <strong>{user?.assignedCounselor || 'Dr. Sarah Jenkins'}</strong></span>
          </Link>
          <span className="text-slate-600">•</span>
          <span>District Welfare & Legal Aid Support Cell Active</span>
        </div>
      </div>

      {/* Safe Self-Reported Pattern Highlights (Non-clinical qualitative cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Recent Self-Reported Reflections</span>
          </h2>
          <span className="text-xs text-slate-500">Based on your daily check-in entries</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Sleep & Rest Rhythm</span>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Rest Deficit Noted</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Recent entries indicate shorter sleep hours. Restorative bedtime grounding and NSDR exercises are recommended.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Case-Related Stress</span>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>Pre-Hearing Sensitivity</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Higher tension noted ahead of upcoming legal milestones. Courtroom orientation and safe transit support are available.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Support Team Liaison</span>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Counselor Touchpoint Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dr. Sarah Jenkins is available to discuss pre-trial worries, witness protection transport, and emotional grounding.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Supportive Pathways Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Recommended Everyday Support Pathways</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/victim/counsellor-chat"
            className="p-5 rounded-2xl bg-slate-900/85 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                Counsellor Dialogue
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with your assigned trauma counsellor in a confidential, encrypted 1-to-1 conversation space.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
              <span>Chat With Counsellor</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/recommendations"
            className="p-5 rounded-2xl bg-slate-900/85 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                Grounding Practices
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                4-7-8 somatic breathing exercises and 5-4-3-2-1 sensory resets to center attention before court dates.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
              <span>Try Calming Tools</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/journal"
            className="p-5 rounded-2xl bg-slate-900/85 hover:bg-slate-800/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                Reflection Journal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Private, safe space to organize thoughts, record feelings, and prepare for counselor debriefs.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-400 flex items-center gap-1">
              <span>Write Reflection</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/compensation"
            className="p-5 rounded-2xl bg-slate-900/85 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Victim Compensation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculate statutory relief under Section 357A CrPC and submit Form I with your mandatory documents.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Explore Relief</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* Non-Diagnostic Safety Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 block mb-0.5">Non-Diagnostic Participant Notice</strong>
          MindPulse provides supportive guidance to assist victims and protected witnesses. It does not provide clinical diagnoses, psychiatric labels, or numerical risk determinations to participants. Detailed case telemetry is reviewed confidentially by human professional counselors.
        </div>
      </div>
    </div>
  );
};
