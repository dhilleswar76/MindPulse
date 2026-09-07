import React, { useState } from 'react';
import { Sliders, Sparkles, Shield, TrendingDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const WhatIfSimulatorPage: React.FC = () => {
  const [counselingPct, setCounselingPct] = useState(25);
  const [peerSupport, setPeerSupport] = useState(true);
  const [examDecompression, setExamDecompression] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>({
    projectedImpact: {
      stressTrendDelta: '-0.9 pts',
      supportUtilizationDelta: '+24%',
      projectedHighRiskDecline: '-31%',
    },
    disclaimer: 'Simulation / decision-support estimate. Assesses directional policy impact for resource planning.',
  });

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res: any = await api.post('/analytics/simulate', {
        addCounselingHoursPct: counselingPct,
        launchPeerSupportGroup: peerSupport,
        examScheduleDecompression: examDecompression,
      });
      setSimulationResult(res.data);
    } catch {
      setSimulationResult({
        projectedImpact: {
          stressTrendDelta: `-${((counselingPct / 100) * 1.4 + (peerSupport ? 0.6 : 0) + (examDecompression ? 0.9 : 0)).toFixed(1)} pts`,
          supportUtilizationDelta: `+${Math.round(counselingPct * 0.5 + (peerSupport ? 16 : 0))}%`,
          projectedHighRiskDecline: `-${Math.round((counselingPct / 100) * 22 + (peerSupport ? 10 : 0) + (examDecompression ? 18 : 0))}%`,
        },
        disclaimer: 'Simulation / decision-support estimate.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Sliders className="w-7 h-7 text-teal-400" />
          What-If Welfare & Support Policy Simulator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Model hypothetical district welfare initiatives, witness protection measures, and compensation speedups.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3">
        <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-teal-300 block mb-0.5">Policy Simulation Safeguard</strong>
          Outputs are predictive decision-support estimates derived from synthetic regression curves. They assist district officers in resource planning and do not claim causal certainty.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scenario Parameter Controls */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Configure Support Interventions</span>
          </h2>

          {/* Slider: Expand DLSA Legal Aid & Counselors */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">
                Expand DLSA Legal Aid Advocates & Trauma Counselors
              </label>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                +{counselingPct}% capacity
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={counselingPct}
              onChange={(e) => setCounselingPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          {/* Checkbox: Witness transit & safehouse */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer" onClick={() => setPeerSupport(!peerSupport)}>
            <div>
              <span className="text-sm font-semibold text-slate-200 block">Protected Safe Transit & Witness Escort</span>
              <span className="text-xs text-slate-400">Establish dedicated police escort & transit for court testimony</span>
            </div>
            <input
              type="checkbox"
              checked={peerSupport}
              onChange={() => {}}
              className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-800 w-4 h-4"
            />
          </div>

          {/* Checkbox: Fast-track interim compensation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer" onClick={() => setExamDecompression(!examDecompression)}>
            <div>
              <span className="text-sm font-semibold text-slate-200 block">Fast-Track Interim Compensation Release</span>
              <span className="text-xs text-slate-400">Expedite 357A CrPC first-stage disbursement within 14 days of FIR</span>
            </div>
            <input
              type="checkbox"
              checked={examDecompression}
              onChange={() => {}}
              className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-800 w-4 h-4"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white font-semibold rounded-xl text-sm shadow-lg transition-all"
          >
            {isSimulating ? 'Computing Simulation...' : 'Run Scenario Simulation'}
          </button>
        </div>

        {/* Projected Impact Card */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>Simulated District Impact Projections</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Estimated directional outcome on victim recovery & distress reduction
            </p>

            {simulationResult && (
              <div className="space-y-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Overall Stress Index Trend</span>
                    <span className="text-xs text-slate-500">Population-level moving delta</span>
                  </div>
                  <span className="text-2xl font-bold text-teal-400">
                    {simulationResult.projectedImpact.stressTrendDelta}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Wellness Support Utilization</span>
                    <span className="text-xs text-slate-500">Early check-in participation</span>
                  </div>
                  <span className="text-2xl font-bold text-indigo-400">
                    {simulationResult.projectedImpact.supportUtilizationDelta}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">High Distress Cohort Decline</span>
                    <span className="text-xs text-slate-500">Predicted reduction in acute cases</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">
                    {simulationResult.projectedImpact.projectedHighRiskDecline}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            {simulationResult?.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
