import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  AvailableVictimItem,
  CounsellingRequest,
  RiskLevel,
  CaseStage,
} from '../../types';
import {
  Users,
  Inbox,
  Send,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Loader2,
  MapPin,
  FileText,
  HeartHandshake,
  Check,
  X,
} from 'lucide-react';

export const AvailableVictimsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'incoming' | 'available' | 'outgoing'>('incoming');

  const [incomingRequests, setIncomingRequests] = useState<CounsellingRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<CounsellingRequest[]>([]);
  const [availableVictims, setAvailableVictims] = useState<AvailableVictimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // Request modal state (Counsellor -> Admin)
  const [selectedVictimForRequest, setSelectedVictimForRequest] = useState<AvailableVictimItem | null>(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Reject modal state (Counsellor -> Admin request rejection)
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<CounsellingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch requests
      const reqRes: any = await api.get('/counselor/my-counselling-requests');
      const reqData = reqRes.data || reqRes;
      setIncomingRequests(reqData.incomingRequests || []);
      setOutgoingRequests(reqData.outgoingRequests || []);

      // Fetch available victims
      const victimsRes: any = await api.get('/counselor/available-victims');
      const victimsData = victimsRes.data || victimsRes;
      setAvailableVictims(Array.isArray(victimsData) ? victimsData : []);
    } catch (err: any) {
      console.error('Error fetching available victims data:', err);
      // Mock fallback
      setIncomingRequests([
        {
          _id: 'req_mock_1',
          victimId: 'user_priya_104',
          victimName: 'Priya Sharma (Protected Complainant)',
          caseId: 'MP-1055',
          requestedBy: 'admin_marcus_301',
          requestedByName: 'Marcus Vance (District Welfare Admin)',
          requestedByRole: 'ADMIN',
          requestType: 'ADMIN_TO_COUNSELLOR',
          status: 'PENDING',
          caseStage: 'CASE_REGISTRATION',
          riskLevel: 'ELEVATED',
          notes: 'Victim requested urgent trauma counseling and legal aid support.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      setAvailableVictims([
        {
          id: 'user_jordan_102',
          victimId: 'user_jordan_102',
          victimName: 'Jordan Chen (Pseudonymous)',
          caseId: 'MP-1001',
          caseStage: 'INVESTIGATION',
          victimType: 'VICTIM',
          district: 'North District',
          riskLevel: 'WATCH',
          counsellorStatus: 'NOT_ALLOCATED',
          hasActiveRequest: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user_rahul_105',
          victimId: 'user_rahul_105',
          victimName: 'Rahul Verma (Atrocity Survivor)',
          caseId: 'MP-1060',
          caseStage: 'INVESTIGATION',
          victimType: 'VICTIM',
          district: 'South District',
          riskLevel: 'REQUIRES_REVIEW',
          counsellorStatus: 'NOT_ALLOCATED',
          hasActiveRequest: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Accept Admin Request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/counselor/victim-requests/${requestId}/accept`);
      setSuccessMessage('Successfully accepted counselling allocation. Victim added to your active caseload.');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reject Admin Request
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReject) return;

    try {
      setSubmittingReject(true);
      setError(null);
      await api.post(`/counselor/victim-requests/${selectedRequestForReject._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      setSuccessMessage('Declined assignment. District Administration notified.');
      setSelectedRequestForReject(null);
      setRejectionReason('');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to decline request');
    } finally {
      setSubmittingReject(false);
    }
  };

  // Handle Counsellor Proactive Request (COUNSELLOR_TO_ADMIN)
  const handleProactiveRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVictimForRequest) return;

    try {
      setSubmittingRequest(true);
      setError(null);
      await api.post(`/counselor/victims/${selectedVictimForRequest.victimId}/request`, {
        notes: requestNotes.trim(),
      });
      setSuccessMessage(`Assignment request for ${selectedVictimForRequest.victimName} submitted for District Admin approval.`);
      setSelectedVictimForRequest(null);
      setRequestNotes('');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filtered available victims
  const filteredVictims = availableVictims.filter((v) => {
    const matchesSearch =
      v.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || v.riskLevel === riskFilter;
    const matchesStage = stageFilter === 'ALL' || v.caseStage === stageFilter;
    return matchesSearch && matchesRisk && matchesStage;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'REQUIRES_REVIEW':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'ELEVATED':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'WATCH':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  if (loading && availableVictims.length === 0 && incomingRequests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading Available Victims & Requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Caseload Management
              </span>
              <span className="text-xs text-slate-400">Dr. Sarah Jenkins</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-400" />
              Available Victims & Case Allocation Queue
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Review incoming allocation assignments from District Admin and explore unallocated victims requiring psycho-social and legal aid support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <Inbox className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300">Incoming Requests:</span>
              <span className="font-bold text-white font-mono">{incomingRequests.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
              <Users className="w-4 h-4 text-teal-400" />
              <span className="text-slate-300">Unallocated:</span>
              <span className="font-bold text-white font-mono">{availableVictims.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'incoming'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Incoming Admin Assignments</span>
          {incomingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500 text-white font-bold">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'available'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Unallocated Victims Directory</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
            {availableVictims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'outgoing'
              ? 'bg-slate-700/50 text-slate-200 border border-slate-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>My Outgoing Requests</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
            {outgoingRequests.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Incoming Admin Requests */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                There are no pending allocation requests from District Welfare Administration requiring your response.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Admin Assignment
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{req.caseId}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{req.victimName}</h3>
                      <div className="text-xs text-slate-400">
                        Initiated by <strong className="text-slate-200">{req.requestedByName}</strong>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Decision
                    </span>
                  </div>

                  {req.notes && (
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 italic">
                      "{req.notes}"
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Stage: <strong className="text-slate-200">{req.caseStage || 'INVESTIGATION'}</strong></span>
                    <span>Received: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Accept / Reject Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => setSelectedRequestForReject(req)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline with Reason
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      Accept Assignment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Available Victims Directory */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, case ID, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Risk:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="REQUIRES_REVIEW">Requires Review</option>
                  <option value="ELEVATED">Elevated</option>
                  <option value="WATCH">Watch</option>
                  <option value="STABLE">Stable</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="ALL">All Stages</option>
                  <option value="CASE_REGISTRATION">Stage 1: Registration</option>
                  <option value="INVESTIGATION">Stage 2: Investigation</option>
                  <option value="COURT_TRIAL">Stage 3: Court Trial</option>
                  <option value="COMPENSATION">Stage 4: Compensation</option>
                  <option value="REHABILITATION">Stage 5: Rehabilitation</option>
                  <option value="PROTECTION_SUPPORT">Stage 6: Protection</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Cards */}
          {filteredVictims.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Unallocated Victims Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No unallocated victims match the current filters or all victims are currently assigned.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVictims.map((v) => {
                const isRequestedByMe = v.myPendingRequest;
                return (
                  <div
                    key={v.id || v.victimId}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-mono text-teal-400">{v.caseId}</div>
                          <h4 className="text-base font-bold text-white line-clamp-1">{v.victimName}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRiskBadge(v.riskLevel)}`}>
                          {v.riskLevel.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{v.district}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Current Stage: <strong className="text-slate-200">{v.caseStage}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      {isRequestedByMe ? (
                        <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          Request Pending Admin Approval
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedVictimForRequest(v)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-200 font-semibold text-xs transition-all border border-slate-700 hover:border-teal-400 active:scale-95"
                        >
                          <HeartHandshake className="w-4 h-4" />
                          Request to Counsel Victim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Outgoing Requests */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <Send className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Outgoing Requests</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                You have not submitted any proactive requests to counsel unallocated victims.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Case ID</th>
                      <th className="py-3 px-4">Victim Name</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Submitted Notes</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {outgoingRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-400">{req.caseId}</td>
                        <td className="py-3.5 px-4 font-semibold text-white">{req.victimName}</td>
                        <td className="py-3.5 px-4">{req.caseStage || 'INVESTIGATION'}</td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">{req.notes || '—'}</td>
                        <td className="py-3.5 px-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4">
                          {req.status === 'APPROVED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Approved & Active
                            </span>
                          ) : req.status === 'REJECTED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Declined
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Pending Admin Review
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proactive Request Modal (Counsellor -> Admin) */}
      {selectedVictimForRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-6 h-6 text-teal-400" />
                Request to Counsel Victim
              </h3>
              <button
                onClick={() => setSelectedVictimForRequest(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Victim:</span>
                <span className="font-semibold text-white">{selectedVictimForRequest.victimName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Case ID:</span>
                <span className="font-semibold text-teal-400 font-mono">{selectedVictimForRequest.caseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stage:</span>
                <span className="font-semibold text-slate-200">{selectedVictimForRequest.caseStage}</span>
              </div>
            </div>

            <form onSubmit={handleProactiveRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Clinical Fit & Assignment Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Explain why you are requesting this victim (e.g., expertise with witness accompaniment, regional language match, caseload capacity)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVictimForRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal (Counsellor Declining Admin Request) */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-rose-400" />
                Decline Counselling Assignment
              </h3>
              <button
                onClick={() => setSelectedRequestForReject(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Please state why you are unable to take on Case <strong className="text-white font-mono">{selectedRequestForReject.caseId}</strong>. The District Administration will reallocate the victim to another available specialist.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Reason for Declining (Required)
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Caseload at capacity this week for court hearings; scheduling conflict with active trials..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForReject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingReject ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
