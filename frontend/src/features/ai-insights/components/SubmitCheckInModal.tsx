import React, { useState } from 'react';
import {
  PlusCircle,
  X,
  Smile,
  AlertTriangle,
  Moon,
  Shield,
  Scale,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { CheckInItem } from '../../../services/mlApi';

interface SubmitCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCheckIn: CheckInItem) => void;
  isSubmitting?: boolean;
  currentStage?: string;
}

export const SubmitCheckInModal: React.FC<SubmitCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  currentStage = 'COURT_TRIAL',
}) => {
  const [mood, setMood] = useState<number>(3.0);
  const [stress, setStress] = useState<number>(8.5);
  const [energy, setEnergy] = useState<number>(4.0);
  const [sleepHours, setSleepHours] = useState<number>(4.0);
  const [anxiety, setAnxiety] = useState<number>(8.0);
  const [senseOfSafety, setSenseOfSafety] = useState<number>(3.5);
  const [caseRelatedStress, setCaseRelatedStress] = useState<number>(9.0);
  const [supportAvailability, setSupportAvailability] = useState<number>(4.5);
  const [optionalNote, setOptionalNote] = useState<string>('');

  if (!isOpen) return null;

  // Preset scenarios to make live evaluator testing seamless
  const applyPreset = (type: 'HIGH_DISTRESS' | 'RECOVERY' | 'MILD_ANXIETY') => {
    if (type === 'HIGH_DISTRESS') {
      setMood(2.0);
      setStress(9.5);
      setEnergy(3.0);
      setSleepHours(3.5);
      setAnxiety(9.5);
      setSenseOfSafety(2.5);
      setCaseRelatedStress(10.0);
      setSupportAvailability(3.5);
      setOptionalNote('Severe nervousness before upcoming court trial witness testimony.');
    } else if (type === 'RECOVERY') {
      setMood(7.5);
      setStress(3.0);
      setEnergy(7.0);
      setSleepHours(8.0);
      setAnxiety(2.5);
      setSenseOfSafety(8.5);
      setCaseRelatedStress(3.0);
      setSupportAvailability(8.0);
      setOptionalNote('Attended grounding session with Dr. Sarah Jenkins; sleep stabilized.');
    } else {
      setMood(5.0);
      setStress(6.5);
      setEnergy(5.5);
      setSleepHours(6.0);
      setAnxiety(6.0);
      setSenseOfSafety(6.0);
      setCaseRelatedStress(7.0);
      setSupportAvailability(6.0);
      setOptionalNote('Mild lingering worry about case timeline.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate the check-in metrics (1-10 ranges)
    const validatedMood = Math.min(Math.max(Number(mood), 1), 10);
    const validatedStress = Math.min(Math.max(Number(stress), 1), 10);
    const validatedSleep = Math.min(Math.max(Number(sleepHours), 0), 24);
    const validatedAnxiety = Math.min(Math.max(Number(anxiety), 1), 10);
    const validatedSafety = Math.min(Math.max(Number(senseOfSafety), 1), 10);
    const validatedCaseStress = Math.min(Math.max(Number(caseRelatedStress), 1), 10);
    const validatedSupport = Math.min(Math.max(Number(supportAvailability), 1), 10);

    const newCheckIn: CheckInItem = {
      mood: validatedMood,
      stress: validatedStress,
      energy: Number(energy),
      sleepHours: validatedSleep,
      anxiety: validatedAnxiety,
      senseOfSafety: validatedSafety,
      caseRelatedStress: validatedCaseStress,
      supportAvailability: validatedSupport,
      caseStage: currentStage,
      timestamp: new Date().toISOString(),
      optionalNote: optionalNote.trim() || undefined,
    };

    onSubmit(newCheckIn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record New Check-In</h3>
              <p className="text-xs text-slate-400">
                Immediately updates longitudinal history and re-runs live ML analysis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Testing Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Quick Test Presets (Instant Telemetry Fill):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('HIGH_DISTRESS')}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold text-left transition-colors"
            >
              ⚡ Court Surge (High Stress)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('RECOVERY')}
              className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold text-left transition-colors"
            >
              🌸 Grounded Recovery (Calm)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('MILD_ANXIETY')}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold text-left transition-colors"
            >
              ⛅ Moderate Tension
            </button>
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stress Rating */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stress Level:</span>
                </span>
                <span className="font-bold font-mono text-rose-400">{stress} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={stress}
                onChange={(e) => setStress(parseFloat(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Anxiety Rating */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Anxiety Level:</span>
                </span>
                <span className="font-bold font-mono text-amber-400">{anxiety} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={anxiety}
                onChange={(e) => setAnxiety(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Mood Rating */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-teal-400" />
                  <span>Mood Rating:</span>
                </span>
                <span className="font-bold font-mono text-teal-400">{mood} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={mood}
                onChange={(e) => setMood(parseFloat(e.target.value))}
                className="w-full accent-teal-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Sleep Hours */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sleep Duration:</span>
                </span>
                <span className="font-bold font-mono text-indigo-400">{sleepHours} hrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Sense of Safety */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>Sense of Safety:</span>
                </span>
                <span className="font-bold font-mono text-teal-400">{senseOfSafety} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={senseOfSafety}
                onChange={(e) => setSenseOfSafety(parseFloat(e.target.value))}
                className="w-full accent-teal-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Case-Related Stress */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-400" />
                  <span>Legal / Case Stress:</span>
                </span>
                <span className="font-bold font-mono text-rose-400">{caseRelatedStress} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={caseRelatedStress}
                onChange={(e) => setCaseRelatedStress(parseFloat(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Context Note:
            </label>
            <input
              type="text"
              value={optionalNote}
              onChange={(e) => setOptionalNote(e.target.value)}
              placeholder="e.g. Testified in court today; felt acute somatic trembling..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating AI Analysis...' : 'Submit & Re-Analyze'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
