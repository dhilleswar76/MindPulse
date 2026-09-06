import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api';

export const ForecastingPage: React.FC = () => {
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [trajectory, setTrajectory] = useState('escalating');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res: any = await api.get('/forecast');
        if (res.data?.forecast) {
          setForecastData(
            res.data.forecast.map((f: any) => ({
              day: `+${f.dayOffset} Day`,
              score: Math.round(f.predictedScore * 100),
              lower: Math.round(f.confidenceLower * 100),
              upper: Math.round(f.confidenceUpper * 100),
              level: f.projectedLevel,
            }))
          );
          setTrajectory(res.data.trajectoryDirection || 'escalating');
        }
      } catch {
        setForecastData([
          { day: '+1 Day', score: 48, lower: 38, upper: 58, level: 'WATCH' },
          { day: '+2 Day', score: 52, lower: 40, upper: 64, level: 'WATCH' },
          { day: '+3 Day', score: 57, lower: 43, upper: 71, level: 'ELEVATED' },
          { day: '+4 Day', score: 62, lower: 46, upper: 78, level: 'ELEVATED' },
          { day: '+5 Day', score: 66, lower: 48, upper: 84, level: 'ELEVATED' },
          { day: '+6 Day', score: 71, lower: 51, upper: 91, level: 'ELEVATED' },
          { day: '+7 Day', score: 75, lower: 53, upper: 97, level: 'REQUIRES_REVIEW' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForecast();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-indigo-400" />
          Early Distress Forecasting (7-Day Projection)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Predictive time-series trajectory highlighting whether current telemetry is stabilizing or escalating.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Projected Distress Trajectory</h2>
              <p className="text-xs text-slate-400">Based on longitudinal decay and 7-day sleep deficits</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Direction:</span>
              <span className={`font-bold capitalize ${trajectory === 'escalating' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {trajectory}
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Projected Risk Score"
                  stroke="#818cf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#forecastGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border border-slate-800">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Proactive Early Support
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              If your current study routine and sleep patterns continue on their present trend, distress indicators may reach an elevated state by Day +4.
            </p>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <strong className="text-slate-200 block">Recommended Action Steps:</strong>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                <span>Adjust nighttime study schedule to recover 1.5h sleep</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                <span>Practice 5-minute NSDR relaxation technique</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
