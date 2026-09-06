import React, { useState, useEffect } from 'react';
import { Activity, Target, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const BaselineOverviewPage: React.FC = () => {
  const [baseline, setBaseline] = useState<any>({
    avgMood: 7.2,
    avgStress: 4.6,
    avgEnergy: 6.5,
    avgSleep: 7.4,
    totalLogs: 14,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res: any = await api.get('/checkins/trend');
        if (res.data?.baseline) setBaseline(res.data.baseline);
      } catch {}
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Activity className="w-7 h-7 text-teal-400" />
          Personal Wellness Baseline
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Your longitudinal statistical normal based on historical check-ins.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Baseline Mood Card */}
        <div className="glass-card p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Normal Mood</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{baseline.avgMood} <span className="text-sm text-slate-500">/ 10</span></div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Historical 14-day rolling mood average. Deviations below 5.0 flag mild review signals.
          </p>
        </div>

        {/* Baseline Stress Card */}
        <div className="glass-card p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Normal Stress</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{baseline.avgStress} <span className="text-sm text-slate-500">/ 10</span></div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Typical stress baseline. Spikes exceeding +2.5 standard deviations prompt grounding recommendations.
          </p>
        </div>

        {/* Baseline Sleep Card */}
        <div className="glass-card p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Normal Sleep</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{baseline.avgSleep}h <span className="text-sm text-slate-500">/ night</span></div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Target sleep baseline. Deficits under 6.0 hours heavily weight early distress forecasting.
          </p>
        </div>

        {/* Baseline Energy Card */}
        <div className="glass-card p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Normal Energy</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{baseline.avgEnergy} <span className="text-sm text-slate-500">/ 10</span></div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Subjective daily stamina average.
          </p>
        </div>
      </div>

      {/* Baseline calculation explanation */}
      <div className="glass-card p-6 border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          How Personal Baselines Work
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Rather than measuring you against an arbitrary population standard, MindPulse calculates your personal physiological and psychological normal over a 14-day rolling window. 
          When your current telemetry significantly deviates from your personal norm, the ML engine identifies potential distress signals before an acute crisis occurs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">1. Rolling Time Window</strong>
            Updates daily with each new check-in log, adapting naturally to term breaks and academic cycles.
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">2. Anomaly Deviation</strong>
            Detects multi-variable shifts (e.g. concurrent drop in sleep and surge in stress).
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <strong className="text-slate-200 block mb-1">3. Privacy Preservation</strong>
            Your personal baseline never leaves your institutional boundary and is never used to rank you.
          </div>
        </div>
      </div>
    </div>
  );
};
