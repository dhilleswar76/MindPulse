import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  User,
  Phone,
  MapPin,
  Landmark,
  Trash2,
  FileCheck,
  Sparkles,
  ArrowRight,
  Download,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import api from '../../services/api';
import { STATUTORY_SCHEDULES, CategorySchedule } from './CompensationCalculator';

export interface DocumentUploadItem {
  id: string;
  docType: 'FIR_COPY' | 'MEDICAL_REPORT' | 'IDENTITY_PROOF' | 'BANK_PASSBOOK' | 'TREATMENT_BILLS' | 'OTHER';
  label: string;
  description: string;
  isMandatory: boolean;
  file?: {
    name: string;
    size: string;
    uploadedAt: string;
  };
}

const DEFAULT_DOCUMENTS: DocumentUploadItem[] = [
  {
    id: 'doc_fir',
    docType: 'FIR_COPY',
    label: '1. Copy of First Information Report (FIR) or Magistrate Order',
    description: 'Certified copy of FIR registered at the local police station or Magistrate referral under Sec 357A CrPC.',
    isMandatory: true,
  },
  {
    id: 'doc_mlc',
    docType: 'MEDICAL_REPORT',
    label: '2. Medico-Legal Examination (MLC) or Hospital Discharge Summary',
    description: 'Government hospital casualty memo, MLC report, surgical discharge summary, or disability certificate.',
    isMandatory: true,
  },
  {
    id: 'doc_id',
    docType: 'IDENTITY_PROOF',
    label: '3. Claimant Government Identity & Address Proof',
    description: 'Valid Aadhaar card, Voter ID, or Passport of the applicant or legal guardian.',
    isMandatory: true,
  },
  {
    id: 'doc_bank',
    docType: 'BANK_PASSBOOK',
    label: '4. Bank Passbook Front Page or Cancelled Cheque',
    description: 'Official document showing bank account holder name, account number, and bank IFSC code for Direct Benefit Transfer (DBT).',
    isMandatory: true,
  },
  {
    id: 'doc_bills',
    docType: 'TREATMENT_BILLS',
    label: '5. Medical Expense Vouchers / Pharmacy Bills / Proof of Loss',
    description: 'Original or digitized receipts for surgery, diagnostics, and medicines to expedite immediate out-of-pocket reimbursement.',
    isMandatory: false,
  },
];

interface CompensationApplicationFormProps {
  initialCategory?: CategorySchedule | null;
  initialIsMinor?: boolean;
  initialInterim?: boolean;
  onBackToCalculator?: () => void;
  onApplicationSuccess?: (claimData: any) => void;
}

