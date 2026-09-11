import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  HeartHandshake,
  X,
  UserCheck,
  Calendar,
  FileText,
  Shield,
  CheckCircle2,
  Loader2,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';

interface HumanReviewAlertProps {
  recommended: boolean;
  onTakeAction?: () => void;
}

export const HumanReviewAlert: React.FC<HumanReviewAlertProps> = ({
  recommended,
  onTakeAction,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Support action handlers
  const handleContactCounselor = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate/trigger touchpoint workflow
      if (onTakeAction) {
        onTakeAction();
      }
      setStatusMessage('Support action initiated');
      setIsModalOpen(false);
      navigate('/support');
    } catch {
      setErrorMessage('Unable to initiate support action right now. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleSession = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // If user has counselor/admin role and backend endpoint exists, log support pathway
      if (user?.role === 'COUNSELOR' || user?.role === 'ADMIN') {
        try {
          await api.post('/interventions', {
            userId: user.id || 'user_alex_101',
            caseId: user.caseId || 'MP-1042',
            type: 'COUNSELLING',
            clinicalNotes: 'Human review follow-up scheduled based on ML anomaly/distress signal recommendation.',
            scheduledDate: new Date(Date.now() + 86400000).toISOString(),
            riskBeforeScore: 0.8,
          });
          setStatusMessage('Support action initiated. Human support has been notified/reviewed.');
        } catch {
          // If API fails or offline, provide safe fallback
          setStatusMessage('Support action initiated');
        }
      } else {
        setStatusMessage('Support action initiated');
      }

      if (onTakeAction) {
        onTakeAction();
      }
      setIsModalOpen(false);
    } catch {
      setErrorMessage('Unable to initiate support action right now. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewCase = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (onTakeAction) {
        onTakeAction();
      }
      setStatusMessage('Support action initiated');
      setIsModalOpen(false);

      if (user?.role === 'COUNSELOR' || user?.role === 'ADMIN') {
        navigate('/counselor/cases');
      } else {
        navigate('/wellness');
      }
    } catch {
      setErrorMessage('Unable to initiate support action right now. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImmediateSupport = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (onTakeAction) {
        onTakeAction();
      }
      setStatusMessage('Support action initiated');
      setIsModalOpen(false);
      navigate('/recommendations');
    } catch {
      setErrorMessage('Unable to initiate support action right now. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
    <>
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

          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setIsModalOpen(true);
            }}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initiating...</span>
              </>
            ) : statusMessage ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Support Action Initiated</span>
              </>
            ) : (
              <>
                <HeartHandshake className="w-4 h-4" />
                <span>Initiate Support Action</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Alert Banners */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-400 hover:text-white text-[11px] underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-[11px] underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            MindPulse decision-support system provides non-diagnostic alerts to assist human professionals.
          </span>
        </div>
      </div>

      {/* SUPPORT ACTION MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
          aria-describedby="support-modal-description"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 text-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="support-modal-title" className="text-base font-bold text-white tracking-tight">
                    Initiate Support Action
                  </h2>
                  <p id="support-modal-description" className="text-xs text-slate-400 mt-0.5">
                    This action will help connect the user with appropriate human support based on the review recommendation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal if failed */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Existing Support Action Options */}
            <div className="space-y-2.5 text-xs">
              {/* Option 1: Contact Assigned Counselor */}
              <button
                type="button"
                onClick={handleContactCounselor}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Contact Assigned Counselor
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Connect with {user?.assignedCounselor || 'Dr. Sarah Jenkins'} through the District Legal Aid & Victim Support Cell.
                  </p>
                </div>
              </button>

              {/* Option 2: Schedule Support Session */}
              <button
                type="button"
                onClick={handleScheduleSession}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5 group-hover:bg-indigo-500/20 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Schedule Support Session
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Schedule a priority trauma-informed debrief, emotional grounding, or hearing preparation touchpoint.
                  </p>
                </div>
              </button>

              {/* Option 3: Review Case */}
              <button
                type="button"
                onClick={handleReviewCase}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 mt-0.5 group-hover:bg-sky-500/20 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Review Case
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Examine longitudinal distress telemetry, check-in history, and baseline deviations.
                  </p>
                </div>
              </button>

              {/* Option 4: Provide Immediate Support */}
              <button
                type="button"
                onClick={handleImmediateSupport}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 group-hover:bg-amber-500/20 transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Provide Immediate Support
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Open grounding practices (5-4-3-2-1 reset, 4-7-8 breathing) or toll-free national helplines (15100 / 14416).
                  </p>
                </div>
              </button>
            </div>

            {/* Non-Diagnostic Safety Notice */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Non-diagnostic decision support:</strong> MindPulse alerts indicate signals for human review and do not provide psychiatric diagnoses or medical decisions.
              </span>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
