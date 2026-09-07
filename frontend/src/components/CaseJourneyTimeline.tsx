import React from 'react';
import { CaseStage } from '../types';
import { FileText, Search, Scale, Landmark, HeartHandshake, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface CaseJourneyTimelineProps {
  currentStage: CaseStage;
  caseId?: string;
  victimType?: string;
  onSelectStage?: (stage: CaseStage) => void;
}

const STAGES: Array<{
  key: CaseStage;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'CASE_REGISTRATION',
    label: 'Case Registration',
    shortLabel: 'Registration',
    description: 'Initial reporting and intake',
    icon: FileText,
  },
  {
    key: 'INVESTIGATION',
    label: 'Investigation',
    shortLabel: 'Investigation',
    description: 'Evidence & statement collection',
    icon: Search,
  },
  {
    key: 'COURT_TRIAL',
    label: 'Court / Trial',
    shortLabel: 'Trial',
    description: 'Hearings & testimony support',
    icon: Scale,
  },
  {
    key: 'COMPENSATION',
    label: 'Compensation & Relief',
    shortLabel: 'Compensation',
    description: 'Statutory welfare relief',
    icon: Landmark,
  },
  {
    key: 'REHABILITATION',
    label: 'Rehabilitation',
    shortLabel: 'Rehabilitation',
    description: 'Social and vocational support',
    icon: HeartHandshake,
  },
  {
    key: 'PROTECTION_SUPPORT',
    label: 'Protection & Support',
    shortLabel: 'Protection',
    description: 'Ongoing safety & monitoring',
    icon: ShieldCheck,
  },
];

export const CaseJourneyTimeline: React.FC<CaseJourneyTimelineProps> = ({
  currentStage,
  caseId = 'MP-1042',
  victimType = 'Protected Witness',
  onSelectStage,
}) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 2;

  return (
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/80 rounded-2xl relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Case {caseId}
            </span>
            <span className="text-xs text-slate-400 font-medium">Role: {victimType}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">MindPulse Longitudinal Case Journey</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          <span>
            Active Monitoring: <strong className="text-slate-200">{STAGES[safeCurrentIndex]?.label}</strong>
          </span>
        </div>
      </div>

      {/* Interactive Horizontal Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < safeCurrentIndex;
          const isCurrent = idx === safeCurrentIndex;
          const isUpcoming = idx > safeCurrentIndex;

          return (
            <div
              key={stage.key}
              onClick={() => onSelectStage && onSelectStage(stage.key)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-b from-teal-500/20 to-indigo-600/10 border-teal-500/50 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
                  : isPassed
                  ? 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 text-slate-300'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isCurrent
                      ? 'bg-teal-500/20 text-teal-300'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isCurrent && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Stage {idx + 1}
                </span>
                <h4
                  className={`text-xs font-bold leading-tight ${
                    isCurrent ? 'text-white' : isPassed ? 'text-slate-200' : 'text-slate-400'
                  }`}
                >
                  {stage.shortLabel}
                </h4>
                <p className="text-[11px] text-slate-400/90 mt-1 line-clamp-2 leading-tight">
                  {stage.description}
                </p>
              </div>

              {isCurrent && (
                <div className="mt-2 pt-1.5 border-t border-teal-500/20 text-[10px] font-bold text-teal-300 uppercase tracking-wide">
                  Active Monitoring
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[11px] text-slate-400 flex items-center justify-between">
        <span>MindPulse tracks longitudinal baseline deltas across each stage of the case journey.</span>
        <span className="text-teal-400 font-medium">Non-diagnostic telemetry support</span>
      </div>
    </div>
  );
};
