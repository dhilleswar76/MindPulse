import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import {
  Smile,
  Moon,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Shield,
  Scale,
  HeartHandshake,
  Lock,
  HelpCircle,
  X,
  FileCheck,
  ChevronRight,
  Sparkles,
  Mic,
  PenTool,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { WellnessTrendChart } from './WellnessTrendChart';
import { VoiceStressModal } from '../voice/VoiceStressModal';
import { useAuth } from '../../hooks/useAuth';

// Zod schema for type-safe validation following project standards
const checkinFormSchema = z.object({
  mood: z.number().min(1).max(10),
  stress: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  sleepHours: z.number().min(0).max(14),
  senseOfSafety: z.number().min(1).max(10),
  caseRelatedStress: z.number().min(1).max(10),
  supportAvailability: z.number().min(1).max(10),
  optionalNote: z.string().max(1000).optional(),
});

type CheckinFormData = z.infer<typeof checkinFormSchema>;

export const CheckinPage: React.FC = () => {
  const { user } = useAuth();
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    isPatternElevated?: boolean;
  } | null>(null);

  const [trendData, setTrendData] = useState<any[]>([]);
  const [baseline, setBaseline] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CheckinFormData>({
    defaultValues: {
      mood: 7,
      stress: 4,
      energy: 6,
      sleepHours: 7.5,
      senseOfSafety: 8,
      caseRelatedStress: 4,
      supportAvailability: 7,
      optionalNote: '',
    },
  });

  // Watch current slider values for interactive labels
  const currentValues = watch();

  const fetchTrends = async () => {
    try {
      const res: any = await api.get('/checkins/trend');
      if (res.data) {
        setTrendData(res.data.trend || []);
        setBaseline(res.data.baseline);
      }
    } catch {
      // Synthetic fallback for offline/demo operation
      setTrendData([
        { date: 'Day 1', mood: 8, stress: 3, energy: 7, sleepHours: 8, senseOfSafety: 8, caseRelatedStress: 3, supportAvailability: 8 },
        { date: 'Day 2', mood: 7, stress: 4, energy: 6, sleepHours: 7.5, senseOfSafety: 8, caseRelatedStress: 4, supportAvailability: 8 },
        { date: 'Day 3', mood: 6, stress: 6, energy: 5, sleepHours: 6, senseOfSafety: 6, caseRelatedStress: 6, supportAvailability: 7 },
        { date: 'Day 4', mood: 5, stress: 7, energy: 4, sleepHours: 5.5, senseOfSafety: 5, caseRelatedStress: 8, supportAvailability: 7 },
        { date: 'Day 5', mood: 6, stress: 5, energy: 6, sleepHours: 7, senseOfSafety: 7, caseRelatedStress: 5, supportAvailability: 8 },
      ]);
      setBaseline({ avgMood: 6.8, avgStress: 5.0, avgEnergy: 5.8, avgSleep: 7.0, avgSafety: 7.4, avgCaseStress: 4.8 });
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const onSubmit = async (data: CheckinFormData) => {
    // Validate with Zod
    const validationResult = checkinFormSchema.safeParse(data);
    if (!validationResult.success) {
      setFeedback({
        type: 'error',
        title: 'Check-in incomplete',
        message: 'Please verify that all ratings are within the valid 1 to 10 scale.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res: any = await api.post('/checkins', data);
      const riskLevel = res.data?.riskAssessment?.riskLevel || 'STABLE';
      const isElevated = riskLevel === 'ELEVATED' || riskLevel === 'REQUIRES_REVIEW';

      setFeedback({
        type: 'success',
        title: 'Check-in recorded securely',
        message: isElevated
          ? 'Your check-in was saved. Your recent pattern shows higher case-related stress than usual. Would you like to review grounding tools or request a touchpoint with your counselor?'
          : 'Your check-in was recorded. Your personal baseline has been updated to support your ongoing wellbeing monitoring.',
        isPatternElevated: isElevated,
      });

      reset({
        ...data,
        optionalNote: '',
      });
      fetchTrends();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        title: 'Submission issue',
        message: err.message || 'Unable to record check-in at this moment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Consent & Non-Diagnostic Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Voluntary • Encrypted Telemetry • Non-Diagnostic Decision Support</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Smile className="w-7 h-7 text-teal-400" />
            Periodic Wellbeing Check-In
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Periodic check-ins help identify subtle changes in wellbeing and stress during your case journey (investigation, trial hearings, compensation, or rehabilitation). Telemetry is encrypted, pseudonymous, and reviewed only by authorized support counselors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConsentModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shrink-0"
        >
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <span>Privacy & Consent Details</span>
        </button>
      </div>

      {/* Check-In Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 text-xs">
        <button
          type="button"
          className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30 flex items-center justify-center gap-2"
        >
          <Smile className="w-4 h-4 text-teal-400" />
          <span>1. Wellbeing Sliders (Active)</span>
        </button>
        <Link
          to="/journal"
          className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <PenTool className="w-4 h-4 text-indigo-400" />
          <span>2. Reflection Journal</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Mic className="w-4 h-4 text-teal-400" />
          <span>3. 5s Voice Screener</span>
        </button>
      </div>

      {/* Feedback Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            feedback.type === 'success'
              ? feedback.isPatternElevated
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  feedback.isPatternElevated ? 'text-amber-400' : 'text-emerald-400'
                }`}
              />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div>
              <p className="text-sm font-bold">{feedback.title}</p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{feedback.message}</p>
            </div>
          </div>

          {feedback.isPatternElevated && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/support"
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg text-xs border border-amber-500/40 transition-colors"
              >
                Counselor Touchpoint
              </Link>
              <Link
                to="/recommendations"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs border border-slate-700 transition-colors"
              >
                Grounding Tools
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form with React Hook Form */}
        <div className="lg:col-span-6 glass-card p-6 md:p-7 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Today’s Wellbeing Telemetry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Takes ~2 minutes. Slide each scale to reflect how you feel today.
              </p>
            </div>
            <span className="text-[11px] text-teal-400 font-semibold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Active Stage: Court / Trial
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. General Mood */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  <span>General Mood</span>
                </label>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  {currentValues.mood} / 10
                </span>
              </div>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 - Very Low / Exhausted</span>
                <span>5 - Balanced</span>
                <span>10 - Calibrated & Positive</span>
              </div>
            </div>

            {/* 2. General Stress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>General Stress Level</span>
                </label>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {currentValues.stress} / 10
                </span>
              </div>
              <Controller
                name="stress"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 - Relaxed</span>
                <span>5 - Manageable</span>
                <span>10 - High Stress</span>
              </div>
            </div>

            {/* 3. Case / Hearing-Related Tension */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-400" />
                  <span>Case / Hearing-Related Tension</span>
                </label>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                  {currentValues.caseRelatedStress} / 10
                </span>
              </div>
              <Controller
                name="caseRelatedStress"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 - Minimal Concern</span>
                <span>5 - Moderate Hearing Tension</span>
                <span>10 - High Legal / Hearing Pressure</span>
              </div>
            </div>

            {/* 4. Perceived Sense of Safety */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Perceived Sense of Safety</span>
                </label>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                  {currentValues.senseOfSafety} / 10
                </span>
              </div>
              <Controller
                name="senseOfSafety"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 - Safety Concerns / Uneasy</span>
                <span>5 - Moderate</span>
                <span>10 - Fully Secure</span>
              </div>
            </div>

            {/* 5. Sleep Hours */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-teal-400" />
                  <span>Sleep Last Night</span>
                </label>
                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-500/20">
                  {currentValues.sleepHours} hrs
                </span>
              </div>
              <Controller
                name="sleepHours"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>0h (Severe Deficit)</span>
                <span>7-8h (Target Normal)</span>
                <span>14h</span>
              </div>
            </div>

            {/* 6. Energy / Stamina */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>Energy & Stamina</span>
                </label>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                  {currentValues.energy} / 10
                </span>
              </div>
              <Controller
                name="energy"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 - Depleted</span>
                <span>5 - Moderate</span>
                <span>10 - High Energy</span>
              </div>
            </div>

            {/* 7. Support Availability */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  <span>Perceived Support Availability</span>
                </label>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  {currentValues.supportAvailability} / 10
                </span>
              </div>
              <Controller
                name="supportAvailability"
                control={control}
                render={({ field }) => (
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                )}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                <span>1 - Feeling Isolated</span>
                <span>5 - Some Support Available</span>
                <span>10 - Readily Supported</span>
              </div>
            </div>

            {/* 8. Optional Personal Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Optional Context Note (Private & Encrypted)
              </label>
              <Controller
                name="optionalNote"
                control={control}
                render={({ field }) => (
                  <textarea
                    rows={3}
                    {...field}
                    placeholder="E.g., Upcoming court hearing this Friday; met with witness support officer today..."
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                )}
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Shared only with your assigned counselor (Dr. Sarah Jenkins).
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Recording Telemetry...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Today’s Check-In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Longitudinal Trends & Personal Baseline Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card p-6 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Your Longitudinal Trend</span>
              </h2>
              <Link to="/wellness" className="text-xs text-teal-400 hover:underline font-semibold">
                Baseline Details →
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              MindPulse compares your recent telemetry against your own 14-day statistical baseline rather than arbitrary population standards.
            </p>
            <WellnessTrendChart data={trendData} baseline={baseline} />
          </div>

          {/* Personal Baseline Stats */}
          {baseline && (
            <div className="glass-card p-5 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Your Personal 14-Day Baseline (Normal Pattern)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Normal Mood</span>
                  <span className="text-lg font-bold text-emerald-400">{baseline.avgMood}</span>
                  <span className="text-[10px] text-slate-500 block">/ 10</span>
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Normal Stress</span>
                  <span className="text-lg font-bold text-amber-400">{baseline.avgStress}</span>
                  <span className="text-[10px] text-slate-500 block">/ 10</span>
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Normal Sleep</span>
                  <span className="text-lg font-bold text-teal-400">{baseline.avgSleep}h</span>
                  <span className="text-[10px] text-slate-500 block">per night</span>
                </div>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Normal Safety</span>
                  <span className="text-lg font-bold text-cyan-400">{baseline.avgSafety || 7.5}</span>
                  <span className="text-[10px] text-slate-500 block">/ 10</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consent & Data Protection Modal */}
      {isConsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 border border-slate-700 bg-slate-900/95 rounded-2xl shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-slate-100">Privacy, Consent & Data Choices</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConsentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-300">
                <strong className="block mb-1 font-semibold">Important Non-Diagnostic Notice:</strong>
                MindPulse is strictly an AI-assisted decision support system designed to help designated support counselors prioritize assistance during legal milestones. It does not provide clinical diagnosis or psychiatric treatments.
              </div>

              <div>
                <strong className="text-slate-100 font-semibold block mb-1">1. What information is collected?</strong>
                <p>
                  Voluntary subjective ratings for mood, stress, energy, sleep hours, perceived sense of safety, case-related tension, and optional context notes.
                </p>
              </div>

              <div>
                <strong className="text-slate-100 font-semibold block mb-1">2. Why is this collected?</strong>
                <p>
                  To calculate your personal historical baseline. Subtle changes (such as sudden sleep drops or elevated tension before court hearings) help your counselor initiate proactive support rather than waiting for an acute crisis.
                </p>
              </div>

              <div>
                <strong className="text-slate-100 font-semibold block mb-1">3. Is participation voluntary?</strong>
                <p>
                  Yes. You may skip any check-in question, pause daily check-ins at any time, or request your historical logs to be reset without impacting your legal aid or welfare entitlements.
                </p>
              </div>

              <div>
                <strong className="text-slate-100 font-semibold block mb-1">4. Who has access to my data?</strong>
                <p>
                  Your information is pseudonymous (indexed by Case ID MP-1042) and encrypted. It is only accessible to you and your assigned support counselor (Dr. Sarah Jenkins). It is never shared with third parties or employers.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Consent Status: Active (v1.0)</span>
              <button
                type="button"
                onClick={() => setIsConsentModalOpen(false)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Voice Stress Screener Modal */}
      <VoiceStressModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        caseId={user?.caseId || 'MP-1042'}
        caseStage={user?.caseStage || 'COURT_TRIAL'}
      />
    </div>
  );
};

