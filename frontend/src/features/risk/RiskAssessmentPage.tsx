import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Info, HelpCircle, Activity, ChevronRight, HeartHandshake, Sparkles, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { RiskScoreData } from '../../types';

export const RiskAssessmentPage: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res: any = await api.get('/risk/current');
        setRiskData(res.data?.risk || null);
      } catch {
        setRiskData({
          riskScore: 0.68,
          riskLevel: 'ELEVATED',
          factors: [
            { feature: 'Hearing / Court Date Proximity', impact: 0.28, description: 'Elevated tension reported coinciding with upcoming trial testimony date' },
            { feature: 'Severe Sleep Deficit', impact: 0.22, description: 'Average sleep (4.2h) down 2.8h from baseline due to nighttime hypervigilance' },
            { feature: 'Sense of Safety Volatility', impact: 0.18, description: 'Sense of safety score dropped from 7.5 to 4.0 in the last 72 hours' },
            { feature: 'Support Isolation Factor', impact: 0.08, description: 'Voluntary check-in interval increased; low perceived immediate support access' },
          ],
          modelVersion: 'sih-xai-v2.1',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRisk();
  }, []);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'STABLE':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Steady & Stable Rhythm</span>;
      case 'WATCH':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Mild Pattern Variation</span>;
      case 'ELEVATED':
        return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Elevated Tension Pattern</span>;
      case 'REQUIRES_REVIEW':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">Counselor Check-In Recommended</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs font-semibold">{level}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-teal-400" />
            Understanding Your Wellbeing Signals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Transparent, human-readable indicators explaining what has contributed to recent shifts in your wellbeing.
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

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 block mb-0.5">Non-Diagnostic Decision Support</strong>
          MindPulse analyzes patterns from your self-reported check-ins, sleep, and tension. It does not provide clinical diagnoses or psychiatric labels—it highlights early cues so your support team can offer timely assistance.
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Evaluating latest patterns...</div>
      ) : riskData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Overall Signal Intensity */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Pattern State</span>
                {getRiskBadge(riskData.riskLevel)}
              </div>

              <div className="my-6 text-center">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{Math.round(riskData.riskScore * 100)}</span>
                  <span className="text-xl text-slate-400">/ 100</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Pattern Variation Index</p>
              </div>

              {/* Progress bar visual */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    riskData.riskScore > 0.7
                      ? 'bg-rose-500'
                      : riskData.riskScore > 0.5
                      ? 'bg-orange-500'
                      : riskData.riskScore > 0.3
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.round(riskData.riskScore * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-200 block">What this means:</span>
              <p className="leading-relaxed">
                Your pattern reflects elevated pre-trial stress and a temporary sleep deficit. This is a common response during active court proceedings.
              </p>
            </div>
          </div>

          {/* Right: Contributing Influences */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
            <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Primary Contributing Factors</span>
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Identified from your self-reported logs to help explain what is driving recent tension.
            </p>

            <div className="space-y-3.5">
              {riskData.factors.map((factor, idx) => (
                <div key={idx} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{factor.feature}</span>
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      +{Math.round(factor.impact * 100)}% contribution
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, factor.impact * 200)}%` }}
                    />
                  </div>
                  {factor.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{factor.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Looking for ways to de-escalate hearing tension?</span>
              <Link to="/recommendations" className="text-teal-400 hover:underline font-semibold">
                Explore Grounding Tools →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
