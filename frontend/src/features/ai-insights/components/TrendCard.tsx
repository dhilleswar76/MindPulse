import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendResult } from '../../../services/mlApi';

interface TrendCardProps {
  trend: TrendResult;
}

export const TrendCard: React.FC<TrendCardProps> = ({ trend }) => {
  const direction = (trend.direction || 'INSUFFICIENT_DATA').toUpperCase();
  const isInsufficient = direction === 'INSUFFICIENT_DATA';
  const isDeteriorating =
    direction === 'DETERIORATING' || direction === 'WORSENING';
  const isImproving = direction === 'IMPROVING';

  const recentMA = trend.recent_moving_average || {};
  const historicalMA = trend.historical_moving_average || {};

  // Build comparison chart data across standard features
  const metrics = ['stress', 'sleep', 'mood', 'safety', 'anxiety'];
  const chartData = metrics
    .filter(
      (m) =>
        recentMA[m] !== undefined || historicalMA[m] !== undefined
    )
    .map((metric) => ({
      metric: metric.charAt(0).toUpperCase() + metric.slice(1),
      Recent: recentMA[metric] !== undefined ? Number(recentMA[metric].toFixed(1)) : null,
      Historical:
        historicalMA[metric] !== undefined
          ? Number(historicalMA[metric].toFixed(1))
          : null,
    }));

  const getDirectionBadge = () => {
    if (isInsufficient) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>INSUFFICIENT DATA</span>
        </span>
      );
    }
    if (isDeteriorating) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          <span>DETERIORATING</span>
        </span>
      );
    }
    if (isImproving) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>IMPROVING</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
        <Minus className="w-3.5 h-3.5 text-slate-400" />
        <span>STABLE</span>
      </span>
    );
  };

  return (
    <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Wellbeing Trend Analysis</span>
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Longitudinal slope and moving average trajectory
          </p>
        </div>
        {getDirectionBadge()}
      </div>

      {/* Deterioration Alert Banner */}
      {isDeteriorating && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-300 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block text-rose-200 font-bold mb-0.5">
              Wellbeing trend is deteriorating.
            </strong>
            <span>
              The model detected {trend.consecutive_deterioration_count} consecutive
              deterioration observations. Stress and somatic tension are accelerating.
            </span>
          </div>
        </div>
      )}

      {/* Insufficient Data State */}
      {isInsufficient ? (
        <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-800 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">
            More historical check-ins are needed to establish a reliable trend.
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            A minimum of 2 sequential check-in submissions are required to compute moving averages,
            metric slopes, and acceleration vectors.
          </p>
        </div>
      ) : (
        <>
          {/* Moving Average Comparison Chart */}
          {chartData.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Recent Moving Avg vs. Historical Baseline</span>
                <span className="text-[11px] font-mono">
                  Volatility Index: {(trend.volatility_index || 0).toFixed(2)}
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="Recent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Recent Average" />
                    <Bar dataKey="Historical" fill="#0d9488" radius={[4, 4, 0, 0]} name="Historical Baseline" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Metric Slopes & Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Deteriorations</span>
              <span className="text-lg font-bold text-white">
                {trend.consecutive_deterioration_count} <span className="text-xs text-slate-500 font-normal">consecutive</span>
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Volatility Index</span>
              <span className="text-lg font-bold text-teal-400">
                {(trend.volatility_index || 0).toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Stress Slope</span>
              <span
                className={`text-lg font-bold ${
                  (trend.slopes?.stress_slope || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {trend.slopes?.stress_slope !== undefined
                  ? `${trend.slopes.stress_slope > 0 ? '+' : ''}${trend.slopes.stress_slope.toFixed(2)}`
                  : 'N/A'}
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Safety Slope</span>
              <span
                className={`text-lg font-bold ${
                  (trend.slopes?.safety_slope || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {trend.slopes?.safety_slope !== undefined
                  ? `${trend.slopes.safety_slope > 0 ? '+' : ''}${trend.slopes.safety_slope.toFixed(2)}`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* Model Explanations */}
          {trend.explanation && trend.explanation.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              {trend.explanation.map((exp, idx) => (
                <p key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-teal-400 font-bold shrink-0">•</span>
                  <span>{exp}</span>
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
