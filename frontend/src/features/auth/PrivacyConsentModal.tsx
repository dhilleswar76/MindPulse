import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, EyeOff, UserCheck, Check, X, AlertCircle, Sparkles } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ isOpen, onClose }) => {
  const [counselorSharing, setCounselorSharing] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);
  const [anonymousMetrics, setAnonymousMetrics] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-lg font-bold text-white tracking-tight">
                Your Privacy & Protected Rights
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Plain-language clarity on how your data is protected and used.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Core Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center text-center">
            <Lock className="w-4 h-4 text-teal-400 mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">End-to-End Encrypted</span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Protected witness identifiers are pseudonymous.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center text-center">
            <EyeOff className="w-4 h-4 text-indigo-400 mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">Private Reflection</span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Journal entries remain exclusively yours.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center text-center">
            <UserCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
            <span className="text-xs font-semibold text-slate-200">Human Oversight</span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Only your authorized counselor coordinates care.
            </span>
          </div>
        </div>

        {/* Permission Toggles */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1">
            Your Privacy Controls
          </h3>

          {/* Toggle 1 */}
          <label className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
            <div className="pr-2">
              <span className="text-xs font-semibold text-white block">
                Share Wellbeing Trends with Assigned Counselor
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Enables Dr. Sarah Jenkins to review 14-day sleep and stress trends to prepare pre-hearing support.
              </p>
            </div>
            <input
              type="checkbox"
              checked={counselorSharing}
              onChange={(e) => setCounselorSharing(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500"
            />
          </label>

          {/* Toggle 2 */}
          <label className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
            <div className="pr-2">
              <span className="text-xs font-semibold text-white block">
                Early Change Reassurance Alerts
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Allows your counselor to proactively reach out with calming resources if your sleep or tension changes suddenly.
              </p>
            </div>
            <input
              type="checkbox"
              checked={safetyAlerts}
              onChange={(e) => setSafetyAlerts(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500"
            />
          </label>

          {/* Toggle 3 */}
          <label className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
            <div className="pr-2">
              <span className="text-xs font-semibold text-white block">
                Anonymous Institutional Improvement Metrics
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Includes anonymized, stripped metrics in district aggregate welfare reports under strict k-anonymity (k ≥ 5).
              </p>
            </div>
            <input
              type="checkbox"
              checked={anonymousMetrics}
              onChange={(e) => setAnonymousMetrics(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-500 rounded border-slate-700 bg-slate-900 focus:ring-teal-500"
            />
          </label>
        </div>

        {/* Non-Diagnostic Reminder */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong>Non-Diagnostic Commitment:</strong> MindPulse does not diagnose psychiatric illness or assign clinical labels. All features serve as human-centered supportive tools.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">Consent version: v2.4 (Updated 2026)</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Preferences Saved</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
