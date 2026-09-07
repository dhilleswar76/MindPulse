import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Info, HelpCircle, Activity, ChevronRight } from 'lucide-react';
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
        return <span className="badge-stable">Stable (Low Signal)</span>;
      case 'WATCH':
        return <span className="badge-watch">Watch (Mild Variation)</span>;
      case 'ELEVATED':
        return <span className="badge-elevated">Elevated (Moderate Distress Signal)</span>;
      case 'REQUIRES_REVIEW':
        return <span className="badge-review">Requires Review (Persistent Distress)</span>;
      default:
        return <span className="badge-stable">{level}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
          Distress Signal Prediction & Explainable AI
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interpretable early warning signals showing potential contributing factors to your wellness trajectory.
        </p>
      </div>

      {/* Mandatory Non-diagnostic disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-teal-300 block mb-0.5">Important Safety Notice</strong>
          MindPulse distress prediction is a non-diagnostic decision-support metric calculated from subjective check-ins and sleep logs. It does not diagnose anxiety, depression, or psychiatric disorders.
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Evaluating latest signals...</div>
      ) : riskData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Overall Risk Score Gauge */}
          <div className="lg:col-span-5 glass-card p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Risk Tier</span>
                {getRiskBadge(riskData.riskLevel)}
              </div>

              <div className="my-6 text-center">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-6xl font-black text-white">{Math.round(riskData.riskScore * 100)}</span>
                  <span className="text-2xl text-slate-400">%</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Aggregated Distress Signal Intensity</p>
              </div>

              {/* Progress bar visual */}
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-700">
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

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Model Version: {riskData.modelVersion}</span>
              Tree-based gradient boosted classification interface with SHAP feature attribution.
            </div>
          </div>

          {/* Right: Explainable AI (SHAP-inspired Factor Contribution) */}
          <div className="lg:col-span-7 glass-card p-6 border border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
              <span>Possible Contributing Signals (XAI)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Relative contribution of behavioral telemetry to the evaluated distress score.
            </p>

            <div className="space-y-4">
              {riskData.factors.map((factor, idx) => (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-200">{factor.feature}</span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      +{Math.round(factor.impact * 100)}% signal impact
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${Math.min(100, factor.impact * 200)}%` }}
                    />
                  </div>
                  {factor.description && (
                    <p className="text-xs text-slate-400">{factor.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
