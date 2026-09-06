import React, { useState, useEffect } from 'react';
import { Smile, Activity, AlertTriangle, BookOpen, Bot, Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [risk, setRisk] = useState<any>(null);
  const [baseline, setBaseline] = useState<any>(null);
  const [recentCheckin, setRecentCheckin] = useState<any>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [riskRes, trendRes]: any = await Promise.all([
          api.get('/risk/current'),
          api.get('/checkins/trend'),
        ]);
        setRisk(riskRes.data?.risk);
        setBaseline(trendRes.data?.baseline);
        if (trendRes.data?.trend?.length > 0) {
          setRecentCheckin(trendRes.data.trend[trendRes.data.trend.length - 1]);
        }
      } catch {
        setRisk({
          riskScore: 0.42,
          riskLevel: 'WATCH',
          factors: [
            { feature: 'Sleep Reduction', impact: 0.18, description: 'Average sleep is 5.5h (1.5h below target normal)' },
            { feature: 'Elevated Stress', impact: 0.14, description: 'Subjective stress score 7/10' },
          ],
        });
        setBaseline({ avgMood: 6.8, avgStress: 5.2, avgEnergy: 6.0, avgSleep: 7.0 });
      }
    };
    loadOverview();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'STABLE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'WATCH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'ELEVATED':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'REQUIRES_REVIEW':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="glass-card p-6 md:p-8 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confidential & Private Wellness Telemetry</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Good day, {user?.fullName?.split(' ')[0] || 'Alex'} 🌿
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Your personal wellness baseline is updated. Take a minute to complete today’s 60-second check-in or explore calming grounding routines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/checkins"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <Smile className="w-4 h-4" />
              <span>Daily Check-In</span>
            </Link>
            <Link
              to="/support"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>AI Companion</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Overview Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Distress Signal Card */}
        <Link to="/risk" className="glass-card p-6 border border-slate-800 glass-card-hover group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {risk && (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getRiskColor(risk.riskLevel)}`}>
                {risk.riskLevel}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Distress Signal Status</h2>
          <p className="text-xs text-slate-400 mb-4">Explainable AI feature attribution and signal indicators.</p>
          <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform gap-1">
            <span>View contributing signals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* 7-Day Forecast Card */}
        <Link to="/forecast" className="glass-card p-6 border border-slate-800 glass-card-hover group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider">
              7-Day Projection
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Early Distress Forecast</h2>
          <p className="text-xs text-slate-400 mb-4">Time-series trajectory based on rolling sleep and stress deltas.</p>
          <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform gap-1">
            <span>Explore forecast curve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Journal Reflection Card */}
        <Link to="/journal" className="glass-card p-6 border border-slate-800 glass-card-hover group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-teal-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 uppercase tracking-wider">
              NLP Analysis
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Journal & Reflection Log</h2>
          <p className="text-xs text-slate-400 mb-4">Private thoughts with emotion & linguistic stress extraction.</p>
          <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform gap-1">
            <span>Open reflection journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Personal Baseline Snapshot & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Personal Wellness Normal (14-Day Baseline)
            </h2>
            <Link to="/wellness" className="text-xs text-teal-400 hover:underline font-semibold">
              Full Baseline
            </Link>
          </div>

          {baseline && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Normal Mood</span>
                <span className="text-2xl font-extrabold text-emerald-400">{baseline.avgMood}</span>
                <span className="text-xs text-slate-500 block mt-1">out of 10</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Normal Stress</span>
                <span className="text-2xl font-extrabold text-amber-400">{baseline.avgStress}</span>
                <span className="text-xs text-slate-500 block mt-1">out of 10</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Normal Sleep</span>
                <span className="text-2xl font-extrabold text-teal-400">{baseline.avgSleep}h</span>
                <span className="text-xs text-slate-500 block mt-1">nightly target</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Normal Energy</span>
                <span className="text-2xl font-extrabold text-indigo-400">{baseline.avgEnergy}</span>
                <span className="text-xs text-slate-500 block mt-1">out of 10</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Grounding & Support Resources */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Featured Support Exercises
              </h2>
              <Link to="/recommendations" className="text-xs text-teal-400 hover:underline font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">4-7-8 Deep Breathing</span>
                  <span className="text-[11px] text-slate-400">4-minute calming parasympathetic reset</span>
                </div>
                <Link to="/recommendations" className="px-3 py-1 bg-teal-500/15 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-semibold">
                  Start
                </Link>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">Non-Sleep Deep Rest (NSDR)</span>
                  <span className="text-[11px] text-slate-400">10-minute relaxation to counter sleep deficit</span>
                </div>
                <Link to="/recommendations" className="px-3 py-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold">
                  Start
                </Link>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">Campus Peer Support Drop-in</span>
                  <span className="text-[11px] text-slate-400">Student Union, Mon-Fri 2-5 PM</span>
                </div>
                <Link to="/recommendations" className="px-3 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold">
                  Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
