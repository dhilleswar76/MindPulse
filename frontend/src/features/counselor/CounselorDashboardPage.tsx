import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ChevronRight,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Filter,
  Eye,
  HeartHandshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CounselorCase } from '../../types';
import { AIInsightsDashboard } from '../ai-insights/AIInsightsDashboard';

export const CounselorDashboardPage: React.FC = () => {
  const [cases, setCases] = useState<CounselorCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedAiCaseId, setSelectedAiCaseId] = useState<string>('MP-1042');

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
            victimName: 'Alex Rivera (Pseudonymous Witness)',
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
              { feature: 'Sleep Reduction', impact: 0.32, description: '4.0h average sleep during active cross-examination (2.8h below personal baseline)' },
              { feature: 'Pre-Trial Tension', impact: 0.28, description: 'Case-related stress reported 9/10 ahead of testimony' },
              { feature: 'Safety Perception Delta', impact: 0.22, description: 'Safety score dropped from 8.0 baseline to 4.0' },
            ],
            aiSummary: 'Recent check-ins show increased trial anxiety and acute sleep reduction. Marked for prioritized human counselor review.',
            suggestedPathways: ['Trauma-Informed Grounding', 'Witness Protection Review', 'Legal Aid Accompaniment'],
            interventionsCount: 1,
          },
          {
            id: 'case_1001',
            caseId: 'MP-1001',
            userId: 'user_jordan_102',
            victimName: 'Jordan Chen (Pseudonymous Victim)',
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
              { feature: 'Investigation Anxiety', impact: 0.26, description: 'Reported stress score 8/10 during evidence phase' },
              { feature: 'Energy Depletion', impact: 0.20, description: 'Energy dropped 2.0 points below personal baseline' },
            ],
            aiSummary: 'Complainant exhibits moderate elevation in stress indicators with emerging sleep disruption during forensic review.',
            suggestedPathways: ['Wellness Check-in Call', 'Victim Compensation Scheme Info'],
            interventionsCount: 0,
          },
          {
            id: 'case_1003',
            caseId: 'MP-1003',
            userId: 'user_taylor_103',
            victimName: 'Taylor Morgan (Family Member)',
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
              { feature: 'Stabilized Sleep', impact: -0.16, description: 'Sleep restored to 7.0h personal baseline' },
              { feature: 'Support Engagement', impact: -0.20, description: 'Active participation in social rehabilitation programs' },
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
    const matchesRisk = filter === 'ALL' || c.riskLevel === filter;
    const matchesStage = stageFilter === 'ALL' || c.caseStage === stageFilter;
    const matchesSearch =
      (c.caseId && c.caseId.toLowerCase().includes(search.toLowerCase())) ||
      (c.victimName && c.victimName.toLowerCase().includes(search.toLowerCase())) ||
      (c.district && c.district.toLowerCase().includes(search.toLowerCase())) ||
      (c.caseStage && c.caseStage.toLowerCase().includes(search.toLowerCase()));
    return matchesRisk && matchesStage && matchesSearch;
  });

  const selectedCase =
    cases.find((c) => c.caseId === selectedAiCaseId || c.id === selectedAiCaseId) ||
    cases[0];

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'REQUIRES_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Requires Review
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Elevated Attention
          </span>
        );
      case 'WATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Watch Pattern
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Stable Trajectory
          </span>
        );
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

  const highPriorityCases = cases.filter(c => c.riskLevel === 'ELEVATED' || c.riskLevel === 'REQUIRES_REVIEW');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Daily Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Counselor Command Center
            </span>
            <span className="text-xs text-slate-400">• Mental Model: Cases → Signals → Actions → Outcomes</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-8 h-8 text-indigo-400" />
            Triage & Prioritized Caseload Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            What needs your attention today? Review longitudinal telemetry deviations, verify AI-assisted evidence, and coordinate timely trauma-informed support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/counselor/alerts"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Review Live Alerts</span>
          </Link>
          <Link
            to="/counselor/interventions"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Support Pathways & Follow-ups</span>
          </Link>
        </div>
      </div>

      {/* Non-Diagnostic Decision Support Notice */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-3.5">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200/90 leading-relaxed">
          <strong className="text-white block mb-0.5 font-semibold">
            Human-in-the-Loop Clinical Decision Support Standard
          </strong>
          MindPulse telemetry identifies potential longitudinal distress signals and flags baseline deviations early. AI syntheses are informational; all outreach, protective measures, and support actions require qualified human counselor evaluation.
        </div>
      </div>

      {/* Daily Command Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Priority Attention Needed</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{highPriorityCases.length} Cases</div>
          <p className="text-[11px] text-rose-400 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Marked for proactive review</span>
          </p>
        </div>

        <div className="glass-card p-5 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Scheduled Follow-ups</span>
            <Calendar className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">2 Due Today</div>
          <p className="text-[11px] text-teal-300 mt-2 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>4 upcoming this week</span>
          </p>
        </div>

        <div className="glass-card p-5 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Support Pathways</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">3 Active</div>
          <p className="text-[11px] text-indigo-300 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Counseling, legal aid & protection</span>
          </p>
        </div>

        <div className="glass-card p-5 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Outcome Telemetry Delta</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">-45.1%</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Observed distress reduction post-support
          </p>
        </div>
      </div>

      {/* Priority Review Spotlight: "Why This Case Is Prioritized" */}
      {highPriorityCases.length > 0 && (
        <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Immediate Priority Review Spotlight</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cases with acute baseline deviations requiring counselor attention today
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              {highPriorityCases.length} cases flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highPriorityCases.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-400 font-bold text-sm bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20">
                        {c.caseId}
                      </span>
                      <span className="text-sm font-semibold text-white">{c.victimName}</span>
                    </div>
                    {getRiskBadge(c.riskLevel)}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {getStageBadge(c.caseStage)}
                    <span className="text-xs text-slate-400">• {c.district}</span>
                    <span className="text-xs text-slate-400">• {c.daysInDistress} days in distress</span>
                  </div>

                  {/* "What Changed" Summary */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 text-xs text-slate-300 mb-3 space-y-1">
                    <span className="font-semibold text-indigo-300 block text-[11px] uppercase tracking-wider">
                      Why this case is prioritized:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-slate-800 text-rose-300 px-2 py-0.5 rounded text-[11px] border border-rose-500/20">
                        Stress ↑ {c.recentCheckIn?.stress}/10
                      </span>
                      <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[11px] border border-amber-500/20">
                        Sleep ↓ {c.recentCheckIn?.sleepHours}h
                      </span>
                      <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded text-[11px] border border-indigo-500/20">
                        Mood {c.recentCheckIn?.mood}/10
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1">
                      {c.aiSummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500">
                    Last check-in: {new Date(c.recentCheckIn?.timestamp || '').toLocaleDateString()}
                  </span>
                  <Link
                    to={`/counselor/cases/${c.caseId || c.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    <span>Review Case</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Caseload Triage Queue */}
      <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div>
            <h2 className="text-base font-bold text-white">Full Caseload Triage Matrix</h2>
            <p className="text-xs text-slate-400">Search, filter by risk tier, or filter by legal journey stage</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search case ID, name, district..."
                className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
              />
            </div>

            {/* Risk Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'ELEVATED', 'WATCH', 'STABLE'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === lvl ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Stage Filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Stages</option>
              <option value="CASE_REGISTRATION">Case Registration</option>
              <option value="INVESTIGATION">Investigation</option>
              <option value="COURT_TRIAL">Court / Trial</option>
              <option value="COMPENSATION">Compensation</option>
              <option value="REHABILITATION">Rehabilitation</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Case & Identifier</th>
                <th className="py-3.5 px-6">Participant Role</th>
                <th className="py-3.5 px-6">Legal Journey Stage</th>
                <th className="py-3.5 px-6">Distress Attention Tier</th>
                <th className="py-3.5 px-6">Telemetry & Deviation</th>
                <th className="py-3.5 px-6">Active Pathways</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No cases match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id || c.caseId} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="text-teal-400 font-mono">{c.caseId || 'MP-1042'}</span>
                        <span className="text-slate-300 font-medium">{c.victimName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.district} • {c.state}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                        {c.victimType || 'WITNESS'}
                      </span>
                    </td>
                    <td className="py-4 px-6">{getStageBadge(c.caseStage)}</td>
                    <td className="py-4 px-6">{getRiskBadge(c.riskLevel)}</td>
                    <td className="py-4 px-6">
                      <div className="text-slate-300 space-y-0.5">
                        <div>
                          <strong className="text-rose-400">Stress {c.recentCheckIn?.stress || 8}/10</strong> •{' '}
                          <strong className="text-teal-300">Sleep {c.recentCheckIn?.sleepHours || 4.5}h</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {c.riskTrend === 'INCREASING' ? '↑ Increasing tension' : '↓ Decreasing / Stabilizing'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                        {c.interventionsCount} Logged
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/counselor/cases/${c.caseId || c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-lg font-semibold transition-all group-hover:border-indigo-400 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Case</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Section: AI-Powered Case Insights & Decision Support */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                Professional Decision Support
              </span>
              <span className="text-xs text-slate-400">• Real-Time ML Telemetry</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>AI Case Insights & Clinical Review</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Examine real-time ML risk predictions, personal baseline anomalies, and SHAP explainability for case evaluation.
            </p>
          </div>

          {cases.length > 0 && (
            <div className="flex items-center gap-2.5">
              <label htmlFor="ai-case-select" className="text-xs text-slate-400 font-medium whitespace-nowrap">
                Inspect Case:
              </label>
              <select
                id="ai-case-select"
                value={selectedCase?.caseId || selectedAiCaseId}
                onChange={(e) => setSelectedAiCaseId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                {cases.map((c) => (
                  <option key={c.id || c.caseId} value={c.caseId || c.id}>
                    {c.caseId} — {c.victimName} ({c.riskLevel})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedCase ? (
          <AIInsightsDashboard
            key={selectedCase.caseId || selectedCase.id}
            userId={selectedCase.userId}
            caseId={selectedCase.caseId}
            caseStage={selectedCase.caseStage}
            initialCheckIns={
              selectedCase.recentCheckIn ? [selectedCase.recentCheckIn] : undefined
            }
          />
        ) : (
          <div className="p-8 text-center glass-card border border-slate-800 rounded-2xl text-xs text-slate-400">
            Select a case above to inspect AI insights.
          </div>
        )}
      </section>
    </div>
  );
};
