import React from 'react';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { RiskResult } from '../../../services/mlApi';

interface RiskCardProps {
  risk: RiskResult;
}

export const RiskCard: React.FC<RiskCardProps> = ({ risk }) => {
  // Normalize risk score to 0-100
  const score =
    typeof risk.risk_score === 'number'
      ? risk.risk_score
      : Math.round((risk.riskScore || 0) * 100);

  const level = (risk.risk_level || risk.riskLevel || 'LOW').toUpperCase();
  const confidencePct = Math.round((risk.confidence || 0.85) * 100);

  const getLevelConfig = (lvl: string) => {
    switch (lvl) {
      case 'CRITICAL':
      case 'REQUIRES_REVIEW':
        return {
          label: 'CRITICAL',
          badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          barClass: 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          bgGlow: 'from-rose-950/20 via-slate-900 to-slate-950',
          icon: ShieldAlert,
        };
      case 'HIGH':
      case 'ELEVATED':
        return {
          label: 'HIGH',
          badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
          barClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
          textColor: 'text-orange-400',
          borderColor: 'border-orange-500/30',
          bgGlow: 'from-orange-950/20 via-slate-900 to-slate-950',
          icon: AlertTriangle,
        };
      case 'MODERATE':
      case 'WATCH':
        return {
          label: 'MODERATE',
          badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          barClass: 'bg-gradient-to-r from-teal-500 to-amber-500',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          bgGlow: 'from-amber-950/20 via-slate-900 to-slate-950',
          icon: Activity,
        };
      case 'LOW':
      case 'STABLE':
      default:
        return {
          label: 'LOW',
          badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          barClass: 'bg-emerald-500',
          textColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          bgGlow: 'from-emerald-950/20 via-slate-900 to-slate-950',
          icon: CheckCircle,
        };
    }
  };

  const config = getLevelConfig(level);
  const LevelIcon = config.icon;

  const getDirectionIcon = (dir: string) => {
    const d = (dir || '').toUpperCase();
    if (d.includes('DETERIORAT') || d.includes('WORSEN') || d.includes('INCREAS')) {
      return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (d.includes('IMPROV') || d.includes('DECREAS')) {
      return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div
      className={`glass-card p-6 border ${config.borderColor} rounded-2xl bg-gradient-to-br ${config.bgGlow} relative overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Overall Distress Risk</span>
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${config.badgeClass}`}
          >
            <LevelIcon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </span>
        </div>

        {/* Large Score Display */}
        <div className="my-3 text-center">
          <div className="inline-flex items-baseline gap-1.5">
            <span className={`text-5xl font-extrabold tracking-tight ${config.textColor}`}>
              {score}
            </span>
            <span className="text-xl text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic Risk Score (XGBoost + Clinical Telemetry)
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden my-4 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${config.barClass}`}
            style={{ width: `${Math.min(Math.max(score, 4), 100)}%` }}
          />
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Confidence:</span>
          <span className="font-semibold text-slate-200">{confidencePct}%</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Direction:</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            {getDirectionIcon(risk.direction)}
            <span>{risk.direction || 'STABLE'}</span>
          </span>
        </div>
      </div>

      {risk.human_review_recommended && (
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Human Review Recommended</span>
        </div>
      )}
    </div>
  );
};
