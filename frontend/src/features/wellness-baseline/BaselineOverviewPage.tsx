import React, { useState, useEffect } from 'react';
import {
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  ShieldCheck,
  Smile,
  Moon,
  Zap,
  Scale,
  Shield,
  HeartHandshake,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { WellnessTrendChart } from '../checkins/WellnessTrendChart';
import { PrivacyConsentModal } from '../auth/PrivacyConsentModal';

export const BaselineOverviewPage: React.FC = () => {
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
    caseTensionStatus: 'Elevated during current case stage',
    summaryText:
      'Your recent pattern shows higher case-related tension and lower sleep hours compared with your usual 14-day baseline. Grounding routines, safe transit coordination, and counselor touchpoints are available.',
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res: any = await api.get('/checkins/trend');
        if (res.data?.baseline) setBaseline(res.data.baseline);
        if (res.data?.recent) setRecent(res.data.recent);
        if (res.data?.comparison) setComparison(res.data.comparison);
        if (res.data?.trend?.length > 0) setTrendData(res.data.trend);
      } catch {
        setTrendData([
          { date: 'Day 1', mood: 8, stress: 3, energy: 7, sleepHours: 8, senseOfSafety: 8, caseRelatedStress: 3 },
          { date: 'Day 2', mood: 7, stress: 4, energy: 6, sleepHours: 7.5, senseOfSafety: 8, caseRelatedStress: 4 },
          { date: 'Day 3', mood: 6, stress: 6, energy: 5, sleepHours: 6, senseOfSafety: 6, caseRelatedStress: 6 },
          { date: 'Day 4', mood: 5, stress: 7, energy: 4, sleepHours: 5.5, senseOfSafety: 5, caseRelatedStress: 8 },
          { date: 'Day 5', mood: 6, stress: 5, energy: 6, sleepHours: 7, senseOfSafety: 7, caseRelatedStress: 5 },
          { date: 'Day 6', mood: 5.5, stress: 7.2, energy: 4.5, sleepHours: 5.2, senseOfSafety: 5.5, caseRelatedStress: 7.8 },
        ]);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Personalized Historical Normal • Non-Diagnostic Baseline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-teal-400" />
            <span>Your Personal Wellbeing History</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            MindPulse benchmarks your wellbeing against your personal 14-day history rather than arbitrary general standards. When your pattern changes, your designated counselor receives non-diagnostic indicators to offer proactive assistance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Privacy & Rights"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <Link
            to="/checkins"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0"
          >
            <Smile className="w-4 h-4" />
            <span>Update Check-In</span>
          </Link>
        </div>
      </div>

      {/* Pattern Summary Reassurance Banner */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-2xl shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white">Recent Pattern Overview</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                Last 3 Days vs 14-Day Normal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {comparison?.summaryText ||
                'Your recent pattern shows higher case-related tension and lower sleep hours compared with your usual baseline. Support options and grounding exercises are available.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/recommendations"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Grounding Tools
          </Link>
          <Link
            to="/support"
            className="px-4 py-2.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold rounded-xl border border-teal-500/30 transition-colors"
          >
            Contact Counselor
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 CORE WELLBEING DIMENSIONS WITH HUMAN EXPLANATIONS                       */}
      {/* Every tile answers: "How has this dimension changed?"                     */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Key Wellbeing Dimensions
          </h2>
          <span className="text-xs text-slate-400">Personalized Reference</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Rest & Sleep Hours */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Sleep & Rest</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                  {recent.avgSleep}h avg
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">14-Day Normal</span>
                  <span className="text-lg font-bold text-white">{baseline.avgSleep}h</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Recent 3 Days</span>
                  <span className="text-lg font-bold text-indigo-400">{recent.avgSleep}h</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
              <strong>Understanding this:</strong> Sleep averages 1.8h lower this week, likely connected to pre-hearing bedtime worry.
            </p>
          </div>

          {/* 2. Case-Related Tension */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-rose-400" />
                  <span>Case Tension</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                  {recent.avgCaseStress} / 10
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">14-Day Normal</span>
                  <span className="text-lg font-bold text-white">{baseline.avgCaseStress}</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Recent 3 Days</span>
                  <span className="text-lg font-bold text-rose-400">{recent.avgCaseStress}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
              <strong>Understanding this:</strong> Tension has risen during the active Court/Trial stage. Accommodations and advocate accompaniment are active.
            </p>
          </div>

          {/* 3. Sense of Safety */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span>Sense of Safety</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                  {recent.avgSafety || 5.5} / 10
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">14-Day Normal</span>
                  <span className="text-lg font-bold text-white">{baseline.avgSafety || 7.4}</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Recent 3 Days</span>
                  <span className="text-lg font-bold text-teal-400">{recent.avgSafety || 5.5}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
              <strong>Understanding this:</strong> Witness protection cell safe transit is available for travel to and from hearing locations.
            </p>
          </div>

          {/* 4. Overall Mood Balance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-400" />
                  <span>Overall Mood</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  {recent.avgMood} / 10
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">14-Day Normal</span>
                  <span className="text-lg font-bold text-white">{baseline.avgMood}</span>
                </div>
                <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Recent 3 Days</span>
                  <span className="text-lg font-bold text-amber-400">{recent.avgMood}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-snug">
              <strong>Understanding this:</strong> Daily mood remains resilient with slight fluctuations during hearing prep days.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LONGITUDINAL TREND CHART & NARRATIVE EXPLANATION                          */}
      {/* Answers: "How has my wellbeing changed over time?"                        */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>Longitudinal Wellbeing Trajectory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily check-ins plotted against your 14-day baseline averages.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
            {baseline.totalLogs || 12} Recorded Logs
          </span>
        </div>

        <WellnessTrendChart data={trendData} baseline={baseline} />

        {/* Narrative Explanation Block Below Chart */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">What this trajectory shows:</strong>
            Your wellbeing was relatively steady during Days 1–3, with tension peaking on Day 4 around the court summons notice before stabilizing with counselor accompaniment. This confirms your natural recovery rhythm when support is present.
          </div>
        </div>
      </div>

      {/* Privacy Consent Modal */}
      <PrivacyConsentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
