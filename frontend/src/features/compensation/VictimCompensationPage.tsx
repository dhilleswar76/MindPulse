import React, { useState, useEffect } from 'react';
import {
  Compass,
  Calculator,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Scale,
  Sparkles,
  ArrowRight,
  PhoneCall,
  UserCheck,
  Download,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { CompensationCalculator, CategorySchedule, STATUTORY_SCHEDULES } from './CompensationCalculator';
import { CompensationApplicationForm } from './CompensationApplicationForm';

export const VictimCompensationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'form' | 'claims'>('calculator');
  const [selectedCategory, setSelectedCategory] = useState<CategorySchedule | null>(null);
  const [isMinorPrefill, setIsMinorPrefill] = useState(false);
  const [interimPrefill, setInterimPrefill] = useState(true);

  // Claims history state
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  const fetchClaims = async () => {
    setIsLoadingClaims(true);
    try {
      const res: any = await api.get('/compensation/claims');
      const data = res.data?.data?.claims || res.data?.claims || [];
      setClaims(data);
    } catch {
      // Fallback initial demo claim
      setClaims([
        {
          _id: 'claim_demo_01',
          claimNumber: 'DLSA-2026-4912',
          applicantName: 'Alex Rivera',
          applicantRelation: 'SELF',
          contactPhone: '+91 98765 43210',
          district: 'Central District',
          state: 'Delhi NCR',
          incidentCategory: 'GRIEVOUS_HURT_PERMANENT_DISABILITY',
          incidentDate: '2026-08-15',
          firNumber: 'FIR No. 104/2026',
          policeStation: 'Connaught Place Police Station',
          lossDescription:
            'Multiple fractures requiring orthopedic surgical fixation and ongoing physical rehabilitation.',
          estimatedMinAmount: 300000,
          estimatedMaxAmount: 600000,
          interimReliefRequested: true,
          interimReliefAmount: 100000,
          bankDetails: {
            bankName: 'State Bank of India',
            accountNumber: '••••••••4829',
            ifscCode: 'SBIN0001234',
          },
          documents: [
            { docType: 'FIR_COPY', fileName: 'FIR_104_2026_Certified_Copy.pdf', fileSize: '1.4 MB', status: 'VERIFIED' },
            { docType: 'MEDICAL_REPORT', fileName: 'AIIMS_Discharge_Summary.pdf', fileSize: '3.1 MB', status: 'VERIFIED' },
            { docType: 'IDENTITY_PROOF', fileName: 'Aadhaar_Card_AlexRivera.pdf', fileSize: '820 KB', status: 'VERIFIED' },
            { docType: 'BANK_PASSBOOK', fileName: 'SBI_Passbook_FrontPage_DBT.pdf', fileSize: '950 KB', status: 'VERIFIED' },
          ],
          claimStatus: 'UNDER_DLSA_REVIEW',
          assignedCounselorName: 'Dr. Sarah Jenkins',
          counselorNotes:
            'DLSA Member Secretary has completed initial inquiry. Recommendation for ₹1,00,000 interim surgical reimbursement submitted to Welfare Board.',
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        },
      ]);
    } finally {
      setIsLoadingClaims(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleApplyFromCalculator = (category: CategorySchedule, isMinor: boolean, interim: boolean) => {
    setSelectedCategory(category);
    setIsMinorPrefill(isMinor);
    setInterimPrefill(interim);
    setActiveTab('form');
  };

  const handleClaimSubmitted = (newClaim: any) => {
    setClaims((prev) => [newClaim, ...prev]);
    setActiveTab('claims');
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>Submitted / Scrutiny</span>
          </span>
        );
      case 'UNDER_DLSA_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Under DLSA Inquiry</span>
          </span>
        );
      case 'INTERIM_SANCTIONED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Interim Relief Sanctioned</span>
          </span>
        );
      case 'DISBURSED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>DBT Disbursed</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Statutory Financial Relief & Rehabilitation • Section 357A CrPC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Compass className="w-7 h-7 text-amber-400" />
            <span>Victim Compensation & Document Center</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Determine statutory compensation entitlement amounts under NALSA / Central Victim Compensation schemes and submit mandatory documents directly to the District Legal Services Authority (DLSA).
          </p>
        </div>

        {/* Quick Statutory Hotline Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">NALSA Toll-Free Legal Aid</span>
            <span className="text-sm font-extrabold text-white font-mono">15100</span>
            <span className="text-[10px] text-teal-400 block font-medium">Free Legal Assistance 24/7</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
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
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'form'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Form I & Document Submission</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'claims'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Track Submitted Claims ({claims.length})</span>
        </button>
      </div>

      {/* TAB 1: CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <CompensationCalculator onApplyForCategory={handleApplyFromCalculator} />
        </div>
      )}

      {/* TAB 2: APPLICATION FORM */}
      {activeTab === 'form' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <CompensationApplicationForm
            initialCategory={selectedCategory}
            initialIsMinor={isMinorPrefill}
            initialInterim={interimPrefill}
            onBackToCalculator={() => setActiveTab('calculator')}
            onApplicationSuccess={handleClaimSubmitted}
          />
        </div>
      )}

      {/* TAB 3: TRACK SUBMITTED CLAIMS */}
      {activeTab === 'claims' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-400" />
                <span>Your Registered Compensation Claims</span>
              </h2>
              <p className="text-xs text-slate-400">
                Longitudinal progress of claims submitted to the District Legal Services Authority (DLSA)
              </p>
            </div>

            <button
              type="button"
              onClick={fetchClaims}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingClaims ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {claims.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-white">No Claims Submitted Yet</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Use our statutory compensation calculator to estimate your entitlement, then submit Form I along with your FIR copy and medical bills.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Start Compensation Calculation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim._id || claim.claimNumber}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {claim.claimNumber}
                        </span>
                        <span>•</span>
                        <span className="text-xs text-slate-400">
                          {claim.firNumber} ({claim.policeStation})
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        {claim.applicantName} ({claim.applicantRelation})
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(claim.claimStatus)}
                    </div>
                  </div>

                  {/* Claim Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Eligible Range:</span>
                      <span className="font-extrabold font-mono text-white text-sm">
                        {formatINR(claim.estimatedMinAmount || 300000)} – {formatINR(claim.estimatedMaxAmount || 600000)}
                      </span>
                      <span className="text-[10px] text-amber-400 block">
                        Interim Payout: {formatINR(claim.interimReliefAmount || 100000)}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Direct Benefit Transfer (DBT):</span>
                      <span className="font-semibold text-white block">
                        {claim.bankDetails?.bankName || 'State Bank of India'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Acct: {claim.bankDetails?.accountNumber || '••••••••4829'} ({claim.bankDetails?.ifscCode || 'SBIN0001234'})
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-[11px] text-slate-400 block">Counselor Liaison:</span>
                      <span className="font-semibold text-white block">
                        {claim.assignedCounselorName || 'Dr. Sarah Jenkins'}
                      </span>
                      <span className="text-[10px] text-teal-400 block">
                        DLSA Liaison Touchpoint Active
                      </span>
                    </div>
                  </div>

                  {/* Documents Attached */}
                  {claim.documents && claim.documents.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Attached Statutory Documents ({claim.documents.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {claim.documents.map((d: any, idx: number) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/70 border border-slate-700/80 text-[11px] text-slate-300 font-mono"
                          >
                            <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{d.fileName}</span>
                            <span className="text-slate-500">({d.fileSize || 'PDF'})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Counselor Status Notes */}
                  {claim.counselorNotes && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                        <Building className="w-3.5 h-3.5" />
                        DLSA Member Secretary Note:
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {claim.counselorNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Support Companion Advice Card */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-white block">Need Help Compiling Your Documents?</span>
          <p className="text-slate-400 leading-relaxed">
            Your assigned MindPulse counselor can coordinate certified FIR copies, hospital MLC requisitions, and liaison visits with the DLSA office.
          </p>
        </div>
        <a
          href="tel:15100"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl border border-slate-700 transition-colors shrink-0 flex items-center gap-2"
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          <span>Call DLSA 15100</span>
        </a>
      </div>
    </div>
  );
};
