import React, { useState, useEffect } from 'react';
import {
  Smile,
  Activity,
  AlertTriangle,
  BookOpen,
  Bot,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Landmark,
  Scale,
  HeartHandshake,
  Mic,
  Clock,
  CheckCircle2,
  PhoneCall,
  Info,
  Calendar,
  ChevronRight,
  Shield,
  Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { CaseJourneyTimeline } from '../../components/CaseJourneyTimeline';
import { VoiceStressModal } from '../voice/VoiceStressModal';
import { WellnessTrendChart } from '../checkins/WellnessTrendChart';
import { CaseStage } from '../../types';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [baseline, setBaseline] = useState<any>({
    avgMood: 6.8,
    avgStress: 5.0,
    avgEnergy: 5.8,
    avgSleep: 7.0,
    avgSafety: 7.4,
    avgCaseStress: 4.8,
  });

  const [recent, setRecent] = useState<any>({
    avgMood: 5.4,
    avgStress: 7.4,
    avgEnergy: 4.5,
    avgSleep: 5.2,
    avgSafety: 5.5,
    avgCaseStress: 7.8,
  });

  const [comparison, setComparison] = useState<any>({
    stressStatus: 'Higher than your usual pattern',
    sleepStatus: '1.8h below your average',
    safetyStatus: 'Reduced compared with usual pattern',
    caseTensionStatus: 'Elevated during current trial stage',
    summaryText:
      'Your recent pattern shows higher case-related tension and lower sleep hours compared with your usual baseline. Support options and grounding exercises are available.',
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const currentStage: CaseStage = user?.caseStage || 'COURT_TRIAL';
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isStageExplanationOpen, setIsStageExplanationOpen] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const trendRes: any = await api.get('/checkins/trend');
        if (trendRes.data?.baseline) setBaseline(trendRes.data.baseline);
        if (trendRes.data?.recent) setRecent(trendRes.data.recent);
        if (trendRes.data?.comparison) setComparison(trendRes.data.comparison);
        if (trendRes.data?.trend?.length > 0) {
          setTrendData(trendRes.data.trend);
        }
      } catch {
        // Fallback synthetic telemetry
        setTrendData([
          { date: 'Day 1', mood: 8, stress: 3, energy: 7, sleepHours: 8, senseOfSafety: 8, caseRelatedStress: 3 },
          { date: 'Day 2', mood: 7, stress: 4, energy: 6, sleepHours: 7.5, senseOfSafety: 8, caseRelatedStress: 4 },
          { date: 'Day 3', mood: 6, stress: 6, energy: 5, sleepHours: 6, senseOfSafety: 6, caseRelatedStress: 6 },
          { date: 'Day 4', mood: 5, stress: 7, energy: 4, sleepHours: 5.5, senseOfSafety: 5, caseRelatedStress: 8 },
          { date: 'Day 5', mood: 6, stress: 5, energy: 6, sleepHours: 7, senseOfSafety: 7, caseRelatedStress: 5 },
          { date: 'Day 6', mood: 5, stress: 8, energy: 4, sleepHours: 5.0, senseOfSafety: 5, caseRelatedStress: 8 },
        ]);
      }
    };
    loadOverview();
  }, []);

  const getStageDetails = (stage: CaseStage) => {
    switch (stage) {
      case 'CASE_REGISTRATION':
        return {
          title: 'Case Registration',
          desc: 'Filing of First Information Report (FIR) and initial welfare intake under the SC/ST Prevention of Atrocities framework.',
          focus: 'Intake confirmation, legal counsel orientation, and initial safety assessment.',
          nextStage: 'Investigation',
        };
      case 'INVESTIGATION':
        return {
          title: 'Investigation',
          desc: 'Collection of statements, evidence gathering, and forensic review by designated investigating authorities.',
          focus: 'Statement support, witness security planning, and psychological grounding.',
          nextStage: 'Court / Trial',
        };
      case 'COURT_TRIAL':
        return {
          title: 'Court / Trial (Current Stage)',
          desc: 'Special Court trial proceedings, witness testimony examinations, and cross-examinations.',
          focus: 'Pre-trial testimony preparation, stress stabilization, safe transit coordination, and DLSA legal aid representation.',
          nextStage: 'Compensation & Relief',
        };
      case 'COMPENSATION':
        return {
          title: 'Compensation & Relief',
          desc: 'Processing of statutory financial relief and interim victim compensation under Ministry schemes.',
          focus: 'Claim documentation, disbursement follow-ups, and financial counseling support.',
          nextStage: 'Rehabilitation',
        };
      case 'REHABILITATION':
        return {
          title: 'Rehabilitation',
          desc: 'Longitudinal social, vocational, and educational rehabilitation measures.',
          focus: 'Skill development, livelihood restoration, and ongoing community integration.',
          nextStage: 'Protection & Support',
        };
      case 'PROTECTION_SUPPORT':
      default:
        return {
          title: 'Protection & Support',
          desc: 'Ongoing witness protection review and post-trial welfare monitoring.',
          focus: 'Periodic safety audits and sustained community wellbeing.',
          nextStage: 'Case Closure / Sustained Safety',
        };
    }
  };

  const activeStageInfo = getStageDetails(currentStage);

  return (
    <div className="space-y-8">
      {/* TIER A: Welcome & Current Status Hero */}
      <div className="glass-card p-6 md:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 relative overflow-hidden rounded-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Case {user?.caseId || 'MP-1042'} • {user?.victimType || 'Protected Witness'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Status: Active Monitoring</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Alex'} 🌿
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Your wellbeing companion throughout your case journey. All data is encrypted, pseudonymous, and used strictly to support your assigned counselor in coordinating care.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Assigned Support Counselor: <strong className="text-slate-200">Dr. Sarah Jenkins</strong> (District Legal Aid & Victim Support Cell)
              </span>
            </div>
          </div>

          {/* TIER E Quick Check-In CTA in Hero */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/checkins"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <Smile className="w-4 h-4" />
              <span>Record Check-In</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-teal-300 font-semibold rounded-xl text-sm border border-teal-500/30 transition-colors flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-teal-400" />
              <span>Voice Screener</span>
            </button>
            <Link
              to="/support"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Support Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TIER B: 6-Stage Case Journey */}
      <div className="space-y-4">
        <CaseJourneyTimeline
          currentStage={currentStage}
          caseId={user?.caseId || 'MP-1042'}
          victimType={user?.victimType || 'Protected Witness'}
          isReadOnly={true}
        />

        {/* Contextual Stage Explanation Card */}
        <div className="glass-card p-5 border border-slate-800 bg-slate-900/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-slate-100">About Stage: {activeStageInfo.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsStageExplanationOpen(!isStageExplanationOpen)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              {isStageExplanationOpen ? 'Hide Guide' : 'View Guide'}
            </button>
          </div>

          {isStageExplanationOpen && (
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div>
                <strong className="text-slate-200 block mb-1">Stage Description</strong>
                <p className="text-slate-400 leading-relaxed">{activeStageInfo.desc}</p>
              </div>
              <div>
                <strong className="text-slate-200 block mb-1">Support Focus During This Stage</strong>
                <p className="text-slate-400 leading-relaxed">{activeStageInfo.focus}</p>
              </div>
              <div>
                <strong className="text-slate-200 block mb-1">Upcoming Milestone</strong>
                <p className="text-slate-400 leading-relaxed">
                  Next: <span className="text-teal-300 font-semibold">{activeStageInfo.nextStage}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIER C: "How You're Doing" Wellbeing Summary */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Pattern Alert • Higher Stress Than Usual
                </span>
                <span className="text-[11px] text-slate-400">Non-Diagnostic Decision Support</span>
              </div>
              <h2 className="text-lg font-bold text-white">How You’re Doing This Week</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {comparison?.summaryText ||
                  'Your recent pattern indicates elevated court-related tension and lower sleep hours compared to your personal 14-day baseline. Grounding tools and counselor check-ins are readily available.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/wellness"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Explore Baseline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* TIER D: Recent Wellbeing Change vs. Personal Baseline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Recent Wellbeing vs. Your Usual Pattern</span>
          </h2>
          <Link to="/wellness" className="text-xs text-teal-400 hover:underline font-semibold">
            View All Dimensions →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stress Comparison */}
          <div className="glass-card p-4 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">General Stress</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {comparison?.stressStatus || 'Higher than usual'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-400">{recent.avgStress}</span>
              <span className="text-xs text-slate-500">vs. {baseline.avgStress} normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              +{(recent.avgStress - baseline.avgStress).toFixed(1)} delta during testimony week
            </p>
          </div>

          {/* Sleep Comparison */}
          <div className="glass-card p-4 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Sleep Last Night</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {comparison?.sleepStatus || '1.8h deficit'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-teal-400">{recent.avgSleep}h</span>
              <span className="text-xs text-slate-500">vs. {baseline.avgSleep}h normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Rest deficit observed over recent 3 days
            </p>
          </div>

          {/* Case-Related Tension */}
          <div className="glass-card p-4 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Case-Related Tension</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {comparison?.caseTensionStatus || 'Elevated'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-rose-400">{recent.avgCaseStress}</span>
              <span className="text-xs text-slate-500">vs. {baseline.avgCaseStress} normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Heightened sensitivity around upcoming hearing
            </p>
          </div>

          {/* Sense of Safety */}
          <div className="glass-card p-4 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Sense of Safety</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {comparison?.safetyStatus || 'Reduced'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-cyan-400">{recent.avgSafety}</span>
              <span className="text-xs text-slate-500">vs. {baseline.avgSafety || 7.4} normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Witness protection touchpoint available
            </p>
          </div>
        </div>
      </div>

      {/* TIER F: Recent Wellbeing History & Longitudinal Trend */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Wellbeing History & Longitudinal Trend</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing how your daily ratings compare with your 14-day baseline averages.
            </p>
          </div>
          <Link
            to="/checkins"
            className="text-xs text-teal-400 hover:underline font-semibold shrink-0"
          >
            Open Check-In Log →
          </Link>
        </div>

        <WellnessTrendChart data={trendData} baseline={baseline} />
      </div>

      {/* TIER G: Available Support & Status Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            <span>Available Support & Case Welfare Status</span>
          </h2>
          <span className="text-xs text-slate-400">All services are free and confidential</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Support Counselor */}
          <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">Assigned Support Counselor</h3>
                  <span className="text-[11px] text-emerald-400 font-semibold">Active Touchpoint Available</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                <strong>Dr. Sarah Jenkins</strong> is assigned to your case for confidential psychological support, hearing grounding, and pre-testimony preparation.
              </p>
            </div>
            <Link
              to="/support"
              className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold rounded-xl text-xs border border-emerald-500/30 transition-colors text-center block"
            >
              Request Counselor Follow-up
            </Link>
          </div>

          {/* 2. Free Legal Aid Support */}
          <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">NALSA / DLSA Free Legal Aid</h3>
                  <span className="text-[11px] text-indigo-300 font-semibold">Legal Counsel Assigned</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Representation under the SC/ST Prevention of Atrocities Act. Connect with your DLSA panel advocate for hearing prep and court procedures.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="w-full py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-semibold rounded-xl text-xs border border-indigo-500/30 transition-colors text-center block"
            >
              View Legal Aid Details
            </Link>
          </div>

          {/* 3. Witness Protection & Compensation */}
          <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100">Protection & Compensation</h3>
                  <span className="text-[11px] text-teal-400 font-semibold">Statutory Welfare Entitlements</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Witness protection protocols (safe waiting, escorted transit) and victim compensation claim processing under Ministry welfare guidelines.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="w-full py-2 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-semibold rounded-xl text-xs border border-teal-500/30 transition-colors text-center block"
            >
              Check Welfare Schemes
            </Link>
          </div>
        </div>

        {/* Crisis Emergency Banner */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Immediate 24/7 Support: <strong>Tele-MANAS (14416)</strong> • <strong>KIRAN Helpline (1800-599-0019)</strong> • <strong>Emergency (112)</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Toll-free • Multilingual • Government of India</span>
        </div>
      </div>

      {/* TIER H: What to Do Next (Gentle, Actionable Guidance) */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl">
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Recommended Next Steps For You Today</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <Link
            to="/checkins"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-colors group block"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                1. Submit Daily Check-In
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <p className="text-slate-400 leading-relaxed">
              Takes ~2 minutes to record mood, sleep hours, and perceived safety to keep your baseline current.
            </p>
          </Link>

          <Link
            to="/recommendations"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-colors group block"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                2. 3-Minute Grounding Routine
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <p className="text-slate-400 leading-relaxed">
              Try a box breathing or sensory grounding exercise to de-escalate acute hearing-related tension.
            </p>
          </Link>

          <Link
            to="/support"
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition-colors group block"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                3. Confidential Counselor Chat
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <p className="text-slate-400 leading-relaxed">
              Request a confidential touchpoint with Dr. Sarah Jenkins before your Friday court hearing.
            </p>
          </Link>
        </div>
      </div>

      {/* Voice Stress Screener Modal Prototype */}
      <VoiceStressModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        caseId={user?.caseId || 'MP-1042'}
        caseStage={currentStage}
      />
    </div>
  );
};

