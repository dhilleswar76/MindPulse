import React from 'react';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DataQualityResult } from '../../../services/mlApi';

interface DataQualityCardProps {
  dataQuality: DataQualityResult;
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({
  dataQuality,
}) => {
  const level = (dataQuality.quality_level || 'INSUFFICIENT').toUpperCase();
  const isGood = level === 'GOOD';
  const confidencePct = Math.round((dataQuality.confidence || 0.85) * 100);

  const getQualityBadge = (lvl: string) => {
    switch (lvl) {
      case 'GOOD':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'FAIR':
      case 'LIMITED':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'INSUFFICIENT':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Data Quality & Confidence Bounds</span>
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getQualityBadge(
            level
          )}`}
        >
          {isGood ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{level} QUALITY</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1">
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">
            Observations Analyzed
          </span>
          <div className="text-2xl font-black text-white">
            {dataQuality.observations_used}{' '}
            <span className="text-xs font-normal text-slate-500">
              {dataQuality.observations_used === 1 ? 'check-in' : 'check-ins'}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">
            Statistical Confidence
          </span>
          <div className="text-2xl font-black text-teal-400">
            {confidencePct}%
          </div>
        </div>
      </div>

      {/* Transparent Limitations */}
      {dataQuality.limitations && dataQuality.limitations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <span className="text-xs font-semibold text-amber-300 block">
            Calibration Constraints & Limitations:
          </span>
          <div className="space-y-1 text-xs text-slate-300">
            {dataQuality.limitations.map((lim, idx) => (
              <p key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{lim}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
