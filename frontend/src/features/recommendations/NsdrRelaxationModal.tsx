import React, { useState, useEffect, useRef } from 'react';
import { Moon, Play, Pause, RotateCcw, X, CheckCircle2, Volume2, Sparkles } from 'lucide-react';

interface NsdrRelaxationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NsdrRelaxationModal: React.FC<NsdrRelaxationModalProps> = ({ isOpen, onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(600); // 10 minutes default
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const timerRef = useRef<any>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle countdown
  useEffect(() => {
    if (timerState === 'running') {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  // Reset when re-opened
  useEffect(() => {
    if (isOpen) {
      setRemainingSeconds(totalSeconds);
      setTimerState('idle');
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, totalSeconds]);

  if (!isOpen) return null;

  const handleStart = () => {
    setTimerState('running');
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleResume = () => {
    setTimerState('running');
  };

  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRemainingSeconds(totalSeconds);
    setTimerState('idle');
  };

  const setDuration = (secs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    setTimerState('idle');
  };

  // Format mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress percentage (0 to 100)
  const elapsed = totalSeconds - remainingSeconds;
  const progressPercent = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;

  // Calming guidance based on progress
  const getGuidanceMessage = () => {
    if (timerState === 'completed') {
      return 'Rest in this stillness. Take a moment before returning.';
    }
    if (progressPercent < 15) {
      return 'Find a comfortable position. Close your eyes or soften your gaze.';
    }
    if (progressPercent < 35) {
      return 'Let your shoulders soften and gently drop away from your ears.';
    }
    if (progressPercent < 55) {
      return 'Allow your breathing to settle into its own calm, effortless rhythm.';
    }
    if (progressPercent < 75) {
      return 'Release any tension held in your jaw, forehead, and hands.';
    }
    if (progressPercent < 90) {
      return 'Feel the steady, unmoving support beneath your entire body.';
    }
    return 'Rest deeply in this quiet space. There is nothing else you need to do.';
  };

  // SVG Circular progress params
  const strokeWidth = 8;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nsdr-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative max-h-[90vh] flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Moon className="w-3.5 h-3.5" />
              <span>Restorative Sleep & Rest Support</span>
            </div>
            <h2 id="nsdr-modal-title" className="text-xl font-bold text-white tracking-tight">
              Bedtime Non-Sleep Deep Rest
            </h2>
            <p className="text-xs text-slate-300">
              10 minute guided rest to de-escalate bedtime hypervigilance.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duration selector pill (when idle) */}
        {timerState === 'idle' && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Duration:</span>
            <button
              type="button"
              onClick={() => setDuration(600)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                totalSeconds === 600
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              10 minutes (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setDuration(180)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                totalSeconds === 180
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              3 min quick
            </button>
          </div>
        )}

        {/* Circular Visualizer & Timer */}
        <div className="flex flex-col items-center justify-center py-2 space-y-4">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Background track circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="text-indigo-500 transition-all duration-1000 ease-linear"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center p-4">
              {timerState === 'completed' ? (
                <div className="space-y-1">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-in zoom-in duration-300" />
                  <span className="text-xs font-bold text-white block mt-1">Complete</span>
                </div>
              ) : (
                <>
                  <span className="text-xs uppercase tracking-widest text-indigo-300/80 font-medium">
                    {timerState === 'running' ? 'Resting' : timerState === 'paused' ? 'Paused' : 'Ready'}
                  </span>
                  <span className="text-4xl font-extrabold text-white tracking-tight my-1">
                    {timeFormatted}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Remaining
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Calming Guidance Text */}
          <div className="min-h-[50px] flex items-center justify-center px-4 text-center">
            <p className="text-xs sm:text-sm text-indigo-200/90 font-medium leading-relaxed max-w-sm transition-all duration-500">
              "{getGuidanceMessage()}"
            </p>
          </div>
        </div>

        {/* Non-clinical disclaimer note */}
        <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          ℹ️ <strong>Non-clinical notice:</strong> NSDR is a progressive muscle relaxation practice designed to assist restorative downtime. It is not presented as medical treatment or clinical therapy.
        </div>

        {/* Controls Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {timerState !== 'completed' ? (
            <>
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>

              <div className="flex items-center gap-2">
                {timerState === 'idle' && (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start</span>
                  </button>
                )}

                {timerState === 'running' && (
                  <button
                    type="button"
                    onClick={handlePause}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 shadow-sm transition-all"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </button>
                )}

                {timerState === 'paused' && (
                  <button
                    type="button"
                    onClick={handleResume}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Session</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