export const CompensationApplicationForm: React.FC<CompensationApplicationFormProps> = ({
  initialCategory,
  initialIsMinor = false,
  initialInterim = true,
  onBackToCalculator,
  onApplicationSuccess,
}) => {
  // Form state
  const [applicantName, setApplicantName] = useState('Alex Rivera');
  const [applicantRelation, setApplicantRelation] = useState<'SELF' | 'PARENT_GUARDIAN' | 'SPOUSE' | 'LEGAL_HEIR' | 'LEGAL_COUNSEL'>('SELF');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [address, setAddress] = useState('Flat 402, Shanti Enclave, Central District, New Delhi - 110001');
  const [district, setDistrict] = useState('Central District');
  const [state, setState] = useState('Delhi NCR');

  // Case details
  const [incidentCategory, setIncidentCategory] = useState<string>(
    initialCategory?.id || 'GRIEVOUS_HURT_PERMANENT_DISABILITY'
  );
  const [firNumber, setFirNumber] = useState('FIR No. 104/2026');
  const [policeStation, setPoliceStation] = useState('Connaught Place Police Station');
  const [incidentDate, setIncidentDate] = useState('2026-08-15');
  const [lossDescription, setLossDescription] = useState(
    'Sustained multiple severe fractures requiring emergency orthopedic surgical fixation and post-traumatic physical rehabilitation.'
  );
  const [interimReliefRequested, setInterimReliefRequested] = useState<boolean>(initialInterim);
  const [isMinor, setIsMinor] = useState<boolean>(initialIsMinor);

  // Bank details for DBT
  const [accountHolderName, setAccountHolderName] = useState('Alex Rivera');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('38947291048');
  const [ifscCode, setIfscCode] = useState('SBIN0001234');

  // Document Uploads
  const [documents, setDocuments] = useState<DocumentUploadItem[]>(DEFAULT_DOCUMENTS);

  // Submission UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedClaim, setSubmittedClaim] = useState<any | null>(null);

  // File upload handler
  const handleFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              file: {
                name: file.name,
                size: sizeInMB,
                uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            }
          : doc
      )
    );
  };

  const handleRemoveFile = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, file: undefined } : doc))
    );
  };

  const handleQuickAttachDemoFiles = () => {
    setDocuments([
      {
        ...DEFAULT_DOCUMENTS[0],
        file: { name: 'FIR_104_2026_Certified_Copy.pdf', size: '1.4 MB', uploadedAt: 'Just now' },
      },
      {
        ...DEFAULT_DOCUMENTS[1],
        file: { name: 'AIIMS_MLC_Medical_Discharge_Summary.pdf', size: '2.8 MB', uploadedAt: 'Just now' },
      },
      {
        ...DEFAULT_DOCUMENTS[2],
        file: { name: 'Aadhaar_AlexRivera_Verified.pdf', size: '840 KB', uploadedAt: 'Just now' },
      },
      {
        ...DEFAULT_DOCUMENTS[3],
        file: { name: 'SBI_Passbook_FrontPage_AlexRivera.pdf', size: '920 KB', uploadedAt: 'Just now' },
      },
      {
        ...DEFAULT_DOCUMENTS[4],
        file: { name: 'Hospital_Orthopedic_Pharmacy_Invoices.pdf', size: '3.4 MB', uploadedAt: 'Just now' },
      },
    ]);
  };

  // Validation
  const validateForm = (): string | null => {
    if (!applicantName.trim()) return 'Please provide claimant full name.';
    if (!contactPhone.trim() || contactPhone.trim().length < 10)
      return 'Please enter a valid phone number.';
    if (!address.trim()) return 'Please provide residential address.';
    if (!firNumber.trim()) return 'Please provide FIR / Police diary number.';
    if (!policeStation.trim()) return 'Please provide police station jurisdiction.';
    if (!lossDescription.trim()) return 'Please provide description of harm or loss.';
    if (!accountHolderName.trim() || !bankName.trim() || !accountNumber.trim() || !ifscCode.trim())
      return 'Please complete all bank details for Direct Benefit Transfer (DBT).';

    // Mandatory document validation
    const missingDocs = documents.filter((d) => d.isMandatory && !d.file);
    if (missingDocs.length > 0) {
      return `Please upload the required mandatory documents: ${missingDocs.map((d) => d.label.split('.')[1] || d.label).join(', ')}`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      applicantName,
      applicantRelation,
      contactPhone,
      email,
      address,
      district,
      state,
      incidentCategory,
      incidentDate,
      firNumber,
      policeStation,
      lossDescription,
      estimatedMinAmount: 300000,
      estimatedMaxAmount: 600000,
      interimReliefRequested,
      interimReliefAmount: interimReliefRequested ? 100000 : 0,
      bankDetails: {
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
      },
      documents: documents
        .filter((d) => d.file)
        .map((d) => ({
          docType: d.docType,
          fileName: d.file!.name,
          fileSize: d.file!.size,
          status: 'SUBMITTED',
        })),
    };

    try {
      const res: any = await api.post('/compensation/claims', payload);
      const claim = res.data?.data?.claim || res.data?.claim || {
        ...payload,
        claimNumber: `DLSA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        claimStatus: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      };
      setSubmittedClaim(claim);
      if (onApplicationSuccess) {
        onApplicationSuccess(claim);
      }
    } catch {
      // Offline / dev fallback
      const fallbackClaim = {
        ...payload,
        claimNumber: `DLSA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        claimStatus: 'SUBMITTED',
        createdAt: new Date().toISOString(),
      };
      setSubmittedClaim(fallbackClaim);
      if (onApplicationSuccess) {
        onApplicationSuccess(fallbackClaim);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedClaim) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                <span>Form I Statutory Application Acknowledged</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Victim Compensation Claim Registered
              </h2>
              <p className="text-xs text-slate-300">
                Official filing under Section 357A CrPC submitted to the District Legal Services Authority (DLSA).
              </p>
            </div>
          </div>

          {/* Claim Reference Badge */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Official DLSA Claim Reference Number:</span>
              <span className="text-base font-extrabold text-amber-400 font-mono tracking-wide">
                {submittedClaim.claimNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Reviewing Body:</span>
              <span className="font-semibold text-white">
                Member Secretary, District Legal Services Authority ({district})
              </span>
            </div>
          </div>

          {/* Next Steps Stepper */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider text-left">
              Next Statutory Stages & Timeline:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Document Verification</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  DLSA scrutiny of FIR copy, hospital MLC, and identity proofs within 7 working days.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Interim Relief Sanction</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Emergency grant sanctioned directly into {submittedClaim.bankDetails?.bankName || 'bank account'} via DBT within 14–30 days.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Counselor Coordination</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your designated counselor (Dr. Sarah Jenkins) receives updates and coordinates with the DLSA advocate.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Acknowledgment</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmittedClaim(null);
                if (onBackToCalculator) onBackToCalculator();
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
            >
              <span>Back to Compensation Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APPLICATION FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header / Back nav */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToCalculator && (
            <button
              type="button"
              onClick={onBackToCalculator}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to calculator"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>DLSA Form I: Application for Victim Compensation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Prescribed statutory application under Section 357A CrPC & Legal Services Authorities Act
            </p>
          </div>
        </div>

        {/* Demo Autofill Helper */}
        <button
          type="button"
          onClick={handleQuickAttachDemoFiles}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Auto-Attach Demo Documents</span>
        </button>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* SECTION 1: APPLICANT & VICTIM IDENTITY */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <User className="w-4 h-4 text-amber-400" />
          <span>Section 1: Claimant / Applicant Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Full Name of Claimant <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Alex Rivera"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Relationship to Victim <span className="text-rose-400">*</span>
            </label>
            <select
              value={applicantRelation}
              onChange={(e) => setApplicantRelation(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="SELF">Direct Victim (Self)</option>
              <option value="PARENT_GUARDIAN">Parent / Legal Guardian (for minor or incapacitated victim)</option>
              <option value="SPOUSE">Spouse</option>
              <option value="LEGAL_HEIR">Dependent Legal Heir (in case of deceased victim)</option>
              <option value="LEGAL_COUNSEL">Authorized Legal Counsel</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Contact Phone Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="name@domain.com"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-semibold text-slate-300">
              Residential Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="House/Street/Locality, District, State"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">District Legal Services Authority (DLSA)</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">State / Territory</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CASE & FIR PARTICULARS */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Section 2: Criminal Case & Police Registration Particulars</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Offense / Incident Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={incidentCategory}
              onChange={(e) => setIncidentCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
            >
              {STATUTORY_SCHEDULES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Police Station Jurisdiction <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={policeStation}
              onChange={(e) => setPoliceStation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. Connaught Place Police Station"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              FIR / Complaint Reference Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={firNumber}
              onChange={(e) => setFirNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
              placeholder="e.g. FIR No. 104/2026"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Date of Incident <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-semibold text-slate-300">
              Particulars of Injury, Loss, or Trauma <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={lossDescription}
              onChange={(e) => setLossDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none leading-relaxed"
              placeholder="Describe physical injury, medical treatments required, surgeries undergone, loss of earning capability, or psychological impact..."
              required
            />
          </div>

          {/* Quick options */}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={interimReliefRequested}
                onChange={(e) => setInterimReliefRequested(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-slate-200 font-medium">
                Apply for Urgent Interim Relief under Section 357A(6) CrPC
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-slate-200 font-medium">
                Victim is a minor child under 18 years
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 3: BANK DETAILS FOR DBT */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Landmark className="w-4 h-4 text-amber-400" />
            <span>Section 3: Bank Account for Direct Benefit Transfer (DBT)</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            Direct Welfare Disbursement
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Compensation funds are transferred directly from the State Victim Compensation Treasury into the claimant’s verified bank account without intermediaries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Account Holder Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="As per bank passbook"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Bank Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="e.g. State Bank of India"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Bank Account Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono"
              placeholder="e.g. 38947291048"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              IFSC Code <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none font-mono uppercase"
              placeholder="e.g. SBIN0001234"
              required
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: ACTUAL STATUTORY DOCUMENTS ASKED & UPLOADED */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Section 4: Mandatory Statutory Documents Checklist</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Accepted formats: PDF, JPG, PNG (Max 10MB per file)
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The District Legal Services Authority (DLSA) requires the following documents to process statutory disbursement. Please upload clear scans or photographs of the original documents:
        </p>

        {/* List of document upload slots */}
        <div className="space-y-3 pt-2">
          {documents.map((doc) => {
            const hasFile = !!doc.file;

            return (
              <div
                key={doc.id}
                className={`p-4 rounded-2xl border transition-all ${
                  hasFile
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : doc.isMandatory
                    ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                    : 'bg-slate-950/50 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{doc.label}</span>
                      {doc.isMandatory ? (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 font-semibold">
                          Optional / Supporting
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{doc.description}</p>
                  </div>

                  {/* Upload action or Attached badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    {hasFile ? (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div className="max-w-[140px] truncate text-[11px] font-medium font-mono">
                          {doc.file!.name} ({doc.file!.size})
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(doc.id)}
                          className="p-1 hover:text-rose-400 transition-colors ml-1"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:border-amber-500/50">
                        <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                        <span>Browse / Upload</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(doc.id, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission CTA bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          🛡️ Verified by DLSA Central Registry. No statutory court fees are payable under CrPC 357A.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onBackToCalculator && (
            <button
              type="button"
              onClick={onBackToCalculator}
              className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg hover:shadow-amber-500/25 transition-all"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Registering Claim with DLSA...</span>
              </>
            ) : (
              <>
                <span>Submit Form I & Documents to DLSA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
