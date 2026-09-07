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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { CaseJourneyTimeline } from '../../components/CaseJourneyTimeline';
import { VoiceStressModal } from '../voice/VoiceStressModal';
import { CaseStage } from '../../types';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [risk, setRisk] = useState<any>(null);
  const [baseline, setBaseline] = useState<any>(null);
  const [recentCheckin, setRecentCheckin] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<CaseStage>(user?.caseStage || 'COURT_TRIAL');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

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
          riskScore: 0.72,
          riskLevel: 'ELEVATED',
          factors: [
            { feature: 'Sleep Deficit', impact: 0.28, description: 'Average sleep is 4.5h during active court hearing week' },
            { feature: 'Court Stage Stress', impact: 0.24, description: 'Case-related stress score 8.5/10' },
            { feature: 'Safety Concern Signal', impact: 0.20, description: 'Reported sense of safety delta (-3.0 from baseline)' },
          ],
        });
        setBaseline({ avgMood: 6.8, avgStress: 5.2, avgEnergy: 6.0, avgSleep: 7.0, avgSafety: 7.5 });
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
      <div className="glass-card p-6 md:p-8 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 relative overflow-hidden rounded-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confidential • SIH26094 Decision-Support System • Ministry of Social Justice & Empowerment</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Alex'} 🌿
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              MindPulse monitors your wellbeing across your case journey. Your personal baseline helps designated counselors prioritize support during high-stress legal or rehabilitation stages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/checkins"
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <Smile className="w-4 h-4" />
              <span>Quick Check-In</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-teal-300 font-semibold rounded-xl text-sm border border-teal-500/30 transition-colors flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-teal-400" />
              <span>Voice Stress Test</span>
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

      {/* Case Journey Timeline Tracker */}
      <CaseJourneyTimeline
        currentStage={currentStage}
        caseId={user?.caseId || 'MP-1042'}
        victimType={user?.victimType || 'Protected Witness'}
        onSelectStage={(stage) => setCurrentStage(stage)}
      />

      {/* 3 Overview Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Distress Signal Card */}
        <Link to="/risk" className="glass-card p-6 border border-slate-800 glass-card-hover group rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            {risk && (
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getRiskColor(
                  risk.riskLevel
                )}`}
              >
                {risk.riskLevel}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Distress Signal Status</h2>
          <p className="text-xs text-slate-400 mb-4">Explainable AI feature attribution and longitudinal signals.</p>
          <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform gap-1">
            <span>View contributing signals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* 7-Day Early Forecast Card */}
        <Link to="/forecast" className="glass-card p-6 border border-slate-800 glass-card-hover group rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider">
              7-Day Forecast
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Early Risk Trajectory</h2>
          <p className="text-xs text-slate-400 mb-4">Proactive trajectory forecast based on case stage and sleep deltas.</p>
          <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform gap-1">
            <span>Explore forecast curve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Journal Reflection Card */}
        <Link to="/journal" className="glass-card p-6 border border-slate-800 glass-card-hover group rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-teal-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 uppercase tracking-wider">
              NLP Intelligence
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">Journal & Reflection Log</h2>
          <p className="text-xs text-slate-400 mb-4">Optional private notes with linguistic distress indicators.</p>
          <div className="flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform gap-1">
            <span>Open reflection journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Personal Baseline Snapshot & Support Pathways */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Personal Wellbeing Baseline (Historical Normal)
            </h2>
            <Link to="/wellness" className="text-xs text-teal-400 hover:underline font-semibold">
              Full Baseline
            </Link>
          </div>

          {baseline && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Mood</span>
                <span className="text-2xl font-extrabold text-emerald-400">{baseline.avgMood}</span>
                <span className="text-xs text-slate-500 block mt-1">out of 10</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Stress</span>
                <span className="text-2xl font-extrabold text-amber-400">{baseline.avgStress}</span>
                <span className="text-xs text-slate-500 block mt-1">out of 10</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Sleep</span>
                <span className="text-2xl font-extrabold text-teal-400">{baseline.avgSleep}h</span>
                <span className="text-xs text-slate-500 block mt-1">nightly pattern</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Sense of Safety</span>
                <span className="text-2xl font-extrabold text-indigo-400">{baseline.avgSafety || 7.5}</span>
                <span className="text-xs text-slate-500 block mt-1">out of 10</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Grounding & Support Pathways */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Recommended Support Pathways (SIH26094)
              </h2>
              <Link to="/recommendations" className="text-xs text-teal-400 hover:underline font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">NALSA Free Legal Aid Support</span>
                    <span className="text-[11px] text-slate-400">Legal representation under SC/ST Prevention of Atrocities Act</span>
                  </div>
                </div>
                <Link
                  to="/recommendations"
                  className="px-3 py-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold"
                >
                  Details
                </Link>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Victim Compensation Scheme Guide</span>
                    <span className="text-[11px] text-slate-400">Statutory relief and rehabilitation entitlements</span>
                  </div>
                </div>
                <Link
                  to="/recommendations"
                  className="px-3 py-1 bg-teal-500/15 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-semibold"
                >
                  Start
                </Link>
              </div>

              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Designated Counselor Support Session</span>
                    <span className="text-[11px] text-slate-400">Request follow-up or grounding session with Dr. Sarah Jenkins</span>
                  </div>
                </div>
                <Link
                  to="/support"
                  className="px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold"
                >
                  Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VoiceStressModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        caseId={user?.caseId || 'MP-1042'}
        caseStage={currentStage}
      />
    </div>
  );
};

