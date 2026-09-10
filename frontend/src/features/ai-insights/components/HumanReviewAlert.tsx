import React from 'react';
import { AlertTriangle, ShieldCheck, HeartHandshake } from 'lucide-react';

interface HumanReviewAlertProps {
  recommended: boolean;
  onTakeAction?: () => void;
}

export const HumanReviewAlert: React.FC<HumanReviewAlertProps> = ({
  recommended,
  onTakeAction,
}) => {
  if (!recommended) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-4 text-xs text-emerald-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white block">
              Routine Monitoring Status
            </strong>
            <span className="text-slate-400 text-[11px]">
              No urgent human review triggers flagged by telemetry anomaly or risk thresholds.
            </span>
          </div>
        </div>
        <span className="text-[11px] bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full font-semibold border border-emerald-500/30 shrink-0">
          Standard Protocol
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/40 shadow-xl shadow-rose-950/20 space-y-3 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Human Review Recommended
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                Action Required
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
              AI detected signals that may require professional attention. Longitudinal tension,
              safety volatility, or significant baseline deviations indicate that a counselor
              touchpoint or proactive review is warranted.
            </p>
          </div>
        </div>

        {onTakeAction && (
          <button
            onClick={onTakeAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 self-start sm:self-auto"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Initiate Support Action</span>
          </button>
        )}
      </div>

      <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          MindPulse decision-support system provides non-diagnostic alerts to assist human professionals.
        </span>
      </div>
    </div>
  );
};
