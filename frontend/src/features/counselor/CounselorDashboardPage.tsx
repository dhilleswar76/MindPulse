import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, ChevronRight, Scale, Clock, Activity } from 'lucide-react';
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
        setCases(res.data?.cases || res.data || []);
      } catch {
        setCases([
          {
            id: 'case_1042',
            caseId: 'MP-1042',
            userId: 'user_alex_101',
            victimName: 'Alex Rivera (Pseudonymous)',
            victimEmail: 'alex.r@protected.local',
            victimType: 'WITNESS',
            caseStage: 'COURT_TRIAL',
            district: 'Central District',
            state: 'National Capital Region',
            riskLevel: 'ELEVATED',
            riskScore: 0.82,
            riskTrend: 'INCREASING',
            daysInDistress: 4,
            recentCheckIn: {
              mood: 3,
              stress: 9,
              energy: 3,
              sleepHours: 4.0,
              senseOfSafety: 4,
              supportAvailability: 6,
              caseRelatedStress: 9,
              caseStage: 'COURT_TRIAL',
              timestamp: new Date().toISOString(),
            },
            topSignals: [
              { feature: 'Reduced Sleep', impact: 0.32, description: '4.0 hours average sleep during active cross-examination' },
              { feature: 'Court Hearing Stress', impact: 0.28, description: 'Case-related stress reported 9/10 ahead of testimony' },
            ],
            aiSummary: 'Recent check-ins show increased trial anxiety and acute sleep reduction. Marked for prioritized human counselor review.',
            suggestedPathways: ['Trauma Counseling Support', 'Witness Protection Review', 'Legal Aid Accompaniment'],
            interventionsCount: 1,
          },
          {
            id: 'case_1001',
            caseId: 'MP-1001',
            userId: 'user_jordan_102',
            victimName: 'Jordan Chen (Pseudonymous)',
            victimEmail: 'jordan.c@protected.local',
            victimType: 'VICTIM',
            caseStage: 'INVESTIGATION',
            district: 'North District',
            state: 'National Capital Region',
            riskLevel: 'WATCH',
            riskScore: 0.68,
            riskTrend: 'INCREASING',
            daysInDistress: 2,
            recentCheckIn: {
              mood: 4,
              stress: 8,
              energy: 4,
              sleepHours: 5.5,
              senseOfSafety: 6,
              supportAvailability: 7,
              caseRelatedStress: 7,
              caseStage: 'INVESTIGATION',
              timestamp: new Date().toISOString(),
            },
            topSignals: [
              { feature: 'Investigation Stress', impact: 0.26, description: 'Reported stress score 8/10 during evidence phase' },
            ],
            aiSummary: 'Complainant exhibits moderate elevation in stress indicators with emerging sleep disruption.',
            suggestedPathways: ['Wellness Check-in Call', 'Victim Compensation Info'],
            interventionsCount: 0,
          },
          {
            id: 'case_1003',
            caseId: 'MP-1003',
            userId: 'user_taylor_103',
            victimName: 'Taylor Morgan (Pseudonymous)',
            victimEmail: 'taylor.m@protected.local',
            victimType: 'FAMILY_MEMBER',
            caseStage: 'REHABILITATION',
            district: 'South District',
            state: 'National Capital Region',
            riskLevel: 'STABLE',
            riskScore: 0.38,
            riskTrend: 'DECREASING',
            daysInDistress: 0,
            recentCheckIn: {
              mood: 7,
              stress: 4,
              energy: 7,
              sleepHours: 7.0,
              senseOfSafety: 8,
              supportAvailability: 8,
              caseRelatedStress: 3,
              caseStage: 'REHABILITATION',
              timestamp: new Date().toISOString(),
            },
            topSignals: [
              { feature: 'Stabilized Sleep', impact: -0.16, description: 'Sleep restored to 7h baseline' },
            ],
            aiSummary: 'Longitudinal trajectory indicates steady stabilization following rehabilitation assistance.',
            suggestedPathways: ['Periodic Monitoring', 'Community Resource Info'],
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
      (c.caseId && c.caseId.toLowerCase().includes(search.toLowerCase())) ||
      (c.victimName && c.victimName.toLowerCase().includes(search.toLowerCase())) ||
      (c.district && c.district.toLowerCase().includes(search.toLowerCase())) ||
      (c.caseStage && c.caseStage.toLowerCase().includes(search.toLowerCase()));
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

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'COURT_TRIAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">Court / Trial</span>;
      case 'INVESTIGATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">Investigation</span>;
      case 'COMPENSATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">Compensation</span>;
      case 'REHABILITATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Rehabilitation</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">{stage}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Users className="w-7 h-7 text-indigo-400" />
          Counselor Decision Support & Prioritized Case Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          AI-assisted case prioritization and longitudinal wellbeing telemetry for victims and witnesses under the Department of Social Justice and Empowerment (SIH26094).
        </p>
      </div>

      {/* Human-in-the-loop decision support disclaimer */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <strong className="text-white block mb-0.5">Non-Diagnostic Human Decision Support Policy</strong>
          MindPulse telemetry identifies potential distress signals and flags deterioration trends early. All outreach actions, protective measures, and psychological interventions are determined by qualified human counselors and welfare officials.
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
            placeholder="Search by Case ID (MP-1042), stage, or district..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          {['ALL', 'REQUIRES_REVIEW', 'ELEVATED', 'WATCH', 'STABLE'].map((lvl) => (
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
      <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Case Identifier</th>
                <th className="py-3.5 px-6">Victim Type</th>
                <th className="py-3.5 px-6">Case Journey Stage</th>
                <th className="py-3.5 px-6">Distress Risk Tier</th>
                <th className="py-3.5 px-6">Signal Intensity & Trend</th>
                <th className="py-3.5 px-6">Latest Telemetry</th>
                <th className="py-3.5 px-6 text-right">Decision Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCases.map((c) => (
                <tr key={c.id || c.caseId} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-teal-400 font-mono">{c.caseId || 'MP-1042'}</span>
                      <span className="text-xs text-slate-400 font-normal">({c.victimName?.split(' ')[0] || 'Witness'})</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.district || 'Central District'}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {c.victimType || 'WITNESS'}
                    </span>
                  </td>
                  <td className="py-4 px-6">{getStageBadge(c.caseStage)}</td>
                  <td className="py-4 px-6">{getRiskBadge(c.riskLevel)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{Math.round((c.riskScore || 0.72) * 100)}%</span>
                      <span className="text-xs text-slate-400 capitalize">({c.riskTrend || 'increasing'})</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300">
                    <span className="text-rose-400 font-medium">Stress {c.recentCheckIn?.stress || 8}/10</span> •{' '}
                    <span className="text-teal-400 font-medium">Sleep {c.recentCheckIn?.sleepHours || 4.5}h</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/counselor/cases/${c.caseId || c.id}`}
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

