import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Radio } from 'lucide-react';
import { ContributingSignal } from '../../../services/mlApi';

interface ContributingSignalsCardProps {
  signals: ContributingSignal[];
}

export const ContributingSignalsCard: React.FC<ContributingSignalsCardProps> = ({
  signals,
}) => {
  const getDirectionVisual = (dir: string) => {
    const d = (dir || '').toLowerCase();
    if (d.includes('increas') || d.includes('elevat') || d.includes('up')) {
      return {
        icon: ArrowUpRight,
        symbol: '↑',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20',
      };
    }
    if (d.includes('decreas') || d.includes('declin') || d.includes('down')) {
      return {
        icon: ArrowDownRight,
        symbol: '↓',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
      };
    }
    return {
      icon: Minus,
      symbol: '→',
      color: 'text-slate-400',
      bg: 'bg-slate-800 border-slate-700',
    };
  };

  return (
    <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span>Contributing Signals Overview</span>
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Specific directional metric signals extracted by ML feature pipeline
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          {signals.length} Signals Identified
        </span>
      </div>

      {signals.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No directional signals detected for this observation.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {signals.map((sig, idx) => {
            const visual = getDirectionVisual(sig.direction);
            const VisualIcon = visual.icon;
            const impactPct = Math.round((sig.impact || 0) * 100);

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200">
                    <span>{sig.feature}</span>
                    <span className={`font-mono text-sm font-black ${visual.color}`}>
                      {visual.symbol}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${visual.bg} ${visual.color}`}
                  >
                    {impactPct}% Weight
                  </span>
                </div>

                {sig.description && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {sig.description}
                  </p>
                )}

                {sig.baselineComparison && (
                  <div className="text-[10px] font-mono text-teal-400 pt-1 border-t border-slate-800/80">
                    {sig.baselineComparison}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
