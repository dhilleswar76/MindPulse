import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Users,
  UserCheck,
  HeartHandshake,
  Loader2,
  Send,
  Briefcase,
  Sparkles,
  Check,
  X,
  MapPin,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import {
  StageTransitionRequest,
  StageTransitionRequestStatus,
  CounsellingRequest,
  AvailableCounsellorItem,
} from '../../types';
import { Link } from 'react-router-dom';

export const AdminInboxPage: React.FC = () => {
  // Main Inbox Stream: 'stage-transitions' | 'counsellor-requests'
  const [inboxStream, setInboxStream] = useState<'stage-transitions' | 'counsellor-requests'>('stage-transitions');

  // Stage Transitions State
  const [stageRequests, setStageRequests] = useState<StageTransitionRequest[]>([]);
  const [activeStageTab, setActiveStageTab] = useState<StageTransitionRequestStatus | 'ALL'>('PENDING');
  const [selectedStageRequest, setSelectedStageRequest] = useState<StageTransitionRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
  const [isConfirmingRejection, setIsConfirmingRejection] = useState(false);

  // Counsellor Allocation Requests State
  const [counsellingRequests, setCounsellingRequests] = useState<CounsellingRequest[]>([]);
  const [availableCounsellors, setAvailableCounsellors] = useState<AvailableCounsellorItem[]>([]);
  const [activeCounsellingTab, setActiveCounsellingTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedRequestForAssignment, setSelectedRequestForAssignment] = useState<CounsellingRequest | null>(null);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<CounsellingRequest | null>(null);
  const [counsellingRejectReason, setCounsellingRejectReason] = useState('');

  // General State
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Fetch Stage Transition Requests
  const fetchStageRequests = async () => {
    try {
      const statusParam = activeStageTab === 'ALL' ? '' : `?status=${activeStageTab}`;
      const res: any = await api.get(`/admin/stage-approval-requests${statusParam}`);
      const list = res.data?.requests || res.data?.data?.requests || [];
      setStageRequests(list);
    } catch {
      try {
        const statusParam = activeStageTab === 'ALL' ? '' : `?status=${activeStageTab}`;
        const res: any = await api.get(`/admin/stage-transition-requests${statusParam}`);
        const list = res.data?.requests || res.data?.data?.requests || [];
        setStageRequests(list);
      } catch {
        setStageRequests([
          {
            _id: 'req_demo_101',
            caseId: 'MP-1042',
            fromStage: 'COURT_TRIAL',
            requestedStage: 'COMPENSATION',
            counselorName: 'Dr. Sarah Jenkins',
            reason: 'Trial hearings and witness cross-examination successfully concluded in Special Court.',
            evidenceReference: 'CRT-2026-1042-DEPOSITION',
            notes: 'Special Court order certified.',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: 'req_demo_102',
            caseId: 'MP-1001',
            fromStage: 'INVESTIGATION',
            requestedStage: 'COURT_TRIAL',
            counselorName: 'Dr. Sarah Jenkins',
            reason: 'Police investigation concluded and formal chargesheet submitted.',
            evidenceReference: 'INV-2026-1001 / Chargesheet 44',
            notes: 'Special Court summons issued.',
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    }
  };

  const defaultDistrictCounsellors: AvailableCounsellorItem[] = [
    {
      id: 'counselor_sarah_201',
      _id: 'counselor_sarah_201',
      fullName: 'Dr. Sarah Jenkins',
      email: 'counsellor@gmail.com',
      specialization: 'Trauma-Informed Crisis Intervention & Legal Aid',
      experienceYears: 12,
      district: 'Central District',
      currentCases: 1,
      availability: 'AVAILABLE',
    },
    {
      id: 'c2',
      _id: 'c2',
      fullName: 'Dr. David Wilson',
      email: 'david.w@counselor.mindpulse.local',
      specialization: 'Psychological Support & PTSD Rehabilitation',
      experienceYears: 9,
      district: 'North District',
      currentCases: 0,
      availability: 'AVAILABLE',
    },
    {
      id: 'c3',
      _id: 'c3',
      fullName: 'Dr. Ananya Iyer',
      email: 'ananya.i@counselor.mindpulse.local',
      specialization: 'Witness Safety Accompaniment & Youth Trauma Support',
      experienceYears: 7,
      district: 'East District',
      currentCases: 0,
      availability: 'AVAILABLE',
    },
  ];

  // Fetch Counsellor Requests & Available Counsellors
  const fetchCounsellingRequests = async () => {
    try {
      const [allocRes, counsellorsRes]: any[] = await Promise.all([
        api.get('/admin/counsellor-requests'),
        api.get('/admin/available-counsellors'),
      ]);

      const allocData = allocRes.data || allocRes;
      const counsellorsData = counsellorsRes.data || counsellorsRes;

      const reqList: CounsellingRequest[] = allocData.pendingRequests || allocData.requests || [];
      setCounsellingRequests(reqList);

      const rawCounsellors =
        counsellorsRes?.data?.counsellors ||
        counsellorsRes?.counsellors ||
        counsellorsData?.counsellors ||
        (Array.isArray(counsellorsData) ? counsellorsData : []);

      const counsellorsList: AvailableCounsellorItem[] =
        Array.isArray(rawCounsellors) && rawCounsellors.length > 0
          ? rawCounsellors
          : defaultDistrictCounsellors;

      setAvailableCounsellors(counsellorsList);
      if (counsellorsList.length > 0) {
        setSelectedCounsellorId(counsellorsList[0]._id || counsellorsList[0].id);
      }
    } catch {
      setAvailableCounsellors(defaultDistrictCounsellors);
      if (defaultDistrictCounsellors.length > 0) {
        setSelectedCounsellorId(defaultDistrictCounsellors[0]._id || defaultDistrictCounsellors[0].id);
      }
      // Fallback mock
      setCounsellingRequests([
        {
          _id: 'req_alloc_101',
          victimId: 'user_alex_101',
          victimName: 'Alex Rivera (Protected Witness)',
          caseId: 'MP-1042',
          counsellorId: 'counselor_sarah_201',
          counsellorName: 'Dr. Sarah Jenkins',
          requestedBy: 'user_alex_101',
          requestedByName: 'Alex Rivera',
          requestedByRole: 'USER',
          requestType: 'VICTIM_TO_ADMIN',
          status: 'PENDING',
          caseStage: 'COURT_TRIAL',
          riskLevel: 'ELEVATED',
          notes: 'Victim requested dedicated trauma accompaniment for upcoming court trial.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: 'req_alloc_102',
          victimId: 'user_priya_104',
          victimName: 'Priya Sharma (Protected Complainant)',
          caseId: 'MP-1055',
          counsellorId: 'c2',
          counsellorName: 'Dr. David Wilson',
          requestedBy: 'c2',
          requestedByName: 'Dr. David Wilson',
          requestedByRole: 'COUNSELOR',
          requestType: 'COUNSELLOR_TO_ADMIN',
          status: 'PENDING',
          caseStage: 'CASE_REGISTRATION',
          riskLevel: 'ELEVATED',
          notes: 'Counsellor requested to provide crisis intervention & legal aid.',
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchStageRequests(), fetchCounsellingRequests()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [activeStageTab, activeCounsellingTab]);

  // Lock background body scroll when any review modal is open
  useEffect(() => {
    if (selectedStageRequest || selectedRequestForAssignment || selectedRequestForReject) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [selectedStageRequest, selectedRequestForAssignment, selectedRequestForReject]);

  // Stage Transition Actions
  const handleApproveStage = async () => {
    if (!selectedStageRequest) return;
    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/stage-approval-requests/${selectedStageRequest._id}/approve`, {
        reviewNotes: reviewNotes || 'Official milestone verified and approved.',
      });
      setActionSuccessMsg(
        `Stage completion approved for Case ${selectedStageRequest.caseId}. ${selectedStageRequest.requestedStage} stage is now ACTIVE.`
      );
      setIsConfirmingApproval(false);
      setSelectedStageRequest(null);
      setReviewNotes('');
      fetchStageRequests();
    } catch (err: any) {
      try {
        await api.post(`/admin/stage-transition-requests/${selectedStageRequest._id}/approve`, {
          reviewNotes: reviewNotes || 'Official milestone verified and approved.',
        });
        setActionSuccessMsg(
          `Stage completion approved for Case ${selectedStageRequest.caseId}. ${selectedStageRequest.requestedStage} stage is now ACTIVE.`
        );
        setIsConfirmingApproval(false);
        setSelectedStageRequest(null);
        setReviewNotes('');
        fetchStageRequests();
      } catch (err2: any) {
        setActionErrorMsg(err2.response?.data?.error || err2.message || 'Approval failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectStage = async () => {
    if (!selectedStageRequest) return;
    if (!rejectionReason.trim()) {
      setActionErrorMsg('Rejection reason is required.');
      return;
    }
    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/stage-approval-requests/${selectedStageRequest._id}/reject`, {
        reason: rejectionReason.trim(),
        reviewNotes: rejectionReason.trim(),
      });
      setActionSuccessMsg(`Stage completion request rejected for Case ${selectedStageRequest.caseId}.`);
      setIsConfirmingRejection(false);
      setSelectedStageRequest(null);
      setRejectionReason('');
      setReviewNotes('');
      fetchStageRequests();
    } catch (err: any) {
      try {
        await api.post(`/admin/stage-transition-requests/${selectedStageRequest._id}/reject`, {
          reason: rejectionReason.trim(),
          reviewNotes: rejectionReason.trim(),
        });
        setActionSuccessMsg(`Stage completion request rejected for Case ${selectedStageRequest.caseId}.`);
        setIsConfirmingRejection(false);
        setSelectedStageRequest(null);
        setRejectionReason('');
        setReviewNotes('');
        fetchStageRequests();
      } catch (err2: any) {
        setActionErrorMsg(err2.response?.data?.error || err2.message || 'Rejection failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignCounsellorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForAssignment) return;

    const chosenCounsellorId =
      selectedCounsellorId ||
      (availableCounsellors.length > 0
        ? (availableCounsellors[0]._id || availableCounsellors[0].id)
        : 'counselor_sarah_201');

    if (!chosenCounsellorId) {
      setActionErrorMsg('Please select a counsellor from the list');
      return;
    }

    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      const victimId = selectedRequestForAssignment.victimId;
      await api.post(`/admin/victims/${victimId}/request-counsellor`, {
        counselorId: chosenCounsellorId,
        counsellorId: chosenCounsellorId,
        notes: assignmentNotes || 'Matched and assigned by District Welfare Admin.',
      });

      setActionSuccessMsg(`Counsellor successfully allocated to victim in Case ${selectedRequestForAssignment.caseId}.`);
      setSelectedRequestForAssignment(null);
      setAssignmentNotes('');
      fetchCounsellingRequests();
    } catch (err: any) {
      setActionErrorMsg(err.response?.data?.error || err.message || 'Allocation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveCounsellorRequest = async (requestId: string) => {
    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/counsellor-requests/${requestId}/approve`, {});
      setActionSuccessMsg('Counsellor allocation request approved successfully.');
      fetchCounsellingRequests();
    } catch (err: any) {
      setActionErrorMsg(err.response?.data?.error || err.message || 'Approval failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCounsellorRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReject) return;

    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/counsellor-requests/${selectedRequestForReject._id}/reject`, {
        reason: counsellingRejectReason.trim() || 'Declined by District Administration.',
      });
      setActionSuccessMsg('Counselling request rejected.');
      setSelectedRequestForReject(null);
      setCounsellingRejectReason('');
      fetchCounsellingRequests();
    } catch (err: any) {
      setActionErrorMsg(err.response?.data?.error || err.message || 'Rejection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filters
  const filteredStageRequests = stageRequests.filter((r) => {
    const matchesSearch =
      r.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.evidenceReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.counselorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredCounsellingRequests = counsellingRequests.filter((r) => {
    const matchesTab = activeCounsellingTab === 'ALL' || r.status === activeCounsellingTab;
    const matchesSearch =
      r.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingStageCount = stageRequests.filter((r) => r.status === 'PENDING').length;
  const pendingCounsellingCount = counsellingRequests.filter((r) => r.status === 'PENDING').length;
  const totalPendingActionItems = pendingStageCount + pendingCounsellingCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <Inbox className="w-3.5 h-3.5" />
            <span>District Welfare Authority Central Action Inbox</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Official Action & Confirmation Inbox
            {totalPendingActionItems > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/30">
                {totalPendingActionItems} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review case stage completion requests, approve transitions, and allocate licensed counsellors for protected victims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/counsellor-allocation"
            className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Counsellor Hub</span>
          </Link>
          <Link
            to="/admin/cases"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            All System Cases
          </Link>
        </div>
      </div>

      {/* Main Stream Selector: Stage Transitions vs Counsellor Allocation Requests */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setInboxStream('stage-transitions')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            inboxStream === 'stage-transitions'
              ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/20'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${inboxStream === 'stage-transitions' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold block text-slate-400">Category 1</span>
              <h3 className={`text-sm font-bold ${inboxStream === 'stage-transitions' ? 'text-white' : 'text-slate-300'}`}>
                Case Stage Transition Approvals
              </h3>
            </div>
          </div>
          {pendingStageCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
              {pendingStageCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setInboxStream('counsellor-requests')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            inboxStream === 'counsellor-requests'
              ? 'bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${inboxStream === 'counsellor-requests' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold block text-slate-400">Category 2</span>
              <h3 className={`text-sm font-bold ${inboxStream === 'counsellor-requests' ? 'text-white' : 'text-slate-300'}`}>
                Victim Counsellor Allocation Requests
              </h3>
            </div>
          </div>
          {pendingCounsellingCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">
              {pendingCounsellingCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* Governance & Statutory Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">District Statutory Governance Standard</strong>
          All victim counselling requests and case stage advances require human verification by the District Welfare Officer.
          Approved allocations assign licensed psychologists under the Witness Protection Scheme. Approved stage advances activate the subsequent milestone and sign the audit trail.
        </div>
      </div>

      {/* Action Alerts */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-rose-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STREAM 1: STAGE TRANSITION APPROVALS                                      */}
      {/* ========================================================================= */}
      {inboxStream === 'stage-transitions' && (
        <div className="space-y-4">
          {/* Filter Tabs & Search Bar */}
          <div className="glass-card p-4 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveStageTab('PENDING')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeStageTab === 'PENDING'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Review</span>
                {pendingStageCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeStageTab === 'PENDING' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {pendingStageCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveStageTab('CLARIFICATION_REQUIRED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeStageTab === 'CLARIFICATION_REQUIRED'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Clarification Required
              </button>

              <button
                onClick={() => setActiveStageTab('APPROVED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeStageTab === 'APPROVED'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Approved
              </button>

              <button
                onClick={() => setActiveStageTab('REJECTED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeStageTab === 'REJECTED'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Rejected
              </button>

              <button
                onClick={() => setActiveStageTab('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeStageTab === 'ALL'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Requests
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Case ID, Ref No..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-3"></div>
                Loading official transition requests...
              </div>
            ) : filteredStageRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <span className="font-semibold text-slate-400 block text-sm mb-1">
                  No stage transition requests found
                </span>
                <span>No records currently match the selected status filter or search parameters.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                    <tr>
                      <th className="p-4">Case ID</th>
                      <th className="p-4">Current Stage → Next</th>
                      <th className="p-4">Milestone Evidence Ref</th>
                      <th className="p-4">Counsellor</th>
                      <th className="p-4">Submitted</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStageRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-teal-400">
                          {req.caseId}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                            <span className="text-slate-300">{req.fromStage.replace(/_/g, ' ')}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-teal-300">{req.requestedStage.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-300">
                          <span className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60 text-[11px]">
                            {req.evidenceReference}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">
                          {req.counselorName}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : req.status === 'CLARIFICATION_REQUIRED'
                                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {req.status === 'PENDING' ? 'Pending Approval' : req.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedStageRequest(req);
                              setReviewNotes(req.reviewNotes || '');
                              setRejectionReason('');
                              setIsConfirmingApproval(false);
                              setIsConfirmingRejection(false);
                              setActionErrorMsg(null);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all inline-flex items-center gap-1.5"
                          >
                            <span>{req.status === 'PENDING' ? 'Review' : 'View Details'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STREAM 2: VICTIM & COUNSELLOR ALLOCATION REQUESTS                         */}
      {/* ========================================================================= */}
      {inboxStream === 'counsellor-requests' && (
        <div className="space-y-4">
          {/* Filter Tabs & Search Bar */}
          <div className="glass-card p-4 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCounsellingTab('PENDING')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeCounsellingTab === 'PENDING'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Allocations</span>
                {pendingCounsellingCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeCounsellingTab === 'PENDING' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {pendingCounsellingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveCounsellingTab('APPROVED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCounsellingTab === 'APPROVED'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Approved
              </button>

              <button
                onClick={() => setActiveCounsellingTab('REJECTED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCounsellingTab === 'REJECTED'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Declined
              </button>

              <button
                onClick={() => setActiveCounsellingTab('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCounsellingTab === 'ALL'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Requests
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search victim name, case..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Counselling Requests List */}
          <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                Loading counselling requests...
              </div>
            ) : filteredCounsellingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <span className="font-semibold text-slate-400 block text-sm mb-1">
                  No counselling requests found
                </span>
                <span>No requests currently match the selected status or search filter.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredCounsellingRequests.map((req) => {
                  const isVictimInitiated = req.requestType === 'VICTIM_TO_ADMIN';

                  return (
                    <div
                      key={req._id}
                      className="p-5 hover:bg-slate-850/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isVictimInitiated
                              ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {isVictimInitiated ? 'Victim Request' : 'Counsellor Request'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Case #{req.caseId}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white">{req.victimName}</h3>
                          <span className="text-xs text-slate-400">
                            ({req.caseStage?.replace(/_/g, ' ') || 'Stage Under Review'})
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 max-w-2xl leading-relaxed">
                          {req.notes || (isVictimInitiated ? 'Victim requested dedicated trauma counselling support.' : 'Counsellor requested to counsel this victim.')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'PENDING' ? (
                          isVictimInitiated ? (
                            <button
                              onClick={() => {
                                setSelectedRequestForAssignment(req);
                                setAssignmentNotes('');
                                if (!selectedCounsellorId && availableCounsellors.length > 0) {
                                  setSelectedCounsellorId(availableCounsellors[0]._id || availableCounsellors[0].id);
                                }
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Match & Assign Counsellor</span>
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRequestForReject(req);
                                  setCounsellingRejectReason('');
                                }}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleApproveCounsellorRequest(req._id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            </div>
                          )
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STAGE COMPLETION REVIEW DRAWER                                   */}
      {/* ========================================================================= */}
      {selectedStageRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="min-h-full flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    STAGE COMPLETION REQUEST
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Review Stage Completion for Case <span className="font-mono text-teal-400">{selectedStageRequest.caseId}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStageRequest(null);
                    setIsConfirmingApproval(false);
                    setIsConfirmingRejection(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Completed Stage
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200">
                      {selectedStageRequest.fromStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Next Stage (To Activate)
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-teal-300">
                      {selectedStageRequest.requestedStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold mb-1">Milestone Evidence Ref</span>
                    <span className="font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200 block">
                      {selectedStageRequest.evidenceReference}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold mb-1">Submitted Reason</span>
                    <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                      {selectedStageRequest.reason}
                    </p>
                  </div>

                  {selectedStageRequest.notes && (
                    <div>
                      <span className="text-slate-400 block font-semibold mb-1">Counsellor Notes</span>
                      <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                        {selectedStageRequest.notes}
                      </p>
                    </div>
                  )}

                  {selectedStageRequest.status === 'PENDING' && (
                    <div className="pt-2">
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Admin Official Review Notes (Signed into Audit Trail):
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="e.g. Verified trial conclusion order from Special Court registrar."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedStageRequest.status === 'PENDING' && (
                <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-wrap gap-3 justify-end z-10">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingRejection(true)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-xs"
                  >
                    Reject Stage Completion
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingApproval(true)}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve Stage Completion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Stage Approval */}
      {isConfirmingApproval && selectedStageRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white">Confirm Official Stage Transition Approval</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will mark <strong className="text-white">{selectedStageRequest.fromStage}</strong> as COMPLETED
              and unlock <strong className="text-teal-300">{selectedStageRequest.requestedStage}</strong> for Case {selectedStageRequest.caseId}.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingApproval(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveStage}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Stage Rejection */}
      {isConfirmingRejection && selectedStageRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-rose-300">Reject Stage Transition Request</h4>
            <p className="text-xs text-slate-300">Please provide a statutory rejection reason for the counsellor:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Certified order not attached; witness testimony still ongoing."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              required
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingRejection(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectStage}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MATCH & ASSIGN COUNSELLOR MODAL                                  */}
      {/* ========================================================================= */}
      {selectedRequestForAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Match & Assign Certified Counsellor</h3>
                  <p className="text-xs text-slate-400">For {selectedRequestForAssignment.victimName} (Case #{selectedRequestForAssignment.caseId})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequestForAssignment(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAssignCounsellorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Certified District Trauma Counsellor:
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {availableCounsellors.map((c) => {
                    const cId = c._id || c.id;
                    const isSelected = selectedCounsellorId === cId;

                    return (
                      <label
                        key={cId}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="counsellor"
                            value={cId}
                            checked={isSelected}
                            onChange={() => setSelectedCounsellorId(cId)}
                            className="text-emerald-500 focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-xs block">{c.fullName}</span>
                            <span className="text-[11px] text-slate-400">{c.specialization}</span>
                          </div>
                        </div>

                        <div className="text-right text-[11px]">
                          <span className="text-emerald-400 font-semibold block">{c.experienceYears} yrs exp</span>
                          <span className="text-slate-500">{c.currentCases || 1} active cases</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assignment Instructions / Directives (Optional):
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Priority trauma grounding ahead of court testimony."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForAssignment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedCounsellorId}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Assign Counsellor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT COUNSELLING REQUEST */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-rose-300">Decline Counselling Request</h4>
            <p className="text-xs text-slate-300">Provide a reason for declining this request:</p>
            <textarea
              value={counsellingRejectReason}
              onChange={(e) => setCounsellingRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Counsellor capacity limit reached or alternate support pathway initiated."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequestForReject(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectCounsellorRequestSubmit}
                disabled={isProcessing}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInboxPage;
