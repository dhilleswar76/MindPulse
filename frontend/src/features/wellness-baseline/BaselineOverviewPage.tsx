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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const BaselineOverviewPage: React.FC = () => {
  const [baseline, setBaseline] = useState<any>({
    avgMood: 6.8,
    avgStress: 5.0,
    avgEnergy: 5.8,
    avgSleep: 7.0,
    avgSafety: 7.4,
    avgCaseStress: 4.8,
    totalLogs: 10,
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
      'Your recent pattern shows higher case-related tension and lower sleep hours compared with your usual baseline. Support options and grounding exercises are available.',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res: any = await api.get('/checkins/trend');
        if (res.data?.baseline) setBaseline(res.data.baseline);
        if (res.data?.recent) setRecent(res.data.recent);
        if (res.data?.comparison) setComparison(res.data.comparison);
      } catch {
        // Uses initial synthetic defaults
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Personalized Historical Normal • Non-Diagnostic Baseline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-teal-400" />
            Personal Wellness Baseline
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            MindPulse benchmarks your wellbeing against your personal 14-day history rather than arbitrary general standards. When your pattern changes, designated counselors receive early decision-support indicators to offer proactive assistance.
          </p>
        </div>

        <Link
          to="/checkins"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all shrink-0"
        >
          <Smile className="w-4 h-4" />
          <span>Update Check-In</span>
        </Link>
      </div>

      {/* Pattern Summary Reassurance Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Recent Pattern Comparison (Last 3 Days vs 14-Day Normal)</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {comparison?.summaryText ||
                'Your recent pattern shows higher case-related tension and lower sleep hours compared with your usual baseline. Support options and grounding exercises are available.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/recommendations"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Grounding Tools
          </Link>
          <Link
            to="/support"
            className="px-3.5 py-1.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold rounded-xl border border-teal-500/30 transition-colors"
          >
            Contact Counselor
          </Link>
        </div>
      </div>

      {/* Section 1: Side-by-Side Dimension Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. General Stress */}
        <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">General Stress</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20">
                {comparison?.stressStatus || 'Higher than your usual pattern'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">14-Day Normal</span>
                <span className="text-xl font-extrabold text-white">{baseline.avgStress}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recent 3 Days</span>
                <span className="text-xl font-extrabold text-amber-400">{recent.avgStress}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Recent increase of +{(recent.avgStress - baseline.avgStress).toFixed(1)} over baseline during active court hearing week.
          </p>
        </div>

        {/* 2. Sleep Hours */}
        <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Sleep & Rest</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-teal-500/10 text-teal-300 border-teal-500/20">
                {comparison?.sleepStatus || '1.8h below average'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">14-Day Normal</span>
                <span className="text-xl font-extrabold text-white">{baseline.avgSleep}h</span>
                <span className="text-[10px] text-slate-500 block">per night</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recent 3 Days</span>
                <span className="text-xl font-extrabold text-teal-400">{recent.avgSleep}h</span>
                <span className="text-[10px] text-slate-500 block">per night</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Sleep is lower than usual. Restorative evening breathing routines can help stabilize sleep cycles.
          </p>
        </div>

        {/* 3. Case / Hearing-Related Tension */}
        <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Case / Hearing Tension</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-500/10 text-rose-300 border-rose-500/20">
                {comparison?.caseTensionStatus || 'Elevated in trial stage'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">14-Day Normal</span>
                <span className="text-xl font-extrabold text-white">{baseline.avgCaseStress}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recent 3 Days</span>
                <span className="text-xl font-extrabold text-rose-400">{recent.avgCaseStress}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Tension spikes correspond with upcoming testimony hearings. Legal aid support is actively assigned.
          </p>
        </div>

        {/* 4. Perceived Sense of Safety */}
        <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Sense of Safety</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-cyan-500/10 text-cyan-300 border-cyan-500/20">
                {comparison?.safetyStatus || 'Reduced compared with usual'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">14-Day Normal</span>
                <span className="text-xl font-extrabold text-white">{baseline.avgSafety || 7.4}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recent 3 Days</span>
                <span className="text-xl font-extrabold text-cyan-400">{recent.avgSafety}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Witness protection protocols and secure transit measures can be requested at any time.
          </p>
        </div>

        {/* 5. General Mood */}
        <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Smile className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">General Mood</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                Slightly lower than usual
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">14-Day Normal</span>
                <span className="text-xl font-extrabold text-white">{baseline.avgMood}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recent 3 Days</span>
                <span className="text-xl font-extrabold text-emerald-400">{recent.avgMood}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Mood naturally fluctuates with case milestones. Re-stabilization occurs as legal stages conclude.
          </p>
        </div>

        {/* 6. Energy & Stamina */}
        <div className="glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Energy & Stamina</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                Moderately reduced
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">14-Day Normal</span>
                <span className="text-xl font-extrabold text-white">{baseline.avgEnergy}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recent 3 Days</span>
                <span className="text-xl font-extrabold text-indigo-400">{recent.avgEnergy}</span>
                <span className="text-[10px] text-slate-500 block">/ 10</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            Stamina drops typically correlate with sleep reduction. Pacing daily activities is recommended.
          </p>
        </div>
      </div>

      {/* Section 2: Educational Explanation of How Baselines Work */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl">
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>How Your Personal Baseline Works (Non-Diagnostic)</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Traditional questionnaires compare everyone to a fixed population average, which can overlook the unique impact of navigating an atrocity trial or legal investigation. MindPulse builds an individualized profile from your own entries:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <strong className="text-teal-300 font-semibold block mb-1">1. 14-Day Rolling Window</strong>
            <p className="text-slate-400 leading-relaxed">
              Updates dynamically with each check-in, ensuring your baseline reflects your true personal normal rather than a rigid label.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <strong className="text-teal-300 font-semibold block mb-1">2. Early Warning Indicators</strong>
            <p className="text-slate-400 leading-relaxed">
              Detects multi-variable shifts—such as sleep dropping while court tension rises—so your counselor can provide timely outreach.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <strong className="text-teal-300 font-semibold block mb-1">3. Non-Diagnostic Decision Support</strong>
            <p className="text-slate-400 leading-relaxed">
              Baselines never label or diagnose you. They serve purely as decision-support indicators for human counselors under Ministry welfare guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
