import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle, FileText, Clock, X, HeartHandshake, ShieldCheck, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VictimCompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VictimCompensationModal: React.FC<VictimCompensationModalProps> = ({ isOpen, onClose }) => {
  const [showDocGuidance, setShowDocGuidance] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compensation-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-1">
                <span>Statutory Financial Relief</span>
                <span>•</span>
                <span>Section 357A CrPC</span>
              </div>
              <h2 id="compensation-modal-title" className="text-xl font-bold text-white tracking-tight">
                Victim Compensation
              </h2>
              <p className="text-xs text-slate-300">
                District Welfare Committee & Legal Services Authority Schemes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-5">
          
          {/* OVERVIEW */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              Learn about available compensation support.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Section 357A of the Code of Criminal Procedure mandates state schemes for providing financial relief and rehabilitation to victims or their dependents who have suffered loss, trauma, or injury. Relief can be awarded on an interim basis even while trial proceedings are ongoing.
            </p>
          </div>

          {/* POTENTIAL SUPPORT */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-1">
              Potential Support Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Medical & Trauma Relief
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Grants covering emergency surgical care, physical rehabilitation, and mental health trauma treatment.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Interim Subsistence Grants
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Immediate financial assistance sanctioned by the DLSA to stabilize basic livelihood needs prior to judgment.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Rehabilitation & Restitution
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Long-term rehabilitation support for housing, vocational aid, or affected family dependents.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Safe Transit Assistance
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Stipends ensuring safe and confidential transportation when attending court hearings.
                </p>
              </div>
            </div>
          </div>

          {/* PROCESS: Simple 4-stage visual stepper */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-1">
              Application Process
            </h3>
            
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                
                {/* Step 1 */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                    <span>Check eligibility</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Verify FIR or recommendation under 357A CrPC.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                    <span>Prepare info</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gather ID, medical discharge, and loss proof.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
                    <span>Submit Form I</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    File Form I with the DLSA Member Secretary.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">4</span>
                    <span>Track progress</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Counselor coordinates inquiry and disbursement.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Secondary CTA Toggle: View Application Guidance */}
          <div>
            <button
              type="button"
              onClick={() => setShowDocGuidance(!showDocGuidance)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>{showDocGuidance ? 'Hide application guidance' : 'View application guidance & document checklist'}</span>
              {showDocGuidance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDocGuidance && (
              <div className="mt-2.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
                <span className="font-bold text-white block">Standard Documentation for Form I:</span>
                <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-300">
                  <li>Copy of First Information Report (FIR) or Court referral order</li>
                  <li>Medical certificates or discharge summaries (if seeking medical reimbursement)</li>
                  <li>Proof of residence and identity (Aadhaar / Voter ID)</li>
                  <li>Bank account details for direct benefit transfer (DBT)</li>
                </ul>
                <p className="text-slate-400 text-[10px] pt-1">
                  💡 Your designated MindPulse counselor can assist you in compiling these documents and liaising with the DLSA office.
                </p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            ℹ️ <strong>Statutory notice:</strong> This interface provides educational information on statutory rights. Compensation orders and amounts are determined exclusively by the competent Court or District Legal Services Authority.
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDocGuidance(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              View application guidance
            </button>

            <Link
              to="/support"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <span>Explore compensation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
