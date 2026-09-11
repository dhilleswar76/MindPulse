import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TopFactor } from '../../../services/mlApi';

interface ExplainabilityCardProps {
  topFactors: TopFactor[];
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  topFactors,
}) => {
  const getImpactBadge = (impact: string) => {
    switch ((impact || '').toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    }
  };

  const getDirectionBadge = (dir: string) => {
    const d = (dir || '').toUpperCase();
    if (d === 'NEGATIVE') {
      return (
        <span className="text-rose-400 font-semibold inline-flex items-center gap-1 text-[11px]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Negative Impact</span>
        </span>
      );
    }
    if (d === 'POSITIVE') {
      return (
        <span className="text-emerald-400 font-semibold inline-flex items-center gap-1 text-[11px]">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Protective Factor</span>
        </span>
      );
    }
    return (
      <span className="text-slate-400 font-semibold inline-flex items-center gap-1 text-[11px]">
        <Minus className="w-3.5 h-3.5" />
        <span>Neutral</span>
      </span>
    );
  };

  return (
    <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Top Contributing Factors (Explainable AI)</span>
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            SHAP TreeExplainer feature attributions explaining observable distress shifts
          </p>
        </div>
        <span className="text-[11px] font-mono bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20 font-semibold">
          SHAP Weighted
        </span>
      </div>

      {topFactors.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No distinct contributing factor drivers calculated yet.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {topFactors.map((factor, idx) => {
            const weightPct = Math.round(
              Math.min(Math.max(factor.impactScore || 0.1, 0.05), 1.0) * 100
            );

            return (
              <div
                key={idx}
                className="p-4 bg-slate-900/80 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-teal-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      {factor.feature}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getImpactBadge(
                        factor.impact
                      )}`}
                    >
                      {factor.impact} IMPACT
                    </span>
                    {getDirectionBadge(factor.direction)}
                  </div>
                </div>

                {/* Values & Baseline Comparison */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {typeof factor.value === 'number' && (
                    <div className="text-slate-300">
                      <span className="text-slate-500 text-[11px] mr-1">Current:</span>
                      <strong className="font-mono text-white">
                        {factor.value.toFixed(1)}
                      </strong>
                    </div>
                  )}
                  {typeof factor.baseline === 'number' && (
                    <div className="text-slate-300">
                      <span className="text-slate-500 text-[11px] mr-1">Baseline:</span>
                      <strong className="font-mono text-teal-300">
                        {factor.baseline.toFixed(1)}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Context Reason */}
                {factor.reason && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {factor.reason}
                  </p>
                )}

                {/* Attribution Score Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Feature Attribution Weight</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {(factor.impactScore || 0).toFixed(2)} ({weightPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.impact === 'CRITICAL' || factor.impact === 'HIGH'
                          ? 'bg-rose-500'
                          : factor.impact === 'MODERATE'
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${weightPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
