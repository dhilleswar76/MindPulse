import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  AlertCircle,
  Clock,
  GitMerge,
  MapPin,
  X,
  FileText,
  Lock,
} from 'lucide-react';
import api from '../../services/api';
import { AdminFilterBar, AdminFilters } from './components/AdminFilterBar';

export const AdminCasesPage: React.FC = () => {
  const [filters, setFilters] = useState<AdminFilters>({
    dateRange: 'all',
    riskLevel: 'all',
    stage: 'all',
    victimType: 'all',
    status: 'all',
    district: 'all',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [casesData, setCasesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        search: searchQuery,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      } as any).toString();

      const res: any = await api.get(`/admin/cases?${params}`);
      setCasesData(res.data);
    } catch {
      // Fallback data
      setCasesData({
        cases: [
          {
            id: 'c_1042',
            caseId: 'MP-1042',
            pseudonym: 'Witness Cohort Alpha (Pseudonymous)',
            victimType: 'WITNESS',
            caseStage: 'COURT_TRIAL',
            caseStatus: 'ACTIVE',
            district: 'Central District',
            state: 'National Capital Region',
            recentRiskLevel: 'ELEVATED',
            priorityScore: 0.82,
            assignedCounselorName: 'Dr. Sarah Jenkins',
            createdDate: '2025-11-10',
            lastActivity: '2026-03-08',
            interventionsCount: 3,
            interventionStatus: 'ACTIVE',
          },
          {
            id: 'c_1001',
            caseId: 'MP-1001',
            pseudonym: 'Complainant Cohort Beta (Pseudonymous)',
            victimType: 'VICTIM',
            caseStage: 'INVESTIGATION',
            caseStatus: 'UNDER_REVIEW',
            district: 'North District',
            state: 'National Capital Region',
            recentRiskLevel: 'WATCH',
            priorityScore: 0.68,
            assignedCounselorName: 'Dr. Sarah Jenkins',
            createdDate: '2026-01-12',
            lastActivity: '2026-03-09',
            interventionsCount: 1,
            interventionStatus: 'PLANNED',
          },
          {
            id: 'c_1003',
            caseId: 'MP-1003',
            pseudonym: 'Family Member Cohort Gamma (Pseudonymous)',
            victimType: 'FAMILY_MEMBER',
            caseStage: 'REHABILITATION',
            caseStatus: 'SUPPORT_IN_PROGRESS',
            district: 'South District',
            state: 'National Capital Region',
            recentRiskLevel: 'STABLE',
            priorityScore: 0.38,
            assignedCounselorName: 'Dr. Sarah Jenkins',
            createdDate: '2024-05-10',
            lastActivity: '2026-03-05',
            interventionsCount: 4,
            interventionStatus: 'COMPLETED',
          },
          {
            id: 'c_1004',
            caseId: 'MP-1004',
            pseudonym: 'Complainant Cohort Delta (Pseudonymous)',
            victimType: 'COMPLAINANT',
            caseStage: 'CASE_REGISTRATION',
            caseStatus: 'ACTIVE',
            district: 'East District',
            state: 'National Capital Region',
            recentRiskLevel: 'REQUIRES_REVIEW',
            priorityScore: 0.91,
            assignedCounselorName: 'Dr. Michael Vance',
            createdDate: '2026-03-01',
            lastActivity: '2026-03-10',
            interventionsCount: 2,
            interventionStatus: 'FOLLOW_UP_REQUIRED',
          },
          {
            id: 'c_1005',
            caseId: 'MP-1005',
            pseudonym: 'Witness Cohort Epsilon (Pseudonymous)',
            victimType: 'WITNESS',
            caseStage: 'COMPENSATION',
            caseStatus: 'SUPPORT_IN_PROGRESS',
            district: 'West District',
            state: 'National Capital Region',
            recentRiskLevel: 'STABLE',
            priorityScore: 0.45,
            assignedCounselorName: 'Dr. Sarah Jenkins',
            createdDate: '2025-09-18',
            lastActivity: '2026-03-07',
            interventionsCount: 2,
            interventionStatus: 'COMPLETED',
          },
        ],
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1,
        privacyStatement: 'Sensitive personal journal text, audio telemetry, and chat transcripts are omitted per Privacy Safeguard Policy (SIH26094).',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filters, searchQuery, page, limit, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'REQUIRES_REVIEW':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded">Requires Review</span>;
      case 'ELEVATED':
        return <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-semibold px-2 py-0.5 rounded">Elevated</span>;
      case 'WATCH':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 rounded">Watch</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded">Stable Baseline</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Users className="w-7 h-7 text-amber-400" />
          System Case Monitoring Table (Admin Pseudonymous View)
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Administrative oversight table for state and district nodal officers. Provides non-sensitive case stage telemetry, risk level classification, and intervention status.
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-teal-300 block mb-0.5">Strict Privacy & RBAC Enforcement Active</strong>
          Personal identifiable information (PII), confidential journal entries, acoustic voice logs, and raw counselor notes are strictly suppressed for administrative accounts.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Case ID or District..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        <AdminFilterBar filters={filters} onFilterChange={setFilters} onReset={() => setFilters({ dateRange: 'all', riskLevel: 'all', stage: 'all', victimType: 'all', status: 'all', district: 'all' })} />
      </div>

      {/* Table Container */}
      <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading pseudonymous cases...</div>
        ) : !casesData || casesData.cases.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No cases match the selected filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('caseId')}>
                    <div className="flex items-center gap-1">
                      <span>Case ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Pseudonymous Designation</th>
                  <th className="py-3.5 px-4">Victim Category</th>
                  <th className="py-3.5 px-4">Case Stage</th>
                  <th className="py-3.5 px-4">District</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('recentRiskLevel')}>
                    <div className="flex items-center gap-1">
                      <span>Risk Level</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Intervention Status</th>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-200" onClick={() => handleSort('lastActivity')}>
                    <div className="flex items-center gap-1">
                      <span>Last Activity</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {casesData.cases.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.caseId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{c.pseudonym}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                        {c.victimType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-indigo-300">{c.caseStage.replace('_', ' ')}</td>
                    <td className="py-3.5 px-4 text-slate-300">{c.district}</td>
                    <td className="py-3.5 px-4">{getRiskBadge(c.recentRiskLevel)}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {c.interventionStatus} ({c.interventionsCount})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{c.lastActivity}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-[11px] font-medium border border-slate-700 transition-all flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {casesData && casesData.totalPages > 0 && (
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing <strong className="text-slate-200">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="text-slate-200">{Math.min(page * limit, casesData.total)}</strong> of{' '}
              <strong className="text-slate-200">{casesData.total}</strong> cases
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-300 px-2">
                Page {page} of {casesData.totalPages}
              </span>
              <button
                disabled={page >= casesData.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Case Inspector Drawer/Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <FileText className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCase.pseudonym}</h3>
                <span className="text-xs font-mono text-amber-400 block">Case ID: {selectedCase.caseId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Victim Category</span>
                <span className="font-bold text-white">{selectedCase.victimType}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Case Stage Milestone</span>
                <span className="font-bold text-indigo-400">{selectedCase.caseStage}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">District Jurisdiction</span>
                <span className="font-bold text-white">{selectedCase.district}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Risk Triage Status</span>
                <div>{getRiskBadge(selectedCase.recentRiskLevel)}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Privacy & Non-Diagnostic Compliance Notice</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Raw personal journal reflections, recorded audio voice stress logs, and private message transcripts are suppressed. Assigned Counselor: <strong className="text-slate-200">{selectedCase.assignedCounselorName}</strong>.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
