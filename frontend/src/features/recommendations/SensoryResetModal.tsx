import React, { useState, useEffect } from 'react';
import { Eye, Hand, Ear, Sparkles, X, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';

interface SensoryResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepConfig {
  step: number;
  count: number;
  title: string;
  sense: string;
  icon: React.ReactNode;
  hint: string;
  suggestions: string[];
}

const STEPS: StepConfig[] = [
  {
    step: 1,
    count: 5,
    title: 'Name 5 things you can see.',
    sense: 'Sight',
    icon: <Eye className="w-5 h-5 text-teal-400" />,
    hint: 'Look gently around your room or space. Notice colours, shapes, or light.',
    suggestions: ['Window or sunlight', 'Desk or surface', 'Wall clock / picture', 'Door frame', 'My shoes / feet'],
  },
  {
    step: 2,
    count: 4,
    title: 'Name 4 things you can feel.',
    sense: 'Touch',
    icon: <Hand className="w-5 h-5 text-teal-400" />,
    hint: 'Bring your awareness to physical contact points with the world right now.',
    suggestions: ['Feet resting on floor', 'Fabric of clothes', 'Back against the chair', 'Cool air on skin'],
  },
  {
    step: 3,
    count: 3,
    title: 'Name 3 things you can hear.',
    sense: 'Sound',
    icon: <Ear className="w-5 h-5 text-teal-400" />,
    hint: 'Listen beyond immediate thoughts to ambient sounds near and far.',
    suggestions: ['Distant outside traffic', 'Room fan or AC hum', 'Sound of my own breath'],
  },
  {
    step: 4,
    count: 2,
    title: 'Name 2 things you can smell.',
    sense: 'Scent',
    icon: <Sparkles className="w-5 h-5 text-teal-400" />,
    hint: 'Take a gentle breath in through your nose.',
    suggestions: ['Fresh room air', 'Warm tea or coffee aroma'],
  },
  {
    step: 5,
    count: 1,
    title: 'Name 1 thing you can taste.',
    sense: 'Taste',
    icon: <Sparkles className="w-5 h-5 text-teal-400" />,
    hint: 'Notice any lingering flavor, or take a sip of cool water.',
    suggestions: ['Cool fresh water', 'Mint or clean palate'],
  },
];

export const SensoryResetModal: React.FC<SensoryResetModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Store responses for each step locally and transiently
  const [stepValues, setStepValues] = useState<{ [stepIndex: number]: string[] }>({
    0: ['', '', '', '', ''],
    1: ['', '', '', ''],
    2: ['', '', ''],
    3: ['', ''],
    4: [''],
  });
  const [isCompleted, setIsCompleted] = useState(false);

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

  // Reset when re-opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsCompleted(false);
      setStepValues({
        0: ['', '', '', '', ''],
        1: ['', '', '', ''],
        2: ['', '', ''],
        3: ['', ''],
        4: [''],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
  const totalSteps = STEPS.length;

  const handleInputChange = (fieldIndex: number, val: string) => {
    setStepValues((prev) => {
      const stepArr = [...(prev[currentStepIndex] || [])];
      stepArr[fieldIndex] = val;
      return { ...prev, [currentStepIndex]: stepArr };
    });
  };

  const handleQuickAdd = (suggestion: string) => {
    setStepValues((prev) => {
      const stepArr = [...(prev[currentStepIndex] || [])];
      // Find first empty field or append
      const emptyIdx = stepArr.findIndex((item) => !item.trim());
      if (emptyIdx !== -1) {
        stepArr[emptyIdx] = suggestion;
      } else {
        stepArr[stepArr.length - 1] = suggestion;
      }
      return { ...prev, [currentStepIndex]: stepArr };
    });
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setStepValues({
      0: ['', '', '', '', ''],
      1: ['', '', '', ''],
      2: ['', '', ''],
      3: ['', ''],
      4: [''],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensory-modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 text-slate-100 relative max-h-[90vh] flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top bar: Badge, Title & Close */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
                <span>Grounding Practice</span>
                <span>•</span>
                <span>Transient & Private</span>
              </div>
              <h2 id="sensory-modal-title" className="text-xl font-bold text-white tracking-tight">
                5-4-3-2-1 Sensory Reset
              </h2>
              <p className="text-xs text-slate-300">
                Take a few minutes to reconnect with your surroundings.
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

          {/* Progress bar */}
          {!isCompleted && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-teal-400">Step {currentStepIndex + 1} of {totalSteps}</span>
                <span>{currentStepIndex + 1} / {totalSteps}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-400 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        {!isCompleted ? (
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  {currentStep.icon}
                </div>
                <span>{currentStep.title}</span>
              </div>
              <p className="text-xs text-slate-300 pl-9 leading-relaxed">
                {currentStep.hint}
              </p>
            </div>

            {/* Input fields */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-300">
                Your observations (optional to type, or pick from suggestions below):
              </label>
              {Array.from({ length: currentStep.count }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={stepValues[currentStepIndex]?.[idx] || ''}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    placeholder={`e.g. ${currentStep.suggestions[idx] || 'Describe an observation'}`}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Quick-select prompt suggestions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Quick taps:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentStep.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickAdd(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-teal-300 border border-slate-700/50 transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="py-8 px-4 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Well done. Take one slow breath before continuing.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your attention has re-anchored to the safety of the present moment. You are grounded, centered, and supported.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800 text-xs text-slate-400 text-left">
              🔒 <strong>Privacy note:</strong> Your exercise inputs were held locally in memory only and have not been stored on any server.
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {!isCompleted ? (
            <>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  currentStepIndex === 0
                    ? 'border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Reset exercise"
                  aria-label="Reset exercise"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <span>{currentStepIndex === totalSteps - 1 ? 'Complete' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                <span>Try again</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Return to resources</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
