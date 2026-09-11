import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

export interface CategorySchedule {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  typicalInterimAmount: number;
  statutoryClause: string;
  processingTimeline: string;
  description: string;
  mandatoryDocuments: string[];
}

export const STATUTORY_SCHEDULES: CategorySchedule[] = [
  {
    id: 'RAPE_SEXUAL_ASSAULT',
    name: 'Rape & Aggravated Sexual Assault',
    minAmount: 400000,
    maxAmount: 700000,
    typicalInterimAmount: 100000,
    statutoryClause: 'NALSA CVCFS Schedule Item 1 / Section 357A CrPC',
    processingTimeline: 'Interim relief within 15 days of MLC/FIR; balance within 60 days',
    description: 'Mandatory statutory financial relief for physical trauma, specialized mental healthcare, and rehabilitation.',
    mandatoryDocuments: [
      'Copy of First Information Report (FIR) or Court referral order',
      'Medico-Legal Examination (MLC) report',
      'Government Identity Proof (Aadhaar / Voter ID)',
      'Bank passbook copy or cancelled cheque for Direct Benefit Transfer (DBT)',
    ],
  },
  {
    id: 'POCSO_CHILD_VICTIM',
    name: 'Child Sexual Abuse (POCSO Act)',
    minAmount: 500000,
    maxAmount: 1000000,
    typicalInterimAmount: 150000,
    statutoryClause: 'Section 33(8) POCSO Act & Special Rule 9 / NALSA POCSO Guidelines',
    processingTimeline: 'Immediate interim within 30 days ordered by Special POCSO Court',
    description: 'Special statutory fund for long-term care, therapy, safe schooling, and confidential rehabilitation of minor victims.',
    mandatoryDocuments: [
      'Copy of FIR / Special POCSO Court Complaint copy',
      'Child Age Proof (Birth Certificate / School record)',
      'Medical examination & Psychological assessment report',
      'Legal Guardian Identity & Bank Passbook for DBT',
    ],
  },
  {
    id: 'LOSS_OF_LIFE',
    name: 'Loss of Life / Homicide of Sole Breadwinner',
    minAmount: 500000,
    maxAmount: 1000000,
    typicalInterimAmount: 200000,
    statutoryClause: 'Section 357A(1) CrPC / State Victim Compensation Scheme Item 4',
    processingTimeline: 'Interim subsistence grant within 30 days; final disbursement post-inquiry',
    description: 'Livelihood restitution, dependent subsistence, and urgent stabilization for surviving dependents.',
    mandatoryDocuments: [
      'Copy of FIR and Post-Mortem Report',
      'Death Certificate of the deceased',
      'Legal Heir / Survivorship Certificate from Tehsildar or Magistrate',
      'Dependent Bank Account & Identity Proof',
    ],
  },
  {
    id: 'GRIEVOUS_HURT_PERMANENT_DISABILITY',
    name: 'Grievous Hurt & Permanent Incapacity (80%+)',
    minAmount: 300000,
    maxAmount: 600000,
    typicalInterimAmount: 100000,
    statutoryClause: 'Section 320 IPC Grievous Hurt / Section 357A CrPC',
    processingTimeline: 'Interim medical grant within 14 days; balance post-medical board review',
    description: 'Relief for surgical reconstruction, prosthetic devices, and permanent loss of earning capacity.',
    mandatoryDocuments: [
      'Copy of FIR / Police diary entry',
      'Disability Certificate from Government Medical Board / Civil Surgeon',
      'Hospital Discharge Summary & Treatment Invoices',
      'Bank Account Details for DBT',
    ],
  },
  {
    id: 'PARTIAL_DISABILITY',
    name: 'Partial Disability & Severe Bodily Injury (40%–79%)',
    minAmount: 200000,
    maxAmount: 400000,
    typicalInterimAmount: 50000,
    statutoryClause: 'Section 357A CrPC / NALSA Guidelines Item 6',
    processingTimeline: 'Disbursed within 45–60 days of application',
    description: 'Financial compensation for prolonged medical care, psychiatric recovery, and vocational rehabilitation.',
    mandatoryDocuments: [
      'Copy of FIR',
      'Hospital MLC & Treatment Bills',
      'Medical Disability Evaluation Report',
      'Bank Account Passbook / Cancelled Cheque',
    ],
  },
  {
    id: 'ACID_ATTACK',
    name: 'Acid Attack & Chemical Disfigurement',
    minAmount: 300000,
    maxAmount: 800000,
    typicalInterimAmount: 100000,
    statutoryClause: 'Supreme Court Laxmi v. UOI / Section 357B & 357C CrPC',
    processingTimeline: 'Mandatory ₹1,00,000 within 15 days for specialized surgery; balance in 60 days',
    description: 'Statutory emergency reconstructive surgery, specialized burn treatment, and long-term socio-economic support.',
    mandatoryDocuments: [
      'Copy of FIR under Section 326A / 326B IPC',
      'Medical certification of burn & disfigurement percentage',
      'Surgical treatment estimation quote from treating hospital',
      'Victim Identity & Bank details',
    ],
  },
  {
    id: 'HUMAN_TRAFFICKING',
    name: 'Rehabilitation of Victims of Human Trafficking',
    minAmount: 200000,
    maxAmount: 400000,
    typicalInterimAmount: 50000,
    statutoryClause: 'NALSA Compensation Scheme for Women / Section 357A CrPC',
    processingTimeline: 'Safe shelter subsistence within 14 days of rescue',
    description: 'Relief for safe housing, repatriation, legal advocacy, and trauma stabilization after rescue.',
    mandatoryDocuments: [
      'Rescue memo / FIR copy',
      'CWC or District Magistrate order',
      'Identity verification / Counselor report',
      'DBT Bank details',
    ],
  },
  {
    id: 'LOSS_OF_FETUS',
    name: 'Loss of Fetus / Miscarriage Caused by Assault',
    minAmount: 200000,
    maxAmount: 300000,
    typicalInterimAmount: 50000,
    statutoryClause: 'NALSA Scheme Clause 5 / Section 312-316 IPC',
    processingTimeline: 'Immediate medical grant within 15 days',
    description: 'Statutory compensation for physical harm, specialized obstetric care, and psychological counseling.',
    mandatoryDocuments: [
      'Copy of FIR',
      'Gynecological MLC / Obstetric Medical Report',
      'Identity & Residence Proof',
      'Bank Account details',
    ],
  },
];

