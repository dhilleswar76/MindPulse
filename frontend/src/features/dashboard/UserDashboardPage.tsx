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
  PenTool,
  Lock,
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
          desc: 'Initial intake and First Information Report (FIR) formalization under the SC/ST Prevention of Atrocities framework.',
          focus: 'Intake confirmation, legal counsel orientation, and initial safety assessment.',
          nextStage: 'Investigation',
        };
      case 'INVESTIGATION':
        return {
          title: 'Investigation',
          desc: 'Collection of statements, forensic documentation, and witness evidence gathering by investigating authorities.',
          focus: 'Statement support, witness security planning, and psychological grounding.',
          nextStage: 'Court / Trial',
        };
      case 'COURT_TRIAL':
        return {
          title: 'Court / Trial (Active Stage)',
          desc: 'Special Court trial proceedings, hearing dates, and witness testimony deposition.',
          focus: 'Pre-trial testimony preparation, stress stabilization, safe transit coordination, and DLSA legal aid representation.',
          nextStage: 'Compensation & Relief',
        };
      case 'COMPENSATION':
        return {
          title: 'Compensation & Relief',
          desc: 'Processing of statutory financial assistance and interim victim compensation under Ministry schemes.',
          focus: 'Claim documentation, disbursement tracking, and financial counseling.',
          nextStage: 'Rehabilitation',
        };
      case 'REHABILITATION':
        return {
          title: 'Rehabilitation',
          desc: 'Longitudinal social, educational, and vocational rehabilitation support.',
          focus: 'Skill development, livelihood restoration, and community integration.',
          nextStage: 'Protection & Support',
        };
      case 'PROTECTION_SUPPORT':
      default:
        return {
          title: 'Protection & Support',
          desc: 'Ongoing post-trial safety audits and sustained community welfare monitoring.',
          focus: 'Periodic safety check-ins and long-term protection review.',
          nextStage: 'Case Closure / Sustained Safety',
        };
    }
  };

  const activeStageInfo = getStageDetails(currentStage);
  const firstName = user?.fullName?.split(' ')[0] || 'Alex';

  return (
    <div className="space-y-8 pb-8">
      {/* 1. Welcoming Personal Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 p-6 md:p-7 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Case {user?.caseId || 'MP-1042'} • {user?.victimType || 'Protected Witness'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Active Stage: Court / Trial</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Hello, {firstName}. Here is where things stand.
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Your confidential, trauma-informed wellbeing companion. All data is protected and used strictly to help your assigned counselor coordinate supportive care.
            </p>

            <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-400">
              <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0" />
              <span>
                Assigned Counselor: <strong className="text-slate-200">Dr. Sarah Jenkins</strong> (District Legal Aid & Victim Support Cell)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/checkins"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shadow transition-all flex items-center gap-2"
            >
              <Smile className="w-4 h-4" />
              <span>Today's Check-In</span>
            </Link>
            <Link
              to="/support"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Support Companion</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. My Journey — Case Stage Context (Read-Only) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-400" />
            <span>My Case Journey</span>
          </h2>
          <span className="text-xs text-slate-400">Official Case Record • Read Only</span>
        </div>

        <CaseJourneyTimeline
          currentStage={currentStage}
          caseId={user?.caseId || 'MP-1042'}
          victimType={user?.victimType || 'Protected Witness'}
          isReadOnly={true}
        />

        {/* Stage Guidance Note */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl text-xs text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>About Your Active Stage: {activeStageInfo.title}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsStageExplanationOpen(!isStageExplanationOpen)}
              className="text-[11px] text-teal-400 hover:underline"
            >
              {isStageExplanationOpen ? 'Hide stage guide' : 'Show stage guide'}
            </button>
          </div>

          {isStageExplanationOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Stage Summary:</span>
                <p className="text-slate-300 leading-relaxed">{activeStageInfo.desc}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Support Focus:</span>
                <p className="text-slate-300 leading-relaxed">{activeStageInfo.focus}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Upcoming Milestone:</span>
                <p className="text-teal-300 font-semibold">{activeStageInfo.nextStage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Ways to Check In With Yourself Today */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Smile className="w-4 h-4 text-teal-400" />
            <span>How Would You Like to Check In Today?</span>
          </h2>
          <span className="text-xs text-slate-400">Takes 1–2 minutes • Builds your baseline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Option 1: Quick Sliders */}
          <Link
            to="/checkins"
            className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-5 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Smile className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-teal-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Start →
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Quick Wellbeing Sliders</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Record mood, sleep hours, case-related tension, and perceived safety with a few simple sliders.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Updates your 14-day normal
            </div>
          </Link>

          {/* Option 2: Expressive Journal */}
          <Link
            to="/journal"
            className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Write →
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Reflection Journal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Write private thoughts to de-escalate bedtime worry. Safe, encrypted, and personal.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Private & trauma-informed
            </div>
          </Link>

          {/* Option 3: Voice Check-In */}
          <div
            onClick={() => setIsVoiceModalOpen(true)}
            className="bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 p-5 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-teal-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  Record →
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">5-Second Voice Check-In</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Speak for 5 seconds to screen acoustic speech rhythm and vocal tremor without typing.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              Prototype acoustic screening
            </div>
          </div>
        </div>
      </div>

      {/* 4. How You've Been Feeling (Personal Baseline Comparison Story) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>How You've Been Feeling: Recent Pattern vs. Your Usual Normal</span>
          </h2>
          <Link to="/wellness" className="text-xs text-teal-400 hover:underline">
            Explore All Dimensions →
          </Link>
        </div>

        {/* Narrative Reassurance Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Pattern Change Observed
                </span>
                <span className="text-[11px] text-slate-400">Non-Diagnostic Decision Support</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {comparison?.summaryText ||
                  'Your recent entries show higher court-related tension and lower sleep hours compared with your usual 14-day baseline normal. Support options and grounding routines are readily available.'}
              </p>
            </div>
          </div>

          <Link
            to="/support"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors shrink-0"
          >
            Talk With Support
          </Link>
        </div>

        {/* 4 Comparative Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stress */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">General Stress</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {comparison?.stressStatus || 'Higher'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">{recent.avgStress}</span>
              <span className="text-xs text-slate-500">vs {baseline.avgStress} normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              +{(recent.avgStress - baseline.avgStress).toFixed(1)} delta during trial week
            </p>
          </div>

          {/* Sleep */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Sleep Last Night</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {comparison?.sleepStatus || '1.8h deficit'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-teal-400">{recent.avgSleep}h</span>
              <span className="text-xs text-slate-500">vs {baseline.avgSleep}h normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Rest deficit over recent 3 days
            </p>
          </div>

          {/* Case Stress */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Case-Related Tension</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {comparison?.caseTensionStatus || 'Elevated'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-400">{recent.avgCaseStress}</span>
              <span className="text-xs text-slate-500">vs {baseline.avgCaseStress} normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Coincides with upcoming deposition
            </p>
          </div>

          {/* Safety */}
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Sense of Safety</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {comparison?.safetyStatus || 'Reduced'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-cyan-400">{recent.avgSafety}</span>
              <span className="text-xs text-slate-500">vs {baseline.avgSafety || 7.4} normal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Witness protection assistance active
            </p>
          </div>
        </div>
      </div>

      {/* 5. Longitudinal Trend Visualization */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Your Wellbeing Rhythm Over Time</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your daily check-in responses with your personalized 14-day baseline averages.
            </p>
          </div>
          <Link
            to="/checkins"
            className="text-xs text-teal-400 hover:underline font-semibold shrink-0"
          >
            Open Check-In History →
          </Link>
        </div>

        <WellnessTrendChart data={trendData} baseline={baseline} />
      </div>

      {/* 6. Available Support & Follow-Up */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            <span>Available Support & Assistance</span>
          </h2>
          <span className="text-xs text-slate-400">Free & confidential</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Counselor card */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Assigned Support Counselor</h3>
                  <span className="text-[11px] text-emerald-400 font-medium">Dr. Sarah Jenkins</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Assigned to your case for confidential pre-hearing preparation, grounding, and psychological support.
              </p>
            </div>
            <Link
              to="/support"
              className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold rounded-xl text-xs border border-emerald-500/30 transition-colors text-center block"
            >
              Request Follow-Up
            </Link>
          </div>

          {/* Legal Aid */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">NALSA / DLSA Free Legal Aid</h3>
                  <span className="text-[11px] text-indigo-300 font-medium">Legal Counsel Assigned</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Representation under the SC/ST Prevention of Atrocities Act. Connect with your legal advocate for trial prep.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="w-full py-2 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-semibold rounded-xl text-xs border border-indigo-500/30 transition-colors text-center block"
            >
              View Legal Aid Details
            </Link>
          </div>

          {/* Welfare Schemes */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Protection & Compensation</h3>
                  <span className="text-[11px] text-teal-400 font-medium">Statutory Entitlements</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Witness protection measures (escorted transit, safe waiting) and interim victim compensation under Section 357A CrPC.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="w-full py-2 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-semibold rounded-xl text-xs border border-teal-500/30 transition-colors text-center block"
            >
              Explore Welfare Schemes
            </Link>
          </div>
        </div>

        {/* 24/7 Helplines Footer Banner */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              24/7 Free Helplines: <strong>Tele-MANAS (14416)</strong> • <strong>KIRAN (1800-599-0019)</strong> • <strong>Emergency (112)</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Government of India • Toll-Free & Confidential</span>
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

