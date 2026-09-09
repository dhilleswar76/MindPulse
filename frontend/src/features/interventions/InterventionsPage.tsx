import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Shield,
  Scale,
  Landmark,
  HeartHandshake,
  Plus,
  Sparkles,
  TrendingDown,
  FileText,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Intervention } from '../../types';

export const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [outcomes, setOutcomes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intRes, outRes]: any = await Promise.all([
          api.get('/interventions'),
          api.get('/interventions/outcomes/user_alex_101'),
        ]);
        setInterventions(intRes.data?.interventions || intRes.data || []);
        setOutcomes(outRes.data);
      } catch {
        setInterventions([
          {
            _id: '1',
            userId: 'user_alex_101',
            caseId: 'MP-1042',
            victimName: 'Alex Rivera (Protected Witness)',
            counselorId: 'c1',
            counselorName: 'Dr. Sarah Jenkins',
            type: 'COUNSELLING',
            status: 'ACTIVE',
            clinicalNotes:
              'Conducted trauma-informed grounding ahead of Special Court cross-examination. Established witness protection transport liaison and daily 4-7-8 parasympathetic exercise protocol.',
            scheduledDate: new Date().toISOString(),
            riskBeforeScore: 0.82,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: '2',
            userId: 'user_taylor_103',
            caseId: 'MP-1003',
            victimName: 'Taylor Morgan (Family Member)',
            counselorId: 'c1',
            counselorName: 'Dr. Sarah Jenkins',
            type: 'LEGAL_AID',
            status: 'COMPLETED',
            clinicalNotes:
              'Facilitated NALSA Legal Aid accompaniment and submitted Victim Compensation Scheme paperwork to District Legal Services Authority.',
            scheduledDate: new Date(Date.now() - 604800000).toISOString(),
            completedDate: new Date(Date.now() - 172800000).toISOString(),
            riskBeforeScore: 0.65,
            riskAfterScore: 0.38,
            createdAt: new Date(Date.now() - 604800000).toISOString(),
          },
          {
            _id: '3',
            userId: 'user_jordan_102',
            caseId: 'MP-1001',
            victimName: 'Jordan Chen (Direct Victim)',
            counselorId: 'c1',
            counselorName: 'Dr. Sarah Jenkins',
            type: 'FINANCIAL_ASSISTANCE',
            status: 'ACTIVE',
            clinicalNotes:
              'Assisted in filing interim relief application under Section 357A CrPC with Special Public Prosecutor.',
            scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString(),
            riskBeforeScore: 0.68,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          }
        ]);
        setOutcomes({
          observedTrend: 'Observed trend after support coordination indicates declining distress signal indicators across monitored cohorts.',
          beforeScore: 0.82,
          afterScore: 0.45,
          percentageReduction: 45.1,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkComplete = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, status: 'COMPLETED', completedDate: new Date().toISOString(), riskAfterScore: 0.42 }
          : item
      )
    );
  };

  const filteredInterventions = interventions.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Support Actions & Lifecycle
            </span>
            <span className="text-xs text-slate-400">• Action → Follow-up → Outcome Telemetry</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-8 h-8 text-indigo-400" />
            Support Pathways & Outcome Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Manage counseling sessions, legal aid coordination, witness protection liaison, and compensation assistance. Track longitudinal before-vs-after outcome trajectories.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Support Pathways' : st === 'ACTIVE' ? 'Active / In Progress' : 'Completed Actions'}
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Telemetry Hero Card */}
      {outcomes && (
        <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">Observed Telemetry Trajectory Post-Support</h2>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 font-medium">
              Non-Diagnostic Observed Signal Comparison
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-3">
            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/90 text-center">
              <span className="text-xs text-slate-400 block mb-1">Pre-Support Distress Signal</span>
              <span className="text-3xl font-extrabold text-rose-400">{Math.round(outcomes.beforeScore * 100)}%</span>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">ELEVATED Attention Tier</span>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/90 text-center">
              <span className="text-xs text-slate-400 block mb-1">Follow-up Telemetry Signal</span>
              <span className="text-3xl font-extrabold text-emerald-400">{Math.round(outcomes.afterScore * 100)}%</span>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">WATCH / STABILIZING Tier</span>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/90 text-center">
              <span className="text-xs text-slate-400 block mb-1">Observed Telemetry Delta</span>
              <span className="text-3xl font-extrabold text-teal-400">-{outcomes.percentageReduction}%</span>
              <span className="text-[11px] text-emerald-400 block mt-1 font-medium flex items-center justify-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Stabilizing trend direction
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3 pt-3 border-t border-slate-800/80">
            Policy Notice: Telemetry documents <em>observed longitudinal patterns</em> following support coordination. MindPulse does not assert medical diagnosis or clinical causal certainty.
          </p>
        </div>
      )}

      {/* Scheduled Follow-ups Queue */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Scheduled Follow-Up Tasks</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Upcoming counselor review contacts and participant check-ins</p>
          </div>
          <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-slate-800">
            2 Due Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-teal-400 font-bold text-xs bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  MP-1042
                </span>
                <span className="text-sm font-semibold text-white">Alex Rivera</span>
                <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded">Due Today</span>
              </div>
              <p className="text-xs text-slate-400">Pre-hearing grounding protocol follow-up</p>
            </div>
            <Link
              to="/counselor/cases/MP-1042"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Open Case
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-teal-400 font-bold text-xs bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  MP-1001
                </span>
                <span className="text-sm font-semibold text-white">Jordan Chen</span>
                <span className="text-xs text-teal-300 font-semibold bg-teal-500/10 px-2 py-0.5 rounded">In 2 Days</span>
              </div>
              <p className="text-xs text-slate-400">Interim compensation paperwork check-in</p>
            </div>
            <Link
              to="/counselor/cases/MP-1001"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              Open Case
            </Link>
          </div>
        </div>
      </div>

      {/* Main Interventions Log */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">All Logged Support Pathways & Actions</h2>
          <span className="text-xs text-slate-400">{filteredInterventions.length} records</span>
        </div>

        <div className="space-y-4">
          {filteredInterventions.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col lg:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-teal-400 font-bold text-xs bg-teal-500/10 px-2.5 py-0.5 rounded border border-teal-500/20">
                    {item.caseId || 'MP-1042'}
                  </span>
                  <span className="text-sm font-bold text-white">{item.victimName || 'Alex Rivera'}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                      item.status === 'ACTIVE'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {item.clinicalNotes}
                </p>

                <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                  <span>Counselor: <strong className="text-slate-400">{item.counselorName || 'Dr. Sarah Jenkins'}</strong></span>
                  <span>Scheduled: <strong className="text-slate-400">{new Date(item.scheduledDate || item.createdAt).toLocaleDateString()}</strong></span>
                  {item.completedDate && (
                    <span>Completed: <strong className="text-emerald-400">{new Date(item.completedDate).toLocaleDateString()}</strong></span>
                  )}
                </div>
              </div>

              <div className="flex lg:flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-5 shrink-0 gap-3">
                <div className="text-right">
                  {item.riskBeforeScore && (
                    <div className="text-xs text-slate-400">
                      Baseline Score: <strong className="text-rose-400">{Math.round(item.riskBeforeScore * 100)}%</strong>
                    </div>
                  )}
                  {item.riskAfterScore && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Follow-up Score: <strong className="text-emerald-400">{Math.round(item.riskAfterScore * 100)}%</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleMarkComplete(item._id)}
                      className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}
                  <Link
                    to={`/counselor/cases/${item.caseId || 'MP-1042'}`}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    View Case
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
