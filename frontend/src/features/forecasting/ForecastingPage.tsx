import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle, Sparkles, HeartHandshake, Shield, Info, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            7-Day Wellbeing Forecast & Early Guidance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Proactive time-series estimation showing how upcoming case milestones may affect your rest and stress patterns.
          </p>
        </div>

        <Link
          to="/support"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition-colors self-start sm:self-auto"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Plan Ahead With Counselor</span>
        </Link>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 block mb-0.5">Non-Diagnostic Proactive Planning</strong>
          This 7-day forecast estimates how cumulative sleep deficits and approaching court dates may influence your tension. It is designed to help you plan rest and schedule support before difficult hearing days.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Projected Stress Sensitivity Curve</h2>
              <p className="text-xs text-slate-400 mt-0.5">Estimated trajectory leading up to your court hearing</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Trend:</span>
              <span className={`font-bold capitalize ${trajectory === 'escalating' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {trajectory === 'escalating' ? 'Temporary Pre-Hearing Rise' : 'Stabilizing'}
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Projected Tension Index"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#forecastGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Proactive Suggestions */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Proactive Care Guidance</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Anticipating pre-trial stress allows you to protect your energy and arrange accommodations in advance:
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                <p className="leading-relaxed">
                  <strong>Schedule a Preparation Call:</strong> Connect with Dr. Sarah Jenkins 48 hours before court testimony.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                <p className="leading-relaxed">
                  <strong>Protect Sleep Windows:</strong> Practice 10-minute bedtime relaxation to prevent rest deficits.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                <p className="leading-relaxed">
                  <strong>Confirm Safe Escort:</strong> Double-check transit details with your DLSA legal advocate.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link
              to="/recommendations"
              className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Recommended Grounding Routines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
