import React, { useState, useEffect } from 'react';
import {
  Smile,
  Activity,
  HeartHandshake,
  Bot,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Scale,
  Mic,
  Clock,
  CheckCircle2,
  PhoneCall,
  Info,
  ChevronRight,
  Shield,
  Moon,
  PenTool,
  Lock,
  Wind,
  Compass,
  ArrowUpRight,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { CaseJourneyTimeline } from '../../components/CaseJourneyTimeline';
import { VoiceStressModal } from '../voice/VoiceStressModal';
import { WellnessTrendChart } from '../checkins/WellnessTrendChart';
import { PrivacyConsentModal } from '../auth/PrivacyConsentModal';
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
    totalLogs: 12,
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
      'Your recent check-ins suggest you may be experiencing more case-related tension and lower sleep hours than usual. Calm grounding exercises and counselor support are ready whenever you need them.',
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isStageGuideOpen, setIsStageGuideOpen] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const currentStage: CaseStage = user?.caseStage || 'COURT_TRIAL';

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const trendRes: any = await api.get('/checkins/trend');
        if (trendRes.data?.baseline) setBaseline(trendRes.data.baseline);
        if (trendRes.data?.recent) setRecent(trendRes.data.recent);
        if (trendRes.data?.comparison) setComparison(trendRes.data.comparison);
        if (trendRes.data?.trend?.length > 0) {
          setTrendData(trendRes.data.trend);
          // Check if last log was today
          const lastDate = trendRes.data.trend[trendRes.data.trend.length - 1]?.date;
          if (lastDate && (lastDate === 'Today' || lastDate.includes('Day 6'))) {
            setHasCheckedInToday(false);
          }
        }
      } catch {
        // Safe synthetic fallback
        setTrendData([
          { date: 'Mon', mood: 7.5, stress: 4, energy: 7, sleepHours: 7.5, senseOfSafety: 8, caseRelatedStress: 4 },
          { date: 'Tue', mood: 7.0, stress: 4.5, energy: 6.5, sleepHours: 7.0, senseOfSafety: 8, caseRelatedStress: 4 },
          { date: 'Wed', mood: 6.2, stress: 6.0, energy: 5.5, sleepHours: 6.2, senseOfSafety: 6.5, caseRelatedStress: 6 },
          { date: 'Thu', mood: 5.4, stress: 7.2, energy: 4.5, sleepHours: 5.4, senseOfSafety: 5.2, caseRelatedStress: 7.5 },
          { date: 'Fri', mood: 5.8, stress: 6.8, energy: 5.0, sleepHours: 5.8, senseOfSafety: 6.0, caseRelatedStress: 7.0 },
          { date: 'Sat', mood: 6.5, stress: 5.5, energy: 6.0, sleepHours: 6.8, senseOfSafety: 7.0, caseRelatedStress: 5.5 },
        ]);
      }
    };
    loadOverview();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStageInfo = (stage: CaseStage) => {
    switch (stage) {
      case 'CASE_REGISTRATION':
        return {
          title: 'Case Registration',
          desc: 'Formal recording of your statement under official witness protection guidelines.',
          focus: 'Legal intake clarity, designated support cell introduction, and safety planning.',
          nextStage: 'Investigation',
        };
      case 'INVESTIGATION':
        return {
          title: 'Investigation',
          desc: 'Evidence gathering and confidential witness interviews conducted with protective oversight.',
          focus: 'Support during statements, safe transit assistance, and emotional grounding.',
          nextStage: 'Court / Trial',
        };
      case 'COURT_TRIAL':
        return {
          title: 'Court / Trial (Active Milestone)',
          desc: 'Special Court proceedings, hearing depositions, and testimony coordination.',
          focus: 'Pre-trial preparation, safe waiting room arrangements, and free DLSA legal representation.',
          nextStage: 'Compensation & Relief',
        };
      case 'COMPENSATION':
        return {
          title: 'Compensation & Relief',
          desc: 'Processing statutory interim financial grants and medical relief under Section 357A CrPC.',
          focus: 'Application tracking, rehabilitation funds, and financial counseling.',
          nextStage: 'Rehabilitation',
        };
      case 'REHABILITATION':
        return {
          title: 'Rehabilitation',
          desc: 'Community support, vocational programs, and long-term wellness restoration.',
          focus: 'Social welfare integration, psychological care, and educational aid.',
          nextStage: 'Protection & Sustained Support',
        };
      case 'PROTECTION_SUPPORT':
      default:
        return {
          title: 'Protection & Sustained Support',
          desc: 'Ongoing post-case security audits and sustained wellbeing touchpoints.',
          focus: 'Periodic check-ins and permanent safety reassurance.',
          nextStage: 'Sustained Peace & Safety',
        };
    }
  };

  const stageInfo = getStageInfo(currentStage);
  const firstName = user?.fullName?.split(' ')[0] || 'Alex';

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP GREETING & PRIVACY ANCHOR                                          */}
      {/* Answers: "Is my information private?" & "What should I do today?"         */}
      {/* ========================================================================= */}
      <section className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            {/* Context badging: Privacy first, non-alarmist */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected Witness Space • Encrypted</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Stage: {stageInfo.title.split('(')[0].trim()}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors ml-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Privacy Rights</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Take a gentle moment for yourself today. This is your safe space to reflect, track how you are resting, and reach supportive care whenever you are ready.
            </p>

            {/* Assigned Counselor Touchpoint */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  Designated Counselor: <strong className="text-white">Dr. Sarah Jenkins</strong>
                </span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400">District Legal Aid & Witness Welfare Cell</span>
            </div>
          </div>

          {/* Quick Header CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/checkins"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all hover:scale-[1.02]"
            >
              <Smile className="w-4 h-4" />
              <span>Record Daily Check-In</span>
            </Link>
            <Link
              to="/support"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-2xl border border-slate-700/80 transition-colors"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Support Chat</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROMINENT CHECK-IN HERO CARD                                           */}
      {/* Answers: "What should I do today?"                                        */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Daily Wellbeing Check-In</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              How are you feeling right now?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Checking in takes less than a minute. Sharing how you are resting and managing tension helps your counselor understand how to support you best throughout your case journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              to="/checkins"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold rounded-2xl shadow-md transition-all text-center"
            >
              <span>Check In (Under 60s)</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                alert('Take all the time you need. Your space will be here whenever you wish to return.');
              }}
              className="px-4 py-3.5 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
            >
              Not ready? Come back later
            </button>
          </div>
        </div>

        {/* 3 Secondary Reflection Options */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <Link
            to="/journal"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 text-slate-300 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-white group-hover:text-teal-300">
                Write in Journal
              </span>
              <span className="text-[11px] text-slate-400">Private, unshared reflection</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 text-slate-300 hover:text-white transition-all group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-white group-hover:text-teal-300">
                5-Second Voice Check
              </span>
              <span className="text-[11px] text-slate-400">Screen speech rhythm gently</span>
            </div>
          </button>

          <Link
            to="/recommendations"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 text-slate-300 hover:text-white transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-white group-hover:text-teal-300">
                4-7-8 Breathing
              </span>
              <span className="text-[11px] text-slate-400">2-minute somatic grounding</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CASE JOURNEY CONTEXT (READ-ONLY)                                       */}
      {/* Answers: "Where does my case stand?"                                      */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              My Case Journey
            </h2>
          </div>
          <span className="text-xs text-slate-400">Official Case Record • Read Only</span>
        </div>

        <CaseJourneyTimeline
          currentStage={currentStage}
          caseId={user?.caseId || 'MP-1042'}
          victimType={user?.victimType || 'Protected Witness'}
          isReadOnly={true}
        />

        {/* Calm Stage Guide */}
        <div className="bg-slate-900/70 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              <span>What this stage means for you: {stageInfo.title}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsStageGuideOpen(!isStageGuideOpen)}
              className="text-[11px] text-teal-400 hover:underline font-medium"
            >
              {isStageGuideOpen ? 'Hide details' : 'Learn more'}
            </button>
          </div>

          {isStageGuideOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 mt-3 border-t border-slate-800 text-xs leading-relaxed">
              <div>
                <span className="text-slate-400 block font-medium mb-1">Stage Description</span>
                <p className="text-slate-300">{stageInfo.desc}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Support Available</span>
                <p className="text-slate-300">{stageInfo.focus}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium mb-1">Next Milestone</span>
                <p className="text-teal-300 font-semibold">{stageInfo.nextStage}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WELLBEING SNAPSHOT                                                     */}
      {/* Answers: "How am I doing?"                                                */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Your Wellbeing Snapshot
            </h2>
          </div>
          <Link
            to="/wellness"
            className="text-xs text-teal-400 hover:underline font-medium flex items-center gap-1"
          >
            <span>Full History & Baseline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Human-Readable Reassurance Banner */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                  Pattern Observed
                </span>
                <span className="text-xs text-slate-400">Non-Diagnostic Insight</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {comparison?.summaryText ||
                  'Your recent entries suggest slightly higher case-related tension and lower sleep hours than your usual baseline. Grounding tools and counselor check-ins are available.'}
              </p>
            </div>
          </div>

          <Link
            to="/support"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors shrink-0"
          >
            Talk With Support
          </Link>
        </div>

        {/* 4 Comparative Indicator Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Sleep */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rest & Sleep</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                {recent.avgSleep}h recent
              </span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {recent.avgSleep}h <span className="text-xs font-normal text-slate-400">per night</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Compared with your {baseline.avgSleep}h usual baseline normal.
            </p>
          </div>

          {/* Tile 2: Case Tension */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-rose-400" />
                <span>Case Tension</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                {comparison?.caseTensionStatus || 'Elevated'}
              </span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {recent.avgCaseStress} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Tension often rises around hearing and testimony dates.
            </p>
          </div>

          {/* Tile 3: Sense of Safety */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Sense of Safety</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/20">
                Active Protocol
              </span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {recent.avgSafety || 5.5} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Protected escort assistance available upon request.
            </p>
          </div>

          {/* Tile 4: Check-in Consistency */}
          <div className="bg-slate-900/80 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Check-in Logs</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                Updated
              </span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {baseline.totalLogs || 12} <span className="text-xs font-normal text-slate-400">entries</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Builds your personalized 14-day historical baseline.
            </p>
          </div>
        </div>

        {/* Longitudinal Rhythm Trend Visualizer */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span>Your Wellbeing Rhythm Over Time</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualizing how your daily ratings align with your personal 14-day statistical normal.
              </p>
            </div>
            <Link
              to="/wellness"
              className="text-xs text-teal-400 hover:underline font-semibold shrink-0"
            >
              Detailed Breakdown →
            </Link>
          </div>

          <WellnessTrendChart data={trendData} baseline={baseline} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. 3-TIER SUPPORT HIERARCHY                                              */}
      {/* Answers: "Can I talk to someone?" & "Where can I get help?"               */}
      {/* Hierarchy: Everyday Support -> Professional Support -> Urgent Helplines   */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Support & Assistance When You Need It
            </h2>
          </div>
          <span className="text-xs text-slate-400">Free, confidential & voluntary</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Professional Counselor Support */}
          <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Professional Support
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Assigned Counselor: Dr. Sarah Jenkins
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Available to discuss pre-trial worries, grounding techniques, or coordinate witness safe transit for upcoming hearings.
              </p>
            </div>

            <Link
              to="/support"
              className="w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold rounded-xl text-xs border border-emerald-500/30 transition-colors text-center block"
            >
              Request Follow-Up Touchpoint
            </Link>
          </div>

          {/* Card 2: Legal Aid & Entitlements */}
          <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Legal & Welfare
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                NALSA Free Legal Aid & Relief
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with your District Legal Services advocate and explore interim compensation under Section 357A CrPC.
              </p>
            </div>

            <Link
              to="/compensation"
              className="w-full py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-semibold rounded-xl text-xs border border-indigo-500/30 transition-colors text-center block"
            >
              Calculate & Apply for Compensation
            </Link>
          </div>

          {/* Card 3: Everyday Grounding Companion */}
          <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Everyday Companion
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Trauma-Informed Support Companion
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Non-clinical 24/7 conversational guide for calming 4-7-8 breathing exercises and orientation across legal stages.
              </p>
            </div>

            <Link
              to="/support"
              className="w-full py-2.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 font-semibold rounded-xl text-xs border border-teal-500/30 transition-colors text-center block"
            >
              Start Private Conversation
            </Link>
          </div>
        </div>

        {/* Level 3: Urgent & Toll-Free 24/7 Helplines Banner */}
        <div className="p-4 sm:p-5 bg-slate-900/95 rounded-2xl border border-slate-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Urgent & Immediate Support Contacts (24/7 Free & Confidential)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                If you feel in acute danger or distress, confidential human advocates are standing by.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
            <a
              href="tel:14416"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3 h-3 text-teal-400" />
              <span>Tele-MANAS: <strong>14416</strong></span>
            </a>
            <a
              href="tel:18005990019"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>KIRAN: <strong>1800-599-0019</strong></span>
            </a>
            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5 font-bold"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Emergency: <strong>112</strong></span>
            </a>
          </div>
        </div>
      </section>

      {/* Voice Stress Screener Modal Prototype */}
      <VoiceStressModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        caseId={user?.caseId || 'MP-1042'}
        caseStage={currentStage}
      />

      {/* Privacy & Rights Consent Modal */}
      <PrivacyConsentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
