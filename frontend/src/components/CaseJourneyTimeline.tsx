import React, { useState, useEffect } from 'react';
import { CaseStage, StageStatus, CaseStageInfo } from '../types';
import {
  FileText,
  Search,
  Scale,
  Landmark,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  Send,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface CaseJourneyTimelineProps {
  currentStage?: CaseStage;
  caseId?: string;
  victimType?: string;
  onSelectStage?: (stage: CaseStage) => void;
  onStageUpdated?: () => void;
  isReadOnly?: boolean;
  pendingTransition?: any;
}

const STAGE_METADATA: Array<{
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
    description: 'Initial reporting & formal FIR verification',
    icon: FileText,
  },
  {
    key: 'INVESTIGATION',
    label: 'Investigation',
    shortLabel: 'Investigation',
    description: 'Evidence, statements & police inquiry',
    icon: Search,
  },
  {
    key: 'COURT_TRIAL',
    label: 'Court / Trial',
    shortLabel: 'Trial',
    description: 'Special Court hearings & trial support',
    icon: Scale,
  },
  {
    key: 'COMPENSATION',
    label: 'Compensation & Relief',
    shortLabel: 'Compensation',
    description: 'Statutory welfare relief & Sec 357A CrPC',
    icon: Landmark,
  },
  {
    key: 'REHABILITATION',
    label: 'Rehabilitation',
    shortLabel: 'Rehabilitation',
    description: 'Social, psychological & vocational aid',
    icon: HeartHandshake,
  },
  {
    key: 'PROTECTION_SUPPORT',
    label: 'Protection & Support',
    shortLabel: 'Protection',
    description: 'Witness safety & ongoing wellbeing monitoring',
    icon: ShieldCheck,
  },
];

