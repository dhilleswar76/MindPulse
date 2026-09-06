import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Clock, Calendar, ArrowRight, Shield } from 'lucide-react';
import api from '../../services/api';
import { Intervention } from '../../types';

export const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [outcomes, setOutcomes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intRes, outRes]: any = await Promise.all([
          api.get('/interventions'),
          api.get('/interventions/outcomes/user_alex_101'),
        ]);
        setInterventions(intRes.data?.interventions || []);
        setOutcomes(outRes.data);
      } catch {
        setInterventions([
          {
            _id: '1',
            userId: 'user_alex_101',
            studentName: 'Alex Rivera',
            counselorId: 'c1',
            counselorName: 'Dr. Sarah Jenkins',
            type: 'COUNSELING_SESSION',
            status: 'ACTIVE',
            clinicalNotes: 'Introduced 4-7-8 relaxation and discussed digital cutoff before sleep.',
            scheduledDate: new Date().toISOString(),
            riskBeforeScore: 0.82,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: '2',
            userId: 'user_taylor_103',
            studentName: 'Taylor Morgan',
            counselorId: 'c1',
            counselorName: 'Dr. Sarah Jenkins',
            type: 'RESOURCE_REFERRAL',
            status: 'COMPLETED',
            clinicalNotes: 'Connected with peer tutoring services and sleep hygiene checklist.',
            scheduledDate: new Date(Date.now() - 604800000).toISOString(),
            completedDate: new Date(Date.now() - 172800000).toISOString(),
            riskBeforeScore: 0.65,
            riskAfterScore: 0.38,
            createdAt: new Date(Date.now() - 604800000).toISOString(),
          },
        ]);
        setOutcomes({
          observedTrend: 'Observed trend after intervention indicates declining distress signal indicators.',
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Activity className="w-7 h-7 text-indigo-400" />
          Interventions & Outcome Tracking
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor active counselor interventions and observed telemetry trends before vs. after support.
        </p>
      </div>

      {/* Outcome Comparison Hero Card */}
      {outcomes && (
        <div className="glass-card p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100">Observed Telemetry Delta Post-Intervention</h2>
            <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Non-Causal Observed Signal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center my-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Risk Before Intervention</span>
              <span className="text-2xl font-bold text-rose-400">{Math.round(outcomes.beforeScore * 100)}%</span>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Risk After Intervention</span>
              <span className="text-2xl font-bold text-emerald-400">{Math.round(outcomes.afterScore * 100)}%</span>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Signal Reduction Delta</span>
              <span className="text-2xl font-bold text-teal-400">-{outcomes.percentageReduction}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-2">
            Language Notice: We document <em>observed trends</em> following counselor support rather than asserting clinical causal certainty.
          </p>
        </div>
      )}

      {/* Interventions Log */}
      <div className="glass-card p-6 border border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Logged Counselor Interventions</h2>
        <div className="space-y-4">
          {interventions.map((int) => (
            <div key={int._id} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-100">{int.studentName || 'Alex Rivera'}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {int.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Status: <strong className="text-teal-300">{int.status}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{int.clinicalNotes}</p>
                <div className="text-[11px] text-slate-500">
                  Counselor: {int.counselorName || 'Dr. Sarah Jenkins'} • Scheduled: {new Date(int.scheduledDate || '').toLocaleDateString()}
                </div>
              </div>

              {int.riskBeforeScore && (
                <div className="text-right shrink-0 flex md:flex-col justify-between items-end">
                  <div className="text-xs text-slate-400">
                    Pre-score: <strong className="text-rose-400">{Math.round(int.riskBeforeScore * 100)}%</strong>
                  </div>
                  {int.riskAfterScore && (
                    <div className="text-xs text-slate-400">
                      Post-score: <strong className="text-emerald-400">{Math.round(int.riskAfterScore * 100)}%</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
