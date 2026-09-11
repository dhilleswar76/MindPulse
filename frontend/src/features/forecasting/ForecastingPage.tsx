import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  Sparkles,
  HeartHandshake,
  Shield,
  Info,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { CounsellorSuggestionItem } from '../../types';

export const ForecastingPage: React.FC = () => {
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [trajectory, setTrajectory] = useState('escalating');
  const [isLoading, setIsLoading] = useState(true);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<CounsellorSuggestionItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchForecastAndSuggestions = async () => {
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

    try {
      const suggRes: any = await api.get('/victims/me/counsellor-suggestions');
      const data = suggRes.data || suggRes;
      if (Array.isArray(data)) {
        setSuggestions(data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchForecastAndSuggestions();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await api.post('/victims/me/counsellor-suggestions', {
        notes: notes.trim() || 'Victim requested guidance ahead of 7-day forecast.',
      });
      setSuccessMsg('Suggestion request sent to Dr. Sarah Jenkins.');
      setNotes('');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
      }, 1500);
      fetchForecastAndSuggestions();
    } catch (err: any) {
      console.error('Error submitting suggestion request:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to submit suggestion request.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingSuggestion = suggestions.find((s) => s.status === 'PENDING');
  const latestResponded = suggestions.find((s) => s.status === 'RESPONDED');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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

        <div className="flex items-center gap-3">
          {pendingSuggestion ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Suggestion Pending Review</span>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Counsellor Suggestion</span>
            </button>
          )}

          <Link
            to="/victim/counsellor-chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Chat With Counsellor</span>
          </Link>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 block mb-0.5">Non-Diagnostic Proactive Planning</strong>
          This 7-day forecast estimates how cumulative sleep deficits and approaching court dates may influence your tension. It is designed to help you plan rest and schedule support before difficult hearing days.
        </div>
      </div>

      {/* Latest Counsellor Suggestion Banner (if available) */}
      {latestResponded && (
        <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              Recent Personal Advice from {latestResponded.counsellorName}
            </span>
            <Link
              to="/victim/counsellor-chat"
              className="text-xs text-emerald-300 hover:underline flex items-center gap-1 font-medium"
            >
              Discuss in Chat →
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed italic">
            "{latestResponded.suggestionMessage}"
          </p>
        </div>
      )}

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

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/recommendations"
              className="text-xs text-teal-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Grounding Routines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/victim/counsellor-chat"
              className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Open Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Suggestion Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">Get Counsellor Suggestion</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                ×
              </button>
            </div>

            {successMsg ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-100">{successMsg}</h4>
                <p className="text-xs text-slate-400">Your counsellor will review this forecast and respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-emerald-400">Sharing 7-Day Forecast Telemetry:</p>
                  <p className="text-[11px] text-slate-400">
                    Your assigned counsellor (Dr. Sarah Jenkins) will receive your stress curve trajectory and current case stage.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Specific concerns regarding upcoming days (Optional):
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. Need coping strategies for pre-testimony nervousness..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastingPage;

