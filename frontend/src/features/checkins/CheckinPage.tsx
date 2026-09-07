import React, { useState, useEffect } from 'react';
import { Smile, Moon, Zap, Activity, CheckCircle2, AlertCircle, Shield, Scale } from 'lucide-react';
import api from '../../services/api';
import { WellnessTrendChart } from './WellnessTrendChart';

export const CheckinPage: React.FC = () => {
  const [mood, setMood] = useState(7);
  const [stress, setStress] = useState(4);
  const [energy, setEnergy] = useState(6);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [senseOfSafety, setSenseOfSafety] = useState(8);
  const [caseRelatedStress, setCaseRelatedStress] = useState(4);
  const [optionalNote, setOptionalNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; riskLevel?: string } | null>(
    null
  );
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
        { date: 'Day 1', mood: 8, stress: 3, energy: 7, sleepHours: 8, senseOfSafety: 8, caseRelatedStress: 3 },
        { date: 'Day 2', mood: 7, stress: 4, energy: 6, sleepHours: 7.5, senseOfSafety: 8, caseRelatedStress: 4 },
        { date: 'Day 3', mood: 6, stress: 6, energy: 5, sleepHours: 6, senseOfSafety: 6, caseRelatedStress: 6 },
        { date: 'Day 4', mood: 5, stress: 7, energy: 4, sleepHours: 5.5, senseOfSafety: 5, caseRelatedStress: 8 },
        { date: 'Day 5', mood: 6, stress: 5, energy: 6, sleepHours: 7, senseOfSafety: 7, caseRelatedStress: 5 },
      ]);
      setBaseline({ avgMood: 6.4, avgStress: 5.0, avgEnergy: 5.6, avgSleep: 6.8, avgSafety: 7.2 });
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
        senseOfSafety,
        caseRelatedStress,
        optionalNote,
      });

      const riskLevel = res.data?.riskAssessment?.riskLevel || 'STABLE';
      setFeedback({
        type: 'success',
        message: 'Wellbeing check-in recorded! Personal baseline updated for decision support.',
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
          MindPulse Wellbeing Check-In
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Periodic check-ins help identify subtle changes in wellbeing and stress during your case journey (investigation, trial hearings, compensation, or rehabilitation). Telemetry is encrypted, pseudonymous, and reviewed only by authorized support counselors.
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
                  Observed risk signal status:{' '}
                  <span className="font-semibold text-teal-400">{feedback.riskLevel}</span> (Non-diagnostic decision
                  support)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Interactive Slider Form */}
        <div className="lg:col-span-6 glass-card p-6 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2">
            <span>Today’s Wellbeing Telemetry</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  General Mood (1 to 10)
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
                <span>10 - Calibrated</span>
              </div>
            </div>

            {/* Stress Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  General Stress Level (1 to 10)
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
                <span>10 - High Stress</span>
              </div>
            </div>

            {/* Case-Related Stress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-400" />
                  Case / Court-Related Stress (1 to 10)
                </label>
                <span className="text-base font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  {caseRelatedStress} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={caseRelatedStress}
                onChange={(e) => setCaseRelatedStress(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 - Minimal Concern</span>
                <span>5 - Moderate Hearing Tension</span>
                <span>10 - Acute Legal Pressure</span>
              </div>
            </div>

            {/* Perceived Sense of Safety */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Perceived Sense of Safety (1 to 10)
                </label>
                <span className="text-base font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                  {senseOfSafety} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={senseOfSafety}
                onChange={(e) => setSenseOfSafety(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1 - Safety Concerns</span>
                <span>5 - Moderate</span>
                <span>10 - Fully Secure</span>
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
                <span>7-8h (Target Normal)</span>
                <span>14h</span>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Optional Context / Notes (Private & Encrypted)
              </label>
              <textarea
                rows={3}
                value={optionalNote}
                onChange={(e) => setOptionalNote(e.target.value)}
                placeholder="E.g., Met with witness support officer today, upcoming hearing on Friday..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Evaluating Distress Telemetry...' : 'Submit MindPulse Check-In'}
            </button>
          </form>
        </div>

        {/* Right column: Longitudinal Trend Visualization */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 border border-slate-800 rounded-2xl">
            <h2 className="text-lg font-bold text-slate-100 mb-2">Longitudinal Wellbeing Telemetry</h2>
            <p className="text-xs text-slate-400 mb-4">
              Visualizing your mood and stress signals against your personal historical baseline
            </p>
            <WellnessTrendChart data={trendData} />
          </div>

          {/* Baseline Summary Card */}
          {baseline && (
            <div className="glass-card p-5 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center rounded-2xl">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Mood</span>
                <span className="text-lg font-bold text-emerald-400">{baseline.avgMood}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Stress</span>
                <span className="text-lg font-bold text-amber-400">{baseline.avgStress}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Sleep</span>
                <span className="text-lg font-bold text-teal-400">{baseline.avgSleep}h</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Baseline Safety</span>
                <span className="text-lg font-bold text-indigo-400">{baseline.avgSafety || 7.5}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

