import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Mic,
  PenTool,
  Wind,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { WellnessTrendChart } from './WellnessTrendChart';
import { VoiceStressModal } from '../voice/VoiceStressModal';
import { PrivacyConsentModal } from '../auth/PrivacyConsentModal';
import { useAuth } from '../../hooks/useAuth';
import { analyzeCase, UnifiedAnalysisResponse, CheckInItem } from '../../services/mlApi';
import { getStoredCheckIns, storeCheckIns } from '../../services/checkinHistory';
import { RiskCard } from '../ai-insights/components/RiskCard';
import { AnomalyCard } from '../ai-insights/components/AnomalyCard';

export const CheckinPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Progressive Flow Steps: 1 -> 2 -> 3 -> 4 -> 5 (Confirmation)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [viewHistoryMode, setViewHistoryMode] = useState(false);

  // Form State
  const [selectedFeeling, setSelectedFeeling] = useState<string>('Managing');
  const [mood, setMood] = useState<number>(6);
  const [stress, setStress] = useState<number>(5);
  const [energy, setEnergy] = useState<number>(6);
  const [affectingFactors, setAffectingFactors] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState<number>(7.0);
  const [senseOfSafety, setSenseOfSafety] = useState<number>(7);
  const [caseRelatedStress, setCaseRelatedStress] = useState<number>(5);
  const [supportAvailability, setSupportAvailability] = useState<number>(7);
  const [optionalNote, setOptionalNote] = useState<string>('');

  // Historical Telemetry
  const [trendData, setTrendData] = useState<any[]>([]);
  const [baseline, setBaseline] = useState<any>(null);

  const feelingsList = [
    {
      id: 'Peaceful',
      emoji: '🌸',
      label: 'Peaceful / Grounded',
      desc: 'Feeling settled, rested, or calm',
      moodVal: 8,
      stressVal: 2,
      energyVal: 7,
    },
    {
      id: 'Managing',
      emoji: '🌿',
      label: 'Managing Okay',
      desc: 'Getting through the day steadily',
      moodVal: 6,
      stressVal: 4,
      energyVal: 6,
    },
    {
      id: 'Uneasy',
      emoji: '⛅',
      label: 'A Bit Uneasy / Restless',
      desc: 'Mild tension or lingering worry',
      moodVal: 5,
      stressVal: 6,
      energyVal: 5,
    },
    {
      id: 'Stressed',
      emoji: '🌧️',
      label: 'Stressed / Anxious',
      desc: 'Heavy case tension or poor sleep',
      moodVal: 4,
      stressVal: 7.5,
      energyVal: 4,
    },
    {
      id: 'Overwhelmed',
      emoji: '⚡',
      label: 'Overwhelmed',
      desc: 'Feeling stretched to the limit',
      moodVal: 3,
      stressVal: 9,
      energyVal: 3,
    },
  ];

  const factorsList = [
    { id: 'court_hearing', label: '⚖️ Upcoming Hearing / Testimony' },
    { id: 'sleep_rest', label: '🌙 Sleep Quality / Bedtime Worry' },
    { id: 'safety_transit', label: '🛡️ Safety & Travel Security' },
    { id: 'counselor_contact', label: '🤝 Contact with Legal Aid / Counselor' },
    { id: 'waiting_news', label: '⏳ Waiting for News or Relief Grants' },
    { id: 'family_support', label: '🏡 Family or Community Well-being' },
  ];

  const fetchTrends = async () => {
    try {
      const res: any = await api.get('/checkins/trend');
      if (res.data) {
        setTrendData(res.data.trend || []);
        setBaseline(res.data.baseline);
      }
    } catch {
      setTrendData([
        { date: 'Mon', mood: 8, stress: 3, energy: 7, sleepHours: 8, senseOfSafety: 8, caseRelatedStress: 3 },
        { date: 'Tue', mood: 7, stress: 4, energy: 6, sleepHours: 7.5, senseOfSafety: 8, caseRelatedStress: 4 },
        { date: 'Wed', mood: 6, stress: 6, energy: 5, sleepHours: 6, senseOfSafety: 6, caseRelatedStress: 6 },
        { date: 'Thu', mood: 5, stress: 7, energy: 4, sleepHours: 5.5, senseOfSafety: 5, caseRelatedStress: 8 },
        { date: 'Fri', mood: 6, stress: 5, energy: 6, sleepHours: 7, senseOfSafety: 7, caseRelatedStress: 5 },
      ]);
      setBaseline({ avgMood: 6.8, avgStress: 5.0, avgEnergy: 5.8, avgSleep: 7.0, avgSafety: 7.4, avgCaseStress: 4.8 });
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleFeelingSelect = (item: typeof feelingsList[0]) => {
    setSelectedFeeling(item.id);
    setMood(item.moodVal);
    setStress(item.stressVal);
    setEnergy(item.energyVal);
  };

  // Dedicated AI response state
  const [aiAnalysis, setAiAnalysis] = useState<UnifiedAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleFactor = (factorId: string) => {
    if (affectingFactors.includes(factorId)) {
      setAffectingFactors(affectingFactors.filter((f) => f !== factorId));
    } else {
      setAffectingFactors([...affectingFactors, factorId]);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setIsAnalyzing(true);
    setAiAnalysis(null);

    const newCheckIn: CheckInItem = {
      mood,
      stress,
      energy,
      sleepHours,
      senseOfSafety,
      caseRelatedStress,
      supportAvailability,
      optionalNote: affectingFactors.length > 0
        ? `Factors: ${affectingFactors.join(', ')}. ${optionalNote}`.trim()
        : optionalNote,
      caseStage: user?.caseStage || 'COURT_TRIAL',
      timestamp: new Date().toISOString(),
    };

    console.log("NEW CHECK-IN:", newCheckIn);

    // 1. Get existing history and build updated history synchronously
    const storedHistory = getStoredCheckIns(user?.id || 'user_alex_101');
    const updatedCheckIns = [...storedHistory, newCheckIn];
    console.log("UPDATED HISTORY:", updatedCheckIns);

    // 2. Persist updated check-ins and broadcast update event
    storeCheckIns(updatedCheckIns, user?.id || 'user_alex_101');

    try {
      await api.post('/checkins', newCheckIn);
    } catch {
      // Offline fallback
    }

    setSubmissionSuccess(true);
    setCurrentStep(5);
    setIsSubmitting(false);

    // 3. Build /analyze request using the UPDATED history
    const mlPayload = {
      userId: user?.id || 'user_alex_101',
      caseId: user?.caseId || 'MP-1042',
      caseStage: user?.caseStage || 'COURT_TRIAL',
      recentCheckIns: updatedCheckIns,
      historicalBaseline: {
        mood: 7.0,
        stress: 3.5,
        sleepHours: 7.5,
        anxiety: 3.0,
        senseOfSafety: 8.0,
      },
      journalStressSignal: 0.85,
      voiceStressIndex: 0.80,
      forecastDays: 7,
    };

    console.log("ANALYZE REQUEST:", mlPayload);

    try {
      const mlResponse = await analyzeCase(mlPayload);
      console.log("NEW ML RESPONSE:", mlResponse);
      setAiAnalysis(mlResponse);
    } catch (e) {
      console.warn("ML Analysis request error:", e);
    } finally {
      setIsAnalyzing(false);
      fetchTrends();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Voluntary • Encrypted • Non-Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Smile className="w-7 h-7 text-teal-400" />
            <span>Daily Wellbeing Check-In</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            A quick, 60-second reflection to help you check in with yourself and update your personal baseline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setViewHistoryMode(!viewHistoryMode)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-teal-400" />
            <span>{viewHistoryMode ? 'Back to Check-in' : 'View Past Trends'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsConsentModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Privacy and Consent Settings"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alternate View: Historical Trends */}
      {viewHistoryMode ? (
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              <span>Your Longitudinal Wellbeing History</span>
            </h2>
            <span className="text-xs text-slate-400">14-Day Baseline Reference</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every daily check-in enriches your personal rolling statistical normal. When stress rises or sleep drops around hearing dates, this history helps your counselor offer timely support.
          </p>
          <WellnessTrendChart data={trendData} baseline={baseline} />
        </div>
      ) : (
        /* Progressive 5-Screen Flow Card */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-sm relative overflow-hidden">
          {/* Step Progress Header (Steps 1 to 4) */}
          {currentStep < 5 && (
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-teal-400 uppercase tracking-wider">
                  Step {currentStep} of 4
                </span>
                <span className="text-slate-400">Takes less than 1 minute</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 1: HOW ARE YOU FEELING RIGHT NOW?                                 */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white">How are you feeling right now?</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select the option that best reflects your state today, or adjust the slider below.
                </p>
              </div>

              {/* Large Accessible Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {feelingsList.map((item) => {
                  const isSelected = selectedFeeling === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleFeelingSelect(item)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-500/60 shadow-sm text-white'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.emoji}</div>
                      <div>
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mood Scale Fine-Tuning */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">Fine-tune your overall feeling:</span>
                  <span className="font-bold text-teal-400 text-sm">{mood} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 px-1">
                  <span>Very Difficult</span>
                  <span>Steady</span>
                  <span>Grounded & Good</span>
                </div>
              </div>

              {/* Navigation CTA */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-slate-400">Everything you share is confidential</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: WHAT HAS BEEN AFFECTING YOU MOST?                              */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white">What has been affecting you most?</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Select any factors on your mind today. This is completely optional.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {factorsList.map((factor) => {
                  const isChecked = affectingFactors.includes(factor.id);
                  return (
                    <button
                      key={factor.id}
                      type="button"
                      onClick={() => toggleFactor(factor.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-indigo-500/15 border-indigo-500/60 text-white font-semibold'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{factor.label}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isChecked
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                <span>
                  Prefer not to specify? That is completely okay. You can skip this step at any time.
                </span>
              </div>

              {/* Navigation CTAs */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAffectingFactors([]);
                      setCurrentStep(3);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Prefer not to answer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: REST & CASE TENSION                                            */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white">How has your rest & safety felt?</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Tracking rest and case tension helps calibrate supportive accommodations.
                </p>
              </div>

              <div className="space-y-5">
                {/* Sleep Hours Slider */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Hours of Sleep Last Night:</span>
                    </span>
                    <span className="font-bold text-teal-400 text-sm">{sleepHours} hours</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Under 4h</span>
                    <span>7–8h Rested</span>
                    <span>10h+</span>
                  </div>
                </div>

                {/* Case Tension Slider */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-rose-400" />
                      <span>Case-Related Worry or Tension:</span>
                    </span>
                    <span className="font-bold text-rose-400 text-sm">{caseRelatedStress} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={caseRelatedStress}
                    onChange={(e) => setCaseRelatedStress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Low / Manageable</span>
                    <span>Moderate</span>
                    <span>Acute Worry</span>
                  </div>
                </div>

                {/* Perceived Sense of Safety Slider */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-teal-400" />
                      <span>Current Sense of Safety & Security:</span>
                    </span>
                    <span className="font-bold text-teal-400 text-sm">{senseOfSafety} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={senseOfSafety}
                    onChange={(e) => setSenseOfSafety(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Concerned</span>
                    <span>Protected</span>
                    <span>Completely Safe</span>
                  </div>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Skip this section
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 4: OPTIONAL NOTE                                                   */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-white">Would you like to write a brief thought?</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Completely optional. You can share a note with your counselor or leave this blank.
                </p>
              </div>

              <textarea
                rows={4}
                value={optionalNote}
                onChange={(e) => setOptionalNote(e.target.value)}
                placeholder="E.g. Feeling nervous about the upcoming deposition on Friday, but had a restful morning..."
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Encrypted & visible only to your assigned support counselor.</span>
              </div>

              {/* Final Submit Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOptionalNote('');
                      handleFinalSubmit();
                    }}
                    disabled={isSubmitting}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Skip & Save Check-In
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Saving Check-In...</span>
                    ) : (
                      <>
                        <span>Complete Check-In</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 5: CONFIRMATION & GROUNDING REASSURANCE                             */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-teal-500/15 border border-teal-500/30 text-teal-400 rounded-3xl mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Thank you for checking in.
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your entry has been recorded securely. Your personal 14-day baseline has been updated to help your support team notice any changes.
                </p>
              </div>

              {/* What Happens Next Box */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 text-left text-xs max-w-xl mx-auto space-y-2.5">
                <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
                  What happens next?
                </span>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>
                      <strong>Confidential Baseline Updated:</strong> Helps track whether your rest and stress improve or require extra care.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>
                      <strong>Counselor Touchpoint:</strong> Dr. Sarah Jenkins is informed of your active stage status and can coordinate pre-hearing accommodations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-400">•</span>
                    <span>
                      <strong>Zero Clinical Diagnosis:</strong> MindPulse never labels you or diagnoses mental illness.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Dynamic Live AI Insights Update */}
              {isAnalyzing ? (
                <div className="p-5 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-center space-y-2 animate-pulse max-w-xl mx-auto">
                  <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mx-auto" />
                  <span className="text-xs font-semibold text-teal-300 block">
                    Updating AI analysis with your latest check-in...
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Calling ML engine at http://localhost:8000/analyze
                  </span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4 pt-4 text-left max-w-xl mx-auto border-t border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Updated AI Telemetry Signals</span>
                    </span>
                    <Link
                      to="/risk"
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1"
                    >
                      <span>View Full AI Insights</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RiskCard risk={aiAnalysis.risk} />
                    <AnomalyCard
                      anomaly={aiAnalysis.anomaly}
                      observationsUsed={aiAnalysis.data_quality?.observations_used}
                    />
                  </div>
                </div>
              ) : null}

              {/* Quick Grounding Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/recommendations"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-2xl transition-all shadow-sm"
                >
                  <Wind className="w-4 h-4" />
                  <span>Try 2-Minute Breathing Exercise</span>
                </Link>
                <Link
                  to="/support"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-2xl border border-slate-700 transition-colors"
                >
                  <span>Chat With Support Companion</span>
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-4 py-3 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Stress Screener Modal Prototype */}
      <VoiceStressModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        caseId={user?.caseId || 'MP-1042'}
        caseStage={user?.caseStage || 'COURT_TRIAL'}
      />

      {/* Privacy Consent Modal */}
      <PrivacyConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
      />
    </div>
  );
};
