import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Shield,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Scale,
  Landmark,
  HeartHandshake
} from 'lucide-react';
import api from '../../services/api';

export const WhatIfSimulatorPage: React.FC = () => {
  const [counselingPct, setCounselingPct] = useState(25);
  const [transitSupport, setTransitSupport] = useState(true);
  const [fastTrackCompensation, setFastTrackCompensation] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>({
    projectedImpact: {
      stressTrendDelta: '-1.4 pts',
      supportUtilizationDelta: '+28%',
      projectedHighRiskDecline: '-35%',
    },
    disclaimer: 'Predictive decision-support estimate derived from synthetic regression curves. Assisting district officers in resource allocation and policy planning.',
  });

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res: any = await api.post('/analytics/simulate', {
        addCounselingHoursPct: counselingPct,
        launchPeerSupportGroup: transitSupport,
        examScheduleDecompression: fastTrackCompensation,
      });
      setSimulationResult(res.data);
    } catch {
      setSimulationResult({
        projectedImpact: {
          stressTrendDelta: `-${((counselingPct / 100) * 1.4 + (transitSupport ? 0.6 : 0) + (fastTrackCompensation ? 0.9 : 0)).toFixed(1)} pts`,
          supportUtilizationDelta: `+${Math.round(counselingPct * 0.5 + (transitSupport ? 16 : 0))}%`,
          projectedHighRiskDecline: `-${Math.round((counselingPct / 100) * 22 + (transitSupport ? 10 : 0) + (fastTrackCompensation ? 18 : 0))}%`,
        },
        disclaimer: 'Predictive decision-support estimate derived from synthetic regression curves.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setCounselingPct(25);
    setTransitSupport(true);
    setFastTrackCompensation(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Policy & Resource Planning
            </span>
            <span className="text-xs text-slate-400">• Multi-Variable Impact Estimation</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="w-8 h-8 text-teal-400" />
            Policy What-If & Resource Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Model hypothetical welfare initiatives, expanded witness protection escorts, and accelerated Section 357A CrPC compensation disbursements to forecast population distress reduction.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Scenario Defaults</span>
        </button>
      </div>

      {/* Safeguard Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex items-start gap-3.5">
        <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-teal-300 block mb-0.5 font-semibold">
            Predictive Policy Simulation Safeguard
          </strong>
          Projections are mathematical directional estimates derived from regression models to assist district nodal officers in allocating budgets and staffing. They do not represent empirical guarantees or clinical diagnoses.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scenario Controls */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 rounded-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">1. Configure Scenario Levers</h2>
            <p className="text-xs text-slate-400">Adjust resource levers to evaluate simulated distress trajectory shifts</p>
          </div>

          {/* Lever 1: Expand Legal Aid & Counselors */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-semibold text-slate-200 block">
                  Expand DLSA Legal Aid Advocates & Trauma Counselors
                </label>
                <span className="text-[11px] text-slate-400">Increase district counseling staffing capacity</span>
              </div>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          {/* Lever 2: Witness Transit & Escorts */}
          <div
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
            onClick={() => setTransitSupport(!transitSupport)}
          >
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Protected Safe Transit & Dedicated Witness Escort
              </span>
              <span className="text-[11px] text-slate-400">
                Deploy police escort vehicles and safe transit corridors for testimony days
              </span>
            </div>
            <input
              type="checkbox"
              checked={transitSupport}
              onChange={() => {}}
              className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-800 w-4 h-4"
            />
          </div>

          {/* Lever 3: Fast-Track Interim Compensation */}
          <div
            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
            onClick={() => setFastTrackCompensation(!fastTrackCompensation)}
          >
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Fast-Track Interim Victim Compensation (Section 357A CrPC)
              </span>
              <span className="text-[11px] text-slate-400">
                Expedite first-stage compensation disbursement within 14 days of FIR filing
              </span>
            </div>
            <input
              type="checkbox"
              checked={fastTrackCompensation}
              onChange={() => {}}
              className="rounded border-slate-700 text-teal-500 focus:ring-teal-500 bg-slate-800 w-4 h-4"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
          >
            {isSimulating ? 'Calculating Directional Impact...' : 'Run Scenario Simulation'}
          </button>
        </div>

        {/* Projected Impact Output */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 rounded-2xl flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <span>2. Projected Population Impact</span>
              </h2>
              <span className="text-xs bg-slate-950 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-medium">
                Simulation Output
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Estimated directional outcome on victim recovery, trial confidence, and distress reduction
            </p>

            {simulationResult && (
              <div className="space-y-4">
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-300 font-semibold block">Overall Stress Index Reduction</span>
                    <span className="text-[11px] text-slate-500">Population-level moving delta</span>
                  </div>
                  <span className="text-3xl font-extrabold text-teal-400">
                    {simulationResult.projectedImpact.stressTrendDelta}
                  </span>
                </div>

                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-300 font-semibold block">Support Pathway Engagement</span>
                    <span className="text-[11px] text-slate-500">Early check-in & counseling participation</span>
                  </div>
                  <span className="text-3xl font-extrabold text-indigo-400">
                    {simulationResult.projectedImpact.supportUtilizationDelta}
                  </span>
                </div>

                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-300 font-semibold block">Acute Distress Cohort Decline</span>
                    <span className="text-[11px] text-slate-500">Predicted reduction in high-distress cases</span>
                  </div>
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {simulationResult.projectedImpact.projectedHighRiskDecline}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            {simulationResult?.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
};