interface CompensationCalculatorProps {
  onApplyForCategory?: (category: CategorySchedule, isMinor: boolean, interimRelief: boolean) => void;
}

export const CompensationCalculator: React.FC<CompensationCalculatorProps> = ({ onApplyForCategory }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('RAPE_SEXUAL_ASSAULT');
  const [isMinor, setIsMinor] = useState<boolean>(false);
  const [severityLevel, setSeverityLevel] = useState<'STANDARD' | 'SEVERE_DISABILITY' | 'FATALITY'>('STANDARD');
  const [requestInterim, setRequestInterim] = useState<boolean>(true);

  const selectedCategory =
    STATUTORY_SCHEDULES.find((s) => s.id === selectedCategoryId) || STATUTORY_SCHEDULES[0];

  // Calculation logic
  let baseMin = selectedCategory.minAmount;
  let baseMax = selectedCategory.maxAmount;
  let interimAmount = selectedCategory.typicalInterimAmount;

  // NALSA rule: Minors under 18 receive 50% statutory increase
  if (isMinor) {
    baseMin = Math.round(baseMin * 1.5);
    baseMax = Math.round(baseMax * 1.5);
    interimAmount = Math.round(interimAmount * 1.5);
  }

  // Severity uplift
  if (severityLevel === 'SEVERE_DISABILITY') {
    baseMin = Math.max(baseMin, 350000);
    baseMax = Math.max(baseMax, 700000);
    interimAmount = Math.max(interimAmount, 100000);
  } else if (severityLevel === 'FATALITY') {
    baseMin = Math.max(baseMin, 500000);
    baseMax = Math.max(baseMax, 1000000);
    interimAmount = Math.max(interimAmount, 200000);
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleApplyClick = () => {
    if (onApplyForCategory) {
      onApplyForCategory(selectedCategory, isMinor, requestInterim);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-200 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>Statutory Compensation Calculator & Schedule (Section 357A CrPC)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Under Indian statutory law and Central Victim Compensation Fund Schemes (CVCFS), victims or their dependents are entitled to guaranteed minimum compensation amounts regardless of whether the accused has been convicted or identified.
        </p>
      </div>

      {/* Input Controls & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Incident / Offense Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Incident / Crime Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STATUTORY_SCHEDULES.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold leading-snug">{cat.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    </div>
                    <span className="text-[11px] font-mono text-amber-400/90 font-medium">
                      Min {formatINR(cat.minAmount)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Victim Status & Severity Options */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Additional Statutory Criteria
            </h3>

            {/* Is Minor */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">
                  Victim is a Minor / Child (&lt; 18 years)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Under NALSA guidelines, compensation is enhanced by <strong>+50%</strong> for child victims.
                </span>
              </div>
            </label>

            {/* Injury Severity */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-medium text-slate-300 block">
                Injury / Disability Extent:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSeverityLevel('STANDARD')}
                  className={`p-2 rounded-xl text-center border font-medium transition-all ${
                    severityLevel === 'STANDARD'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityLevel('SEVERE_DISABILITY')}
                  className={`p-2 rounded-xl text-center border font-medium transition-all ${
                    severityLevel === 'SEVERE_DISABILITY'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  80%+ Incapacity
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityLevel('FATALITY')}
                  className={`p-2 rounded-xl text-center border font-medium transition-all ${
                    severityLevel === 'FATALITY'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fatal / Death
                </button>
              </div>
            </div>

            {/* Request Interim Relief */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-slate-800">
              <input
                type="checkbox"
                checked={requestInterim}
                onChange={(e) => setRequestInterim(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">
                  Request Immediate Interim Relief (Section 357A(6) CrPC)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Mandates early emergency payout within 14–30 days before trial concludes to cover urgent surgeries and basic living expenses.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Calculation Display (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Statutory Estimation</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                DLSA Verified
              </span>
            </div>

            {/* Total Range Hero */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Eligible Compensation Range:</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {formatINR(baseMin)} – {formatINR(baseMax)}
              </div>
              <p className="text-[11px] text-slate-400">
                Determined under {selectedCategory.statutoryClause}.
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              {requestInterim && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Interim Immediate Payout
                    </span>
                    <span className="text-[10px] text-slate-400 block">Sanctioned within 14–30 days</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-amber-300">
                    {formatINR(interimAmount)}
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/90 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-200">Balance Post-Inquiry Grant</span>
                  <span className="text-[10px] text-slate-400 block">Released by District Welfare Cell</span>
                </div>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {formatINR(baseMax - (requestInterim ? interimAmount : 0))}
                </span>
              </div>
            </div>

            {/* Processing Timeline Notice */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs text-slate-300">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Statutory Timeline:
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedCategory.processingTimeline}
              </p>
            </div>

            {/* Action Button: Apply with these values */}
            {onApplyForCategory && (
              <button
                type="button"
                onClick={handleApplyClick}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all"
              >
                <span>Proceed to Form & Upload Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Notice */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Compensation awarded under Section 357A CrPC does not affect any separate award granted under civil suits or Motor Accident Claims Tribunals (MACT).
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Documents Checklist for Selected Category */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>Actual Documents Required for {selectedCategory.name}</span>
          </h3>
          <span className="text-[11px] text-amber-400 font-medium">
            {selectedCategory.mandatoryDocuments.length} mandatory documents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {selectedCategory.mandatoryDocuments.map((doc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5">
                {idx + 1}
              </div>
              <span className="leading-snug">{doc}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 pt-1">
          💡 You can upload these documents directly in the application form below. If any document is pending (e.g. medical board report), interim relief can still be initiated based on the initial FIR and hospital discharge memo.
        </p>
      </div>
    </div>
  );
};
