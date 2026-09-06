import React, { useState, useEffect } from 'react';
import { Smile, Moon, Zap, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { WellnessTrendChart } from './WellnessTrendChart';

export const CheckinPage: React.FC = () => {
  const [mood, setMood] = useState(7);
  const [stress, setStress] = useState(4);
  const [energy, setEnergy] = useState(6);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [optionalNote, setOptionalNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; riskLevel?: string } | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [baseline, setBaseline] = useState<any>(null);

  const fetchTrends = async () => {
    try {
      const res: any = await api.get('/checkins/trend');
      if (res.data) {
        setTrendData(res.data.trend || []);
        setBaseline(res.data.baseline);
      }
    } catch {
      // Use fallback synthetic data
      setTrendData([
        { date: 'Day 1', mood: 8, stress: 3, energy: 7, sleepHours: 8 },
        { date: 'Day 2', mood: 7, stress: 4, energy: 6, sleepHours: 7.5 },
        { date: 'Day 3', mood: 6, stress: 6, energy: 5, sleepHours: 6 },
        { date: 'Day 4', mood: 5, stress: 7, energy: 4, sleepHours: 5.5 },
        { date: 'Day 5', mood: 6, stress: 5, energy: 6, sleepHours: 7 },
      ]);
      setBaseline({ avgMood: 6.4, avgStress: 5.0, avgEnergy: 5.6, avgSleep: 6.8 });
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res: any = await api.post('/checkins', {
        mood,
        stress,
        energy,
        sleepHours,
        optionalNote,
      });

      const riskLevel = res.data?.riskAssessment?.riskLevel || 'STABLE';
      setFeedback({
        type: 'success',
        message: 'Daily check-in logged! Personal baseline updated.',
        riskLevel,
      });
      setOptionalNote('');
      fetchTrends();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to submit check-in',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Smile className="w-7 h-7 text-teal-400" />
          Daily Mental Wellness Check-In
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Take 60 seconds to log how you are feeling today. All telemetry is encrypted and private.
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <p className="text-sm font-semibold">{feedback.message}</p>
              {feedback.riskLevel && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluated risk signal status:{' '}
                  <span className="font-semibold text-teal-400">{feedback.riskLevel}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Interactive Slider Form */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
            <span>Log Today's Signals</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  Overall Mood (1 to 10)
                </label>
                <span className="text-base font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  {mood} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 - Very Low</span>
                <span>5 - Neutral</span>
                <span>10 - Excellent</span>
              </div>
            </div>

            {/* Stress Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Perceived Stress Level (1 to 10)
                </label>
                <span className="text-base font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {stress} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 - Relaxed</span>
                <span>5 - Manageable</span>
                <span>10 - Overwhelmed</span>
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Energy Level (1 to 10)
                </label>
                <span className="text-base font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                  {energy} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 - Exhausted</span>
                <span>5 - Steady</span>
                <span>10 - High Energy</span>
              </div>
            </div>

            {/* Sleep Hours Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-teal-400" />
                  Hours of Sleep Last Night
                </label>
                <span className="text-base font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/20">
                  {sleepHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0h (Severe Deficit)</span>
                <span>7-8h (Target Baseline)</span>
                <span>14h</span>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Optional Context / Notes (Private)
              </label>
              <textarea
                rows={3}
                value={optionalNote}
                onChange={(e) => setOptionalNote(e.target.value)}
                placeholder="E.g. Final project due tomorrow, slept late studying..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording & Evaluating ML Model...' : 'Submit Today’s Check-In'}
            </button>
          </form>
        </div>

        {/* Right column: Longitudinal Trend Visualization */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 border border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-2">14-Day Wellness Telemetry</h2>
            <p className="text-xs text-slate-400 mb-4">
              Visualizing your mood vs stress trajectory against recommended baselines
            </p>
            <WellnessTrendChart data={trendData} />
          </div>

          {/* Baseline Summary Card */}
          {baseline && (
            <div className="glass-card p-5 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Avg Mood</span>
                <span className="text-lg font-bold text-emerald-400">{baseline.avgMood}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Avg Stress</span>
                <span className="text-lg font-bold text-amber-400">{baseline.avgStress}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Avg Energy</span>
                <span className="text-lg font-bold text-indigo-400">{baseline.avgEnergy}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Avg Sleep</span>
                <span className="text-lg font-bold text-teal-400">{baseline.avgSleep}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
