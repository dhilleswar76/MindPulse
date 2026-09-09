import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Info, Sparkles } from 'lucide-react';

interface Props {
  data: any[];
  baseline?: {
    avgMood?: number;
    avgStress?: number;
    avgSleep?: number;
    avgSafety?: number;
    avgCaseStress?: number;
  };
}

export type TrendViewMode = 'OVERVIEW' | 'REST' | 'SAFETY_STAGE';

export const WellnessTrendChart: React.FC<Props> = ({ data, baseline }) => {
  const [viewMode, setViewMode] = useState<TrendViewMode>('OVERVIEW');

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm glass-card border border-slate-800/80 rounded-xl p-6">
        <Info className="w-8 h-8 text-slate-600 mb-2" />
        <p className="font-medium text-slate-400">No check-in telemetry logged yet.</p>
        <p className="text-xs text-slate-500 mt-1">
          Complete a quick daily check-in to start tracking your wellbeing pattern.
        </p>
      </div>
    );
  }

  // Generate plain-language summary based on recent data vs baseline
  const recentItem = data[data.length - 1];
  const priorItem = data.length > 2 ? data[data.length - 3] : data[0];

  const getSummaryInsight = () => {
    if (!recentItem) return 'Check-in data is recording steadily.';

    if (recentItem.caseRelatedStress >= 7 && recentItem.sleepHours < 6) {
      return 'Over recent days, case-related tension has been elevated alongside reduced sleep hours during court/trial proceedings. Supportive grounding tools and counselor touchpoints are recommended.';
    }
    if (recentItem.stress > (baseline?.avgStress ?? 5) + 1.5) {
      return 'Recent check-ins show stress levels higher than your usual 14-day pattern. Consider taking a restorative break or trying a breathing exercise.';
    }
    if (recentItem.sleepHours >= 7 && recentItem.senseOfSafety >= 7) {
      return 'Your recent sleep and sense of safety reflect a stable, well-supported pattern.';
    }
    return 'Your wellbeing pattern is currently tracking close to your personal historical normal.';
  };

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('OVERVIEW')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'OVERVIEW'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mood & Stress
          </button>
          <button
            type="button"
            onClick={() => setViewMode('REST')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'REST'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sleep & Energy
          </button>
          <button
            type="button"
            onClick={() => setViewMode('SAFETY_STAGE')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'SAFETY_STAGE'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Safety & Case Tension
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          Tracking <strong className="text-slate-200">{data.length} entries</strong>
        </span>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis
              domain={[0, 10]}
              ticks={[2, 4, 6, 8, 10]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />

            {/* View Mode: OVERVIEW */}
            {viewMode === 'OVERVIEW' && (
              <>
                {baseline?.avgMood && (
                  <ReferenceLine
                    y={baseline.avgMood}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    opacity={0.35}
                    label={{ value: `Mood Baseline (${baseline.avgMood})`, fill: '#10b981', fontSize: 10 }}
                  />
                )}
                {baseline?.avgStress && (
                  <ReferenceLine
                    y={baseline.avgStress}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    opacity={0.35}
                    label={{ value: `Stress Baseline (${baseline.avgStress})`, fill: '#f59e0b', fontSize: 10 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="General Mood"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  name="General Stress"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}

            {/* View Mode: REST */}
            {viewMode === 'REST' && (
              <>
                {baseline?.avgSleep && (
                  <ReferenceLine
                    y={baseline.avgSleep}
                    stroke="#14b8a6"
                    strokeDasharray="3 3"
                    opacity={0.4}
                    label={{ value: `Sleep Baseline (${baseline.avgSleep}h)`, fill: '#14b8a6', fontSize: 10 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="sleepHours"
                  name="Sleep Hours"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#14b8a6' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  name="Subjective Energy"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5, fill: '#6366f1' }}
                />
              </>
            )}

            {/* View Mode: SAFETY_STAGE */}
            {viewMode === 'SAFETY_STAGE' && (
              <>
                <Line
                  type="monotone"
                  dataKey="senseOfSafety"
                  name="Perceived Sense of Safety"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="caseRelatedStress"
                  name="Case / Court Tension"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 5 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Human-readable insight banner */}
      <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-100 font-semibold block mb-0.5">Pattern Summary</strong>
          <p className="leading-relaxed text-slate-300">{getSummaryInsight()}</p>
        </div>
      </div>
    </div>
  );
};
