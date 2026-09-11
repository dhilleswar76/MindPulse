import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, ShieldAlert } from 'lucide-react';
import { AnomalyResult } from '../../../services/mlApi';

interface AnomalyCardProps {
  anomaly: AnomalyResult;
  observationsUsed?: number;
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({
  anomaly,
  observationsUsed,
}) => {
  const isAnomaly = anomaly.is_anomaly || anomaly.isAnomaly || false;
  const score =
    typeof anomaly.anomaly_score === 'number'
      ? anomaly.anomaly_score
      : anomaly.anomalyScore || 0;
  const severity = (anomaly.severity || 'LOW').toUpperCase();
  const affected = anomaly.affected_features || [];
  const explanations = anomaly.explanation || [];

  // Detect insufficient history
  const isInsufficient =
    (typeof observationsUsed === 'number' && observationsUsed < 2) ||
    explanations.some((e) =>
      e.toLowerCase().includes('insufficient history')
    );

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Personal Baseline Anomaly</span>
          </span>

          {isInsufficient ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Uncalibrated Baseline
            </span>
          ) : isAnomaly ? (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getSeverityBadge(
                severity
              )}`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>⚠ Anomaly Detected</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Normal Baseline</span>
            </span>
          )}
        </div>

        {/* Status Body */}
        {isInsufficient ? (
          <div className="my-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 text-xs flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5">
                Insufficient history for personalized anomaly detection.
              </strong>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                At least 2 longitudinal check-ins are required to calibrate the
                victim's personal baseline. Normative demographic priors are currently applied.
              </p>
            </div>
          </div>
        ) : isAnomaly ? (
          <div className="space-y-4 my-2">
            <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs text-slate-400 block">Anomaly Severity</span>
                <span className="text-lg font-bold text-rose-400">{severity}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Anomaly Score</span>
                <span className="text-lg font-mono font-bold text-white">
                  {score.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Affected Features */}
            {affected.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Affected Metric Dimensions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {affected.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 capitalize"
                    >
                      {feat.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Model Explanations */}
            {explanations.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {explanations.map((exp, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                  >
                    <span className="text-rose-400 font-bold shrink-0">•</span>
                    <span>{exp}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="my-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-slate-200">
                No significant anomaly detected.
              </strong>
              <span className="text-slate-400 text-[11px]">
                Current check-in parameters are consistent with calibrated baseline patterns (score: {score.toFixed(2)}).
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
        Non-diagnostic Isolation Forest anomaly scoring against personal multi-signal history.
      </div>
    </div>
  );
};
