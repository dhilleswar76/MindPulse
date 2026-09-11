import React from 'react';
import { Calendar, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ForecastResult } from '../../../services/mlApi';

interface ForecastCardProps {
  forecast: ForecastResult;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  const isAvailable = forecast.forecast_available;
  const trajectory = (forecast.trajectory || 'stable').toLowerCase();
  const points = forecast.forecast_points || [];

  const chartData = points.map((p) => ({
    day: `Day +${p.dayOffset}`,
    score: Math.round(p.predictedScore * 100),
    lower: Math.round(p.confidenceLower * 100),
    upper: Math.round(p.confidenceUpper * 100),
    level: p.projectedLevel,
  }));

  const getTrajectoryBadge = () => {
    if (trajectory.includes('worsen') || trajectory.includes('escalat')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          <span className="capitalize">{trajectory} Trajectory</span>
        </span>
      );
    }
    if (trajectory.includes('improv')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          <span className="capitalize">{trajectory} Trajectory</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
        <Minus className="w-3.5 h-3.5 text-slate-400" />
        <span className="capitalize">{trajectory} Trajectory</span>
      </span>
    );
  };

  return (
    <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>7-Day Distress Risk Forecast</span>
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Forward projection with dynamic confidence intervals
          </p>
        </div>
        {isAvailable && getTrajectoryBadge()}
      </div>

      {!isAvailable ? (
        <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-800 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">
            Forecast Unavailable
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {forecast.reason ||
              'Insufficient historical observations to project a reliable 7-day trajectory.'}
          </p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'score') return [`${value} / 100`, 'Projected Risk'];
                    if (name === 'upper') return [`${value}%`, 'Upper Bound'];
                    if (name === 'lower') return [`${value}%`, 'Lower Bound'];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="#6366f1"
                  fillOpacity={0.12}
                  name="upper"
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fill="url(#forecastGrad)"
                  dot={{ r: 4, fill: '#818cf8' }}
                  name="score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Predicted Distress Trajectory (Day +1 to +7)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20" />
              <span>Uncertainty Envelope (90% Confidence Interval)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
