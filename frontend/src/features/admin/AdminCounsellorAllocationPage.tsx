import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  AvailableCounsellorItem,
  CounsellingRequest,
  CounsellorStatus,
} from '../../types';
import {
  Users,
  Inbox,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Award,
  MapPin,
  Send,
  Loader2,
  AlertTriangle,
  Briefcase,
  Sparkles,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';

interface AllocationOverviewData {
  unallocatedVictims: Array<{
    id: string;
    victimId: string;
    victimName: string;
    caseId: string;
    caseStage: string;
    victimType: string;
    district: string;
    counsellorStatus: CounsellorStatus;
    createdAt: string;
  }>;
  activeAllocations: Array<{
    id: string;
    victimId: string;
    victimName: string;
    caseId: string;
    caseStage: string;
    counsellorId: string;
    counsellorName: string;
    counsellorSpecialization: string;
    assignedAt: string;
    district: string;
    status: string;
  }>;
  pendingRequests: CounsellingRequest[];
  stats: {
    totalUnallocated: number;
    totalAllocated: number;
    totalPendingRequests: number;
    totalCounsellors: number;
  };
}

export const AdminCounsellorAllocationPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AllocationOverviewData | null>(null);
  const [availableCounsellors, setAvailableCounsellors] = useState<AvailableCounsellorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'requests' | 'unallocated' | 'active'>('requests');

  // Assign Counsellor Modal state
  const [selectedVictimForAssignment, setSelectedVictimForAssignment] = useState<any | null>(null);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Reject Request Modal state
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<CounsellingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, counsellorsRes]: any[] = await Promise.all([
        api.get('/admin/counsellor-allocation'),
        api.get('/admin/available-counsellors'),
      ]);
      const overviewData = overviewRes.data || overviewRes;
      const counsellorsData = counsellorsRes.data || counsellorsRes;

      setData(overviewData);
      setAvailableCounsellors(Array.isArray(counsellorsData) ? counsellorsData : []);
      if (Array.isArray(counsellorsData) && counsellorsData.length > 0) {
        setSelectedCounsellorId(counsellorsData[0]._id || counsellorsData[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching admin allocation overview:', err);
      // Fallback mock
      setData({
        unallocatedVictims: [
          {
            id: 'user_jordan_102',
            victimId: 'user_jordan_102',
            victimName: 'Jordan Chen (Pseudonymous)',
            caseId: 'MP-1001',
            caseStage: 'INVESTIGATION',
            victimType: 'VICTIM',
            district: 'North District',
            counsellorStatus: 'NOT_ALLOCATED',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'user_priya_104',
            victimId: 'user_priya_104',
            victimName: 'Priya Sharma (Protected Complainant)',
            caseId: 'MP-1055',
            caseStage: 'CASE_REGISTRATION',
            victimType: 'VICTIM',
            district: 'East District',
            counsellorStatus: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        ],
        activeAllocations: [
          {
            id: 'user_alex_101',
            victimId: 'user_alex_101',
            victimName: 'Alex Rivera (Protected Witness)',
            caseId: 'MP-1042',
            caseStage: 'COURT_TRIAL',
            counsellorId: 'c1',
            counsellorName: 'Dr. Sarah Jenkins',
            counsellorSpecialization: 'Trauma-Informed Crisis Intervention & Legal Aid',
            assignedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
            district: 'Central District',
            status: 'ACTIVE',
          },
        ],
        pendingRequests: [
          {
            _id: 'req_1',
            victimId: 'user_priya_104',
            victimName: 'Priya Sharma (Protected Complainant)',
            caseId: 'MP-1055',
            requestedBy: 'user_priya_104',
            requestedByName: 'Priya Sharma',
            requestedByRole: 'USER',
            requestType: 'VICTIM_TO_ADMIN',
            status: 'PENDING',
            caseStage: 'CASE_REGISTRATION',
            notes: 'Victim requested urgent trauma counseling and legal aid support.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        stats: {
          totalUnallocated: 2,
          totalAllocated: 1,
          totalPendingRequests: 1,
          totalCounsellors: 3,
        },
      });
      setAvailableCounsellors([
        {
          id: 'c1',
          _id: 'c1',
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Admin approves Counsellor proactive request (COUNSELLOR_TO_ADMIN)
  const handleApproveCounselorRequest = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.post(`/admin/counsellor-requests/${requestId}/approve`);
      setSuccessMessage('Counsellor request approved. Case successfully allocated.');
      await fetchOverview();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  // Admin rejects request (with reason)
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForReject) return;

    try {
      setSubmittingReject(true);
      setError(null);
      await api.post(`/admin/counsellor-requests/${selectedRequestForReject._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      setSuccessMessage('Request rejected. Counsellor / applicant notified.');
      setSelectedRequestForReject(null);
      setRejectionReason('');
      await fetchOverview();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reject request');
    } finally {
      setSubmittingReject(false);
    }
  };

  // Admin assigns counsellor for unallocated victim (ADMIN_TO_COUNSELLOR)
  const handleAssignCounsellorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVictimForAssignment || !selectedCounsellorId) return;

    try {
      setSubmittingAssignment(true);
      setError(null);
      await api.post(`/admin/victims/${selectedVictimForAssignment.victimId || selectedVictimForAssignment.id}/request-counsellor`, {
        counselorId: selectedCounsellorId,
        notes: assignmentNotes.trim(),
      });
      setSuccessMessage('Counselling assignment request sent to counsellor for acceptance.');
      setSelectedVictimForAssignment(null);
      setAssignmentNotes('');
      await fetchOverview();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to assign counsellor');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading District Allocation Dashboard...</span>
        </div>
      </div>
    );
  }

  const pendingRequests = data?.pendingRequests || [];
  const unallocatedVictims = data?.unallocatedVictims || [];
  const activeAllocations = data?.activeAllocations || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-6 md:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                District Administration
              </span>
              <span className="text-xs text-slate-400">Marcus Vance (District Welfare Admin)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-400" />
              Counsellor Allocation & Support Governance
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Match unallocated victims with qualified psycho-social counsellors and approve counsellor self-assignment requests across the district.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOverview()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Unallocated Victims</span>
            <UserX className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.stats.totalUnallocated ?? unallocatedVictims.length}</div>
          <div className="text-xs text-slate-400">Awaiting counsellor matching</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Active Allocations</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.stats.totalAllocated ?? activeAllocations.length}</div>
          <div className="text-xs text-slate-400">1-to-1 active caseloads</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Requests</span>
            <Inbox className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.stats.totalPendingRequests ?? pendingRequests.length}</div>
          <div className="text-xs text-slate-400">Requires admin action</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">District Counsellors</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{availableCounsellors.length}</div>
          <div className="text-xs text-slate-400">Certified psychologists</div>
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

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'requests'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Pending Allocation Requests</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('unallocated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'unallocated'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Unallocated Victims ({unallocatedVictims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'active'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Active Allocations ({activeAllocations.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Requests Inbox */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Pending Allocation Requests</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                All counsellor assignment and victim requests have been processed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {req.requestType === 'COUNSELLOR_TO_ADMIN' ? 'Counsellor Request' : 'Victim Support Request'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{req.caseId}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{req.victimName}</h3>
                      <div className="text-xs text-slate-400">
                        Requested by: <strong className="text-slate-200">{req.requestedByName}</strong> ({req.requestedByRole})
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Approval
                    </span>
                  </div>

                  {req.notes && (
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 italic">
                      "{req.notes}"
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Stage: <strong className="text-slate-200">{req.caseStage || 'INVESTIGATION'}</strong></span>
                    <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => setSelectedRequestForReject(req)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject with Reason
                    </button>

                    {req.requestType === 'COUNSELLOR_TO_ADMIN' ? (
                      <button
                        onClick={() => handleApproveCounselorRequest(req._id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        Approve Allocation
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedVictimForAssignment({ victimId: req.victimId, victimName: req.victimName, caseId: req.caseId, caseStage: req.caseStage })}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        <UserCheck className="w-4 h-4" />
                        Assign Counsellor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Unallocated Victims */}
      {activeTab === 'unallocated' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Victim Name</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Case Stage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {unallocatedVictims.map((v) => (
                    <tr key={v.id || v.victimId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-400">{v.caseId}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{v.victimName}</td>
                      <td className="py-3.5 px-4">{v.district}</td>
                      <td className="py-3.5 px-4">{v.caseStage}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {v.counsellorStatus || 'NOT_ALLOCATED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedVictimForAssignment(v)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Match Counsellor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Allocations */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Victim Name</th>
                    <th className="py-3 px-4">Assigned Counsellor</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Assigned Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {activeAllocations.map((a) => (
                    <tr key={a.id || a.victimId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-400">{a.caseId}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{a.victimName}</td>
                      <td className="py-3.5 px-4 text-indigo-300 font-semibold">{a.counsellorName}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">{a.counsellorSpecialization}</td>
                      <td className="py-3.5 px-4">{new Date(a.assignedAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active (1:1)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Match Counsellor Modal */}
      {selectedVictimForAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-teal-400" />
                Assign Counsellor to Case {selectedVictimForAssignment.caseId}
              </h3>
              <button
                onClick={() => setSelectedVictimForAssignment(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Victim:</span>
                <span className="font-semibold text-white">{selectedVictimForAssignment.victimName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Stage:</span>
                <span className="font-semibold text-teal-400">{selectedVictimForAssignment.caseStage || 'INVESTIGATION'}</span>
              </div>
            </div>

            <form onSubmit={handleAssignCounsellorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Select District Counsellor
                </label>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {availableCounsellors.map((c) => {
                    const cId = c._id || c.id;
                    const isSelected = selectedCounsellorId === cId;
                    return (
                      <div
                        key={cId}
                        onClick={() => setSelectedCounsellorId(cId)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500/50 shadow-md'
                            : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{c.fullName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">
                              {c.experienceYears} yrs exp
                            </span>
                          </div>
                          <div className="text-xs text-slate-300">{c.specialization}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                            <span>Active Cases: <strong className="text-white">{c.currentCases}</strong></span>
                            <span>District: {c.district}</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${c.availability === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {c.availability}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Assignment Instructions / Directives
                </label>
                <textarea
                  rows={3}
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="e.g. Expedite psychological evaluation prior to upcoming trial hearings..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVictimForAssignment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignment}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingAssignment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Confirm Assignment Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="w-6 h-6 text-rose-400" />
                Reject Allocation Request
              </h3>
              <button
                onClick={() => setSelectedRequestForReject(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Rejection Reason (Required)
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request cannot be approved at this time..."
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
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
