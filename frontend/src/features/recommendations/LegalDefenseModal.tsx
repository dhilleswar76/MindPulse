import React, { useState, useEffect } from 'react';
import { Scale, PhoneCall, ShieldCheck, X, ExternalLink, Info, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LegalDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalDefenseModal: React.FC<LegalDefenseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

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

  const handleCopyHelpline = () => {
    navigator.clipboard.writeText('15100');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-defense-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-1">
                <span>Statutory Legal Defense</span>
                <span>•</span>
                <span>Government Assigned</span>
              </div>
              <h2 id="legal-defense-modal-title" className="text-xl font-bold text-white tracking-tight">
                NALSA / DLSA Free Legal Defense
              </h2>
              <p className="text-xs text-slate-300">
                National & District Legal Services Authorities (Act of 1987)
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

        {/* Separated Content Sections */}
        <div className="space-y-4">
          
          {/* SECTION 1: WHAT IT IS */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>What It Is</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Under the Legal Services Authorities Act, 1987, qualified panel advocates provide free legal defense, document drafting, courtroom representation, and witness assistance at zero fee for eligible citizens.
            </p>
          </div>

          {/* SECTION 2: WHO IT MAY HELP */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Who It May Help</span>
            </h3>
            <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Victims of offenses requiring legal representation and courtroom guidance</li>
              <li>Protected witnesses facing deposition or trial intimidation</li>
              <li>Women, children, and persons from marginalized communities</li>
              <li>Anyone unable to engage private counsel due to financial hardship</li>
            </ul>
          </div>

          {/* SECTION 3: HOW TO GET SUPPORT */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              How to Get Support
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">1. Dial 15100</span>
                <span className="text-slate-400 text-[11px] block">Call the national toll-free helpline directly anytime.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">2. DLSA Front Office</span>
                <span className="text-slate-400 text-[11px] block">Visit your local District Court legal services front desk.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">3. Assigned Counsel</span>
                <span className="text-slate-400 text-[11px] block">A designated panel advocate will be appointed to assist you.</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: CONTACT (Prominent 15100 Card) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider block">
                National Legal Aid Toll-Free Helpline
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  15100
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  24/7 Available
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Operated by NALSA across all Indian states and union territories.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyHelpline}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700/50"
                title="Copy number"
                aria-label="Copy helpline number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href="tel:15100"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 15100 Now</span>
              </a>
            </div>
          </div>

          {/* Toggleable Details Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>{showFullDetails ? 'Hide panel guidelines' : 'View statutory details & guidelines'}</span>
              {showFullDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showFullDetails && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
                <p>
                  <strong>Section 12 of the Legal Services Authorities Act</strong> stipulates that every person who has to file or defend a case shall be entitled to legal services under this Act if that person is a member of SC/ST, a victim of trafficking, a woman, a child, or a person with disability.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Advocates on the legal services panel are bound by confidentiality codes and cannot demand any private remuneration from the beneficiary.
                </p>
              </div>
            )}
          </div>

          {/* Mandatory Guidance Disclaimer */}
          <div className="p-3 bg-slate-800/30 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            ⚖️ <strong>Guidance notice:</strong> Information shown here is for guidance. Eligibility and available services may depend on the applicable authority and circumstances. MindPulse does not provide legal advice.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <Link
              to="/support"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <span>Ask Companion</span>
            </Link>
            <a
              href="tel:15100"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Get legal support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