export const CaseJourneyTimeline: React.FC<CaseJourneyTimelineProps> = ({
  currentStage = 'INVESTIGATION',
  caseId = 'MP-1042',
  victimType = 'Protected Witness',
  onSelectStage,
  onStageUpdated,
  isReadOnly = false,
}) => {
  const { user } = useAuth();
  const isCounselorOrAdmin = user?.role === 'COUNSELOR' || user?.role === 'ADMIN';

  const [stagesData, setStagesData] = useState<CaseStageInfo[]>([]);
  const [activeCaseStage, setActiveCaseStage] = useState<CaseStage>(currentStage);
  const [isLoading, setIsLoading] = useState(true);

  // Stage Completion Confirmation Modal state
  const [modalStage, setModalStage] = useState<{ stage: CaseStage; name: string; isResubmit?: boolean } | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  const fetchStages = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/cases/${caseId}/stages`);
      const data = res.data?.data || res.data || {};
      if (data.stages && Array.isArray(data.stages)) {
        setStagesData(data.stages);
        if (data.currentStage) {
          setActiveCaseStage(data.currentStage);
        }
      }
    } catch {
      // Fallback stage computation based on currentStage
      const currentIndex = STAGE_METADATA.findIndex((s) => s.key === currentStage);
      const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 2;

      const fallbackStages: CaseStageInfo[] = STAGE_METADATA.map((st, idx) => {
        let status: StageStatus = 'LOCKED';
        if (idx < safeCurrentIndex) status = 'COMPLETED';
        else if (idx === safeCurrentIndex) status = 'ACTIVE';
        else status = 'LOCKED';
        return {
          stage: st.key,
          name: st.shortLabel,
          order: idx + 1,
          status,
        };
      });
      setStagesData(fallbackStages);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, [caseId, currentStage]);

  // Lock background body scroll when confirmation modal is open
  useEffect(() => {
    if (!modalStage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalStage]);

  const handleOpenCompleteModal = (stageKey: CaseStage, stageName: string, isResubmit: boolean = false) => {
    setModalStage({ stage: stageKey, name: stageName, isResubmit });
    setCompletionNotes('');
    setEvidenceRef(`EVD-${caseId}-${stageKey.substring(0, 4)}`);
    setActionErrorMsg(null);
  };

  const handleSubmitStageCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStage) return;

    setIsSubmitting(true);
    setActionErrorMsg(null);

    try {
      await api.post(`/cases/${caseId}/stages/${modalStage.stage}/complete`, {
        reason: completionNotes.trim() || `Counsellor verified all milestone prerequisites for ${modalStage.name} stage.`,
        evidenceReference: evidenceRef.trim() || `MS-${caseId}-${modalStage.stage}`,
        notes: completionNotes.trim(),
      });

      setActionSuccessMsg('Stage completion submitted for admin approval.');
      setModalStage(null);

      // Re-fetch updated stage states
      await fetchStages();
      if (onStageUpdated) {
        onStageUpdated();
      }

      setTimeout(() => {
        setActionSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      setActionErrorMsg(err.response?.data?.error || err.message || 'Failed to submit stage completion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find active stage index
  const currentStageIndex = STAGE_METADATA.findIndex((s) => s.key === activeCaseStage);
  const safeCurrentIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const currentStageLabel = STAGE_METADATA[safeCurrentIndex]?.label || 'Investigation';

  const pendingRequestStage = stagesData.find((s) => s.status === 'COMPLETION_REQUESTED');

  return (
    <div className="glass-card p-6 border border-slate-800 bg-slate-900/80 rounded-2xl relative overflow-hidden space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Case {caseId}
            </span>
            <span className="text-xs text-slate-400 font-medium">Role: {victimType}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>MindPulse Longitudinal Case Journey</span>
            <span className="text-[10px] text-teal-400/90 font-mono font-normal">
              (Live Official Backend Record)
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingRequestStage && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Admin Approval: <strong>{pendingRequestStage.name}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Official Active Stage: <strong className="text-slate-200">{currentStageLabel}</strong>
            </span>
          </div>

          {isReadOnly && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/30 px-2.5 py-1 rounded-lg border border-slate-700/30">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Official Record</span>
            </div>
          )}
        </div>
      </div>

      {/* Success banner after counselor submits */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 6-Stage Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {STAGE_METADATA.map((meta, idx) => {
          const Icon = meta.icon;
          const stageInfo = stagesData.find((s) => s.stage === meta.key) || {
            stage: meta.key,
            name: meta.shortLabel,
            order: idx + 1,
            status: idx < safeCurrentIndex ? 'COMPLETED' : idx === safeCurrentIndex ? 'ACTIVE' : 'LOCKED',
          };

          const status: StageStatus = stageInfo.status;
          const isCompleted = status === 'COMPLETED';
          const isActive = status === 'ACTIVE';
          const isPending = status === 'COMPLETION_REQUESTED';
          const isRejected = status === 'REJECTED';
          const isLocked = status === 'LOCKED';

          return (
            <div
              key={meta.key}
              onClick={() => onSelectStage && onSelectStage(meta.key)}
              className={`p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between select-none ${
                onSelectStage ? 'cursor-pointer hover:border-slate-600' : 'cursor-default'
              } ${
                isActive
                  ? 'bg-gradient-to-b from-teal-500/20 via-slate-900 to-indigo-950/20 border-teal-500/50 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
                  : isPending
                  ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/40 text-amber-200'
                  : isRejected
                  ? 'bg-gradient-to-b from-rose-500/15 via-slate-900 to-slate-950 border-rose-500/40 text-rose-200'
                  : isCompleted
                  ? 'bg-slate-850/70 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-xl ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/30'
                      : isPending
                      ? 'bg-amber-500/20 text-amber-300'
                      : isRejected
                      ? 'bg-rose-500/20 text-rose-300'
                      : isCompleted
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-slate-800/60 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Status Badges */}
                {isCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓</span>
                  </span>
                )}

                {isActive && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                  </span>
                )}

                {isPending && (
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                )}

                {isRejected && (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}

                {isLocked && (
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>

              {/* Stage Title & Info */}
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  {isCompleted ? `✓ Stage ${idx + 1}` : `Stage ${idx + 1}`}
                </span>
                <h4
                  className={`text-xs font-bold leading-tight ${
                    isActive ? 'text-white' : isCompleted ? 'text-slate-100' : isPending ? 'text-amber-200' : isRejected ? 'text-rose-200' : 'text-slate-500'
                  }`}
                >
                  {meta.shortLabel}
                </h4>
                <p className="text-[10px] text-slate-400/90 mt-1 line-clamp-2 leading-tight">
                  {meta.description}
                </p>

                {/* Rejection Reason Alert if rejected */}
                {isRejected && stageInfo.rejectionReason && (
                  <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-300 leading-snug">
                    <strong>Reason:</strong> {stageInfo.rejectionReason}
                  </div>
                )}
              </div>

              {/* Card Footer / Action Area */}
              <div className="mt-3 pt-2 border-t border-slate-800/80">
                {isCompleted && (
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed</span>
                  </div>
                )}

                {isActive && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                      <span>Active Monitoring</span>
                    </div>

                    {!isReadOnly && isCounselorOrAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCompleteModal(meta.key, meta.shortLabel, false);
                        }}
                        className="w-full mt-1.5 py-1.5 px-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold rounded-lg text-[10px] transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Complete Stage</span>
                      </button>
                    )}
                  </div>
                )}

                {isPending && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Pending Admin Approval</span>
                    </div>
                    {!isReadOnly && (
                      <button
                        disabled
                        className="w-full py-1.5 px-2 bg-slate-800/70 text-slate-400 rounded-lg text-[10px] font-semibold cursor-not-allowed opacity-80 flex items-center justify-center gap-1"
                      >
                        <span>Awaiting Admin Review</span>
                      </button>
                    )}
                  </div>
                )}

                {isRejected && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>Completion Rejected</span>
                    </div>

                    {!isReadOnly && isCounselorOrAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCompleteModal(meta.key, meta.shortLabel, true);
                        }}
                        className="w-full py-1.5 px-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resubmit Stage</span>
                      </button>
                    )}
                  </div>
                )}

                {isLocked && (
                  <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {modalStage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="min-h-full flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div
              className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
              role="dialog"
              aria-modal="true"
              aria-labelledby="stage-modal-title"
            >
              {/* Modal Header (Fixed / Shrink-0) */}
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="stage-modal-title" className="text-base font-bold text-white leading-tight">
                      {modalStage.isResubmit ? 'Resubmit Stage Completion' : 'Submit Stage for Admin Approval'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Case <strong className="text-teal-400 font-mono">{caseId}</strong> • Stage: <strong className="text-white">{modalStage.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalStage(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close modal"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Form wrapping scrollable content + accessible footer */}
              <form onSubmit={handleSubmitStageCompletion} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Scrollable Content Body */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                  {/* Confirmation Prompt */}
                  <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs space-y-2">
                    <p className="text-slate-200 font-medium leading-relaxed">
                      Are you sure you want to submit this stage for admin approval?
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upon submission, the stage status will transition to <strong className="text-amber-300">PENDING ADMIN APPROVAL</strong>. The next stage will remain locked until a District Welfare Admin officially reviews and approves the completion.
                    </p>
                  </div>

                  {actionErrorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{actionErrorMsg}</span>
                    </div>
                  )}

                  {/* Official Milestone / Evidence Identifier */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      Official Milestone / Evidence Identifier
                    </label>
                    <input
                      type="text"
                      value={evidenceRef}
                      onChange={(e) => setEvidenceRef(e.target.value)}
                      placeholder="e.g. INV-2026-1042, Chargesheet No. 44, Court Order Cr-8821"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  {/* Counsellor Verification Notes */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      Counsellor Verification Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="Document completed milestones, police inquiry status, or court hearing details..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Fixed / Accessible Footer (Shrink-0) */}
                <div className="shrink-0 flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 z-10">
                  <button
                    type="button"
                    onClick={() => setModalStage(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
        <span>MindPulse tracks longitudinal baseline deltas across each stage of the case journey.</span>
        <span className="text-teal-400 font-medium">Official Case Stage • Non-Diagnostic Decision Support</span>
      </div>
    </div>
  );
};
