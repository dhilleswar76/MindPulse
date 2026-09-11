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
} from 'lucide-react';
import api from '../../services/api';
import { StageTransitionRequest, StageTransitionRequestStatus } from '../../types';
import { Link } from 'react-router-dom';

export const AdminInboxPage: React.FC = () => {
  const [requests, setRequests] = useState<StageTransitionRequest[]>([]);
  const [activeTab, setActiveTab] = useState<StageTransitionRequestStatus | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StageTransitionRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
  const [isConfirmingRejection, setIsConfirmingRejection] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
      const res: any = await api.get(`/admin/stage-approval-requests${statusParam}`);
      const list = res.data?.requests || res.data?.data?.requests || [];
      setRequests(list);
    } catch {
      try {
        const statusParam = activeTab === 'ALL' ? '' : `?status=${activeTab}`;
        const res: any = await api.get(`/admin/stage-transition-requests${statusParam}`);
        const list = res.data?.requests || res.data?.data?.requests || [];
        setRequests(list);
      } catch {
        // Fallback synthetic requests for demo presentation
        setRequests([
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // Lock background body scroll when review modal is open
  useEffect(() => {
    if (!selectedRequest) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedRequest]);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.evidenceReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.counselorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/stage-approval-requests/${selectedRequest._id}/approve`, {
        reviewNotes: reviewNotes || 'Official milestone verified and approved.',
      });
      setActionSuccessMsg(
        `Stage completion approved for Case ${selectedRequest.caseId}. ${selectedRequest.requestedStage} stage is now ACTIVE.`
      );
      setIsConfirmingApproval(false);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (err: any) {
      // Fallback endpoint if needed
      try {
        await api.post(`/admin/stage-transition-requests/${selectedRequest._id}/approve`, {
          reviewNotes: reviewNotes || 'Official milestone verified and approved.',
        });
        setActionSuccessMsg(
          `Stage completion approved for Case ${selectedRequest.caseId}. ${selectedRequest.requestedStage} stage is now ACTIVE.`
        );
        setIsConfirmingApproval(false);
        setSelectedRequest(null);
        setReviewNotes('');
        fetchRequests();
      } catch (err2: any) {
        setActionErrorMsg(err2.response?.data?.error || err2.message || 'Approval failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setActionErrorMsg('Rejection reason is required.');
      return;
    }
    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/stage-approval-requests/${selectedRequest._id}/reject`, {
        reason: rejectionReason.trim(),
        reviewNotes: rejectionReason.trim(),
      });
      setActionSuccessMsg(`Stage completion request rejected for Case ${selectedRequest.caseId}.`);
      setIsConfirmingRejection(false);
      setSelectedRequest(null);
      setRejectionReason('');
      setReviewNotes('');
      fetchRequests();
    } catch (err: any) {
      try {
        await api.post(`/admin/stage-transition-requests/${selectedRequest._id}/reject`, {
          reason: rejectionReason.trim(),
          reviewNotes: rejectionReason.trim(),
        });
        setActionSuccessMsg(`Stage completion request rejected for Case ${selectedRequest.caseId}.`);
        setIsConfirmingRejection(false);
        setSelectedRequest(null);
        setRejectionReason('');
        setReviewNotes('');
        fetchRequests();
      } catch (err2: any) {
        setActionErrorMsg(err2.response?.data?.error || err2.message || 'Rejection failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClarification = async () => {
    if (!selectedRequest) return;
    if (!reviewNotes.trim()) {
      setActionErrorMsg('Clarification instructions are required for the counselor.');
      return;
    }
    setIsProcessing(true);
    setActionErrorMsg(null);
    try {
      await api.post(`/admin/stage-transition-requests/${selectedRequest._id}/clarification`, {
        reviewNotes: reviewNotes.trim(),
      });
      setActionSuccessMsg(`Clarification requested from counselor for Case ${selectedRequest.caseId}.`);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (err: any) {
      setActionErrorMsg(err.response?.data?.error || err.message || 'Clarification request failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Administrative Milestone Governance
            </span>
            <span className="text-xs text-slate-400">Section 357A CrPC & SC/ST POA Rules</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5 tracking-tight">
            <Inbox className="w-7 h-7 text-amber-400" />
            Official Case Stage Confirmation Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Review and officially authorize counselor-submitted stage transitions based on verified legal and administrative case records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Dashboard Overview
          </Link>
          <Link
            to="/admin/cases"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            All System Cases
          </Link>
        </div>
      </div>

      {/* Governance & Privacy Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">Statutory Decision Support Boundary</strong>
          Only authorized District Welfare Admins can approve stage completion. AI distress scores, victim check-ins, or counselor support interventions do not advance legal stages. Every approval activates the next case stage and permanently signs the system audit trail.
        </div>
      </div>

      {/* Alerts */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
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
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
          <button onClick={() => setActionErrorMsg(null)} className="text-rose-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="glass-card p-4 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'PENDING' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('CLARIFICATION_REQUIRED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'CLARIFICATION_REQUIRED'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Clarification Required
          </button>

          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'APPROVED'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Approved
          </button>

          <button
            onClick={() => setActiveTab('REJECTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Rejected
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Requests
          </button>
        </div>

        {/* Search Input */}
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

      {/* Requests Table / Cards */}
      <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-3"></div>
            Loading official transition requests...
          </div>
        ) : filteredRequests.length === 0 ? (
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
                {filteredRequests.map((req) => (
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
                          setSelectedRequest(req);
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

      {/* Review Drawer / Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="min-h-full flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
              role="dialog"
              aria-modal="true"
            >
              {/* Modal Header (Fixed / Shrink-0) */}
              <div className="shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900 z-10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    STAGE COMPLETION REQUEST
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Review Stage Completion for Case <span className="font-mono text-teal-400">{selectedRequest.caseId}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    setIsConfirmingApproval(false);
                    setIsConfirmingRejection(false);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  aria-label="Close review modal"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* Stage Transition Visualizer */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-around text-center">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Completed Stage (Under Review)
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200">
                      {selectedRequest.fromStage.replace(/_/g, ' ')}
                    </span>
                    <span className="block text-[10px] text-amber-300 font-semibold mt-0.5">
                      COMPLETION_REQUESTED
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Next Stage (To Activate)
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-teal-300">
                      {selectedRequest.requestedStage.replace(/_/g, ' ')}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                      Currently LOCKED
                    </span>
                  </div>
                </div>

                {/* Request Details Grid */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Official Evidence / Milestone Reference</span>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-teal-300 font-bold">
                      {selectedRequest.evidenceReference}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Counsellor Justification & Legal Basis</span>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 leading-relaxed">
                      {selectedRequest.reason}
                    </div>
                  </div>

                  {selectedRequest.notes && (
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Additional Counselor Notes</span>
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">
                        {selectedRequest.notes}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-slate-400 text-[11px] pt-1">
                    <div>
                      Submitted By: <strong className="text-slate-200">{selectedRequest.counselorName}</strong>
                    </div>
                    <div className="text-right">
                      Submitted: <strong className="text-slate-200">{new Date(selectedRequest.createdAt).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                {/* Rejection Prompt & Reason Entry Modal */}
                {isConfirmingRejection && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl text-xs space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Reject Stage Completion Request</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Please provide a required reason for rejection. The counselor will receive a persistent notification with this reason and can resubmit after resolving the deficiency.
                    </p>
                    <div>
                      <label className="block text-slate-200 font-semibold mb-1">
                        Rejection Reason <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Required documentation is incomplete. Please attach certified court order."
                        className="w-full bg-slate-950 border border-rose-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingRejection(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isProcessing || !rejectionReason.trim()}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                      >
                        {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Approval Prompt */}
                {isConfirmingApproval && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-xs space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Confirm Official Case-Stage Approval?</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs">
                      Approving will mark <strong className="text-white">{selectedRequest.fromStage.replace(/_/g, ' ')}</strong> as <strong className="text-emerald-400">COMPLETED</strong> and automatically activate <strong className="text-teal-300">{selectedRequest.requestedStage.replace(/_/g, ' ')}</strong> as <strong className="text-teal-400">ACTIVE</strong>. The assigned counselor will be notified.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingApproval(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
                      >
                        {isProcessing ? 'Approving...' : 'Approve Stage'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accessible Footer (Shrink-0) */}
              {!isConfirmingRejection && !isConfirmingApproval && (
                <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 z-10 flex items-center justify-end gap-3">
                  {selectedRequest.status === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingRejection(true)}
                        disabled={isProcessing}
                        className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Reject Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClarification()}
                        disabled={isProcessing}
                        className="px-4 py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Request Clarification
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingApproval(true)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        Approve Stage
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
