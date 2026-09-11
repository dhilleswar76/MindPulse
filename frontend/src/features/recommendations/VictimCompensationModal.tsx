import React, { useState, useEffect } from 'react';
import {
  Compass,
  FileText,
  Calculator,
  X,
  HeartHandshake,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CompensationCalculator, CategorySchedule } from '../compensation/CompensationCalculator';
import { CompensationApplicationForm } from '../compensation/CompensationApplicationForm';

interface VictimCompensationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'calculator' | 'form' | 'overview';
}

export const VictimCompensationModal: React.FC<VictimCompensationModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'calculator',
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'form' | 'overview'>(defaultTab);
  const [selectedCategory, setSelectedCategory] = useState<CategorySchedule | null>(null);
  const [isMinorPrefill, setIsMinorPrefill] = useState(false);
  const [interimPrefill, setInterimPrefill] = useState(true);
  const [showDocGuidance, setShowDocGuidance] = useState(false);

  // Sync tab with defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

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

  const handleApplyFromCalculator = (category: CategorySchedule, isMinor: boolean, interim: boolean) => {
    setSelectedCategory(category);
    setIsMinorPrefill(isMinor);
    setInterimPrefill(interim);
    setActiveTab('form');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compensation-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
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
                Victim Compensation & Relief Center
              </h2>
              <p className="text-xs text-slate-300">
                District Legal Services Authority (DLSA) & Central Victim Compensation Fund Schemes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/compensation"
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
              title="Open full page view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Page</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>1. How Much Compensation Can Be Given</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'form'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Form I & Document Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>3. Statutory Overview</span>
          </button>
        </div>

        {/* Tab 1: Compensation Calculator */}
        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200">
            <CompensationCalculator onApplyForCategory={handleApplyFromCalculator} />
          </div>
        )}

        {/* Tab 2: Document Application Form */}
        {activeTab === 'form' && (
          <div className="animate-in fade-in duration-200">
            <CompensationApplicationForm
              initialCategory={selectedCategory}
              initialIsMinor={isMinorPrefill}
              initialInterim={interimPrefill}
              onBackToCalculator={() => setActiveTab('calculator')}
            />
          </div>
        )}

        {/* Tab 3: Statutory Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* OVERVIEW */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Statutory Mandate
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                Section 357A of the Code of Criminal Procedure (CrPC) guarantees state financial relief.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every state government, in coordination with the Central Government, prepares statutory schemes for providing funds for compensation to victims or their dependents who have suffered loss or injury. Relief can be awarded on an interim basis even while trial proceedings are ongoing.
              </p>
            </div>

            {/* POTENTIAL SUPPORT CATEGORIES */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-1">
                Relief Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Medical & Trauma Relief
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Emergency surgical care, psychiatric treatment, and physical therapy grants.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Interim Subsistence Grants
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Immediate financial assistance sanctioned by DLSA within 14–30 days prior to judgment.
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
                    Escorted safe transit and travel stipends when attending court depositions.
                  </p>
                </div>
              </div>
            </div>

            {/* PROCESS STEPPER */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider px-1">
                4-Stage Application Process
              </h3>
              
              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
                      <span>Calculate Amount</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Determine statutory schedule range using our calculator.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                      <span>Prepare Documents</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Attach FIR copy, hospital MLC, ID proof, and bank DBT details.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
                      <span>Submit Form I</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Register claim directly with the DLSA Member Secretary.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">4</span>
                      <span>Direct Transfer</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Emergency interim funds disbursed into bank via DBT within 14–30 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Guidance */}
            <div>
              <button
                type="button"
                onClick={() => setShowDocGuidance(!showDocGuidance)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>{showDocGuidance ? 'Hide document checklist guidance' : 'View mandatory document checklist details'}</span>
                {showDocGuidance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDocGuidance && (
                <div className="mt-2.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
                  <span className="font-bold text-white block">Standard Documentation Checklist for Form I:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-300">
                    <li>Copy of First Information Report (FIR) or Court referral order</li>
                    <li>Hospital Medico-Legal Examination (MLC) or discharge summary</li>
                    <li>Proof of residence and identity (Aadhaar / Voter ID / Passport)</li>
                    <li>Bank passbook copy or cancelled cheque showing IFSC code for DBT transfer</li>
                    <li>Medical expense invoices or surgical estimates (optional, for immediate reimbursement)</li>
                  </ul>
                  <p className="text-slate-400 text-[10px] pt-1">
                    💡 Your assigned MindPulse counselor (Dr. Sarah Jenkins) can also assist you in compiling these documents.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions inside Overview */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculate Your Compensation Amount</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Application Form</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
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
              to="/compensation"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <span>Dedicated Compensation Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
