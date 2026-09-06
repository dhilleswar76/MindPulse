import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ArrowUpRight, Search, Filter, Shield, Sparkles, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CounselorCase } from '../../types';

export const CounselorDashboardPage: React.FC = () => {
  const [cases, setCases] = useState<CounselorCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res: any = await api.get('/counselor/cases');
        setCases(res.data?.cases || []);
      } catch {
        setCases([
          {
            id: 'case_101',
            userId: 'user_alex_101',
            studentName: 'Alex Rivera',
            studentEmail: 'alex.r@campus.edu',
            department: 'Computer Science',
            yearOfStudy: 3,
            riskLevel: 'REQUIRES_REVIEW',
            riskScore: 0.82,
            riskTrend: 'escalating',
            daysInDistress: 4,
            recentCheckIn: {
              mood: 3,
              stress: 9,
              energy: 3,
              sleepHours: 4.0,
              timestamp: new Date().toISOString(),
            },
            topSignals: [
              { feature: 'Sleep Deficit', impact: 0.32, description: '4.0 hours average sleep over past 4 days' },
              { feature: 'Elevated Stress', impact: 0.28, description: 'Consistently reporting 9/10 stress level' },
            ],
            aiSummary: 'Recent telemetry indicates acute sleep reduction and high stress persistence. Recommend proactive check-in.',
            interventionsCount: 1,
          },
          {
            id: 'case_102',
            userId: 'user_jordan_102',
            studentName: 'Jordan Chen',
            studentEmail: 'jordan.c@campus.edu',
            department: 'Biomedical Engineering',
            yearOfStudy: 2,
            riskLevel: 'ELEVATED',
            riskScore: 0.68,
            riskTrend: 'escalating',
            daysInDistress: 2,
            recentCheckIn: {
              mood: 4,
              stress: 8,
              energy: 4,
              sleepHours: 5.5,
              timestamp: new Date().toISOString(),
            },
            topSignals: [
              { feature: 'Elevated Stress', impact: 0.26, description: 'Reported stress score 8/10' },
            ],
            aiSummary: 'Student shows rising stress indicators alongside emerging sleep disruption.',
            interventionsCount: 0,
          },
          {
            id: 'case_103',
            userId: 'user_taylor_103',
            studentName: 'Taylor Morgan',
            studentEmail: 'taylor.m@campus.edu',
            department: 'Psychology',
            yearOfStudy: 4,
            riskLevel: 'WATCH',
            riskScore: 0.44,
            riskTrend: 'stable',
            daysInDistress: 1,
            recentCheckIn: {
              mood: 6,
              stress: 6,
              energy: 6,
              sleepHours: 6.5,
              timestamp: new Date().toISOString(),
            },
            topSignals: [
              { feature: 'Mild Sleep Fluctuation', impact: 0.14, description: 'Sleep slightly below 7h target' },
            ],
            aiSummary: 'Mild baseline deviation. Metrics remain within acceptable monitoring boundary.',
            interventionsCount: 2,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.riskLevel === filter;
    const matchesSearch =
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'REQUIRES_REVIEW':
        return <span className="badge-review">Requires Review</span>;
      case 'ELEVATED':
        return <span className="badge-elevated">Elevated</span>;
      case 'WATCH':
        return <span className="badge-watch">Watch</span>;
      default:
        return <span className="badge-stable">Stable</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-400" />
          Counselor Triage & Decision Support Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Prioritized case queue, AI-assisted summaries, and intervention management for campus wellness staff.
        </p>
      </div>

      {/* Human-in-the-loop clinical disclaimer */}
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <strong className="text-white block mb-0.5">Clinical Decision Support Policy</strong>
          MindPulse algorithms assist in prioritization and summary extraction. All clinical judgments, outreach decisions, and diagnostic diagnoses must be made by qualified human counselors.
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name or department..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          {['ALL', 'REQUIRES_REVIEW', 'ELEVATED', 'WATCH'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
                filter === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Triage Cases Table */}
      <div className="glass-card border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Student Case</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Distress Tier</th>
                <th className="py-3.5 px-6">Signal Intensity</th>
                <th className="py-3.5 px-6">Recent Check-In</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-100">{c.studentName}</div>
                    <div className="text-xs text-slate-400">{c.studentEmail} • Year {c.yearOfStudy}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{c.department}</td>
                  <td className="py-4 px-6">{getRiskBadge(c.riskLevel)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{Math.round(c.riskScore * 100)}%</span>
                      <span className="text-xs text-slate-400 capitalize">({c.riskTrend})</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    <span className="text-amber-400 font-medium">Stress {c.recentCheckIn.stress}/10</span> •{' '}
                    <span className="text-teal-400 font-medium">Sleep {c.recentCheckIn.sleepHours}h</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/counselor/cases/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all group-hover:border-indigo-400"
                    >
                      <span>Review Case</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
