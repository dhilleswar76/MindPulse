import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, RefreshCw, Maximize2, Minimize2, CheckCircle, Heart } from 'lucide-react';
import api from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PROMPTS = [
  "How was your day? Write down any moments that stood out.",
  "What's been on your mind lately that you haven't had space to speak about?",
  "What felt difficult today, and how did your body experience that strain?",
  "What is one small thing that went well or gave you a moment of comfort?",
  "What step feels manageable for you right now regarding your wellbeing or upcoming plans?",
];

const MOOD_OPTIONS = [
  { id: 'grounded', label: 'Grounded', icon: '🌿' },
  { id: 'anxious', label: 'Anxious', icon: '⚡' },
  { id: 'hopeful', label: 'Hopeful', icon: '🌅' },
  { id: 'tired', label: 'Exhausted', icon: '🌙' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: '🌊' },
];

export const JournalEditorModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodContext, setMoodContext] = useState<string>('grounded');
  const [promptIdx, setPromptIdx] = useState(0);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Auto-draft indicator simulation
  useEffect(() => {
    if (!content) return;
    const timer = setTimeout(() => {
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, title]);

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleApplyPrompt = () => {
    const p = PROMPTS[promptIdx];
    if (!content.includes(p)) {
      setContent((prev) => (prev ? `${prev}\n\n[Prompt: ${p}]\n` : `[Prompt: ${p}]\n`));
    }
  };

  const handleNextPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write a few thoughts before saving.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/journal', {
        title: title || 'Personal Reflection',
        content,
        moodContext,
        isPrivate: true,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save reflection entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`glass-card w-full border border-slate-700/80 shadow-2xl transition-all duration-300 flex flex-col ${
          isDistractionFree ? 'max-w-4xl h-[92vh] p-8' : 'max-w-2xl p-6 rounded-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              Private Reflection Space
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Express freely without judgment. Your reflections are processed with non-diagnostic AI signals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDistractionFree(!isDistractionFree)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl text-xs flex items-center gap-1 transition-colors"
              title={isDistractionFree ? 'Standard View' : 'Distraction-Free Focus Mode'}
            >
              {isDistractionFree ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDistractionFree ? 'Compact' : 'Focus Mode'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4 pt-4">
          {/* Gentle Prompt Carousel Box */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 flex-1">
              <Heart className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Gentle Writing Prompt</span>
                <p className="text-slate-200 italic">{PROMPTS[promptIdx]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleApplyPrompt}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg font-medium text-[11px] transition-colors"
              >
                Use Prompt
              </button>
              <button
                type="button"
                onClick={handleNextPrompt}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                title="Next prompt"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mood / Context Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              How is your emotional climate right now?
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMoodContext(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    moodContext === m.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm'
                      : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Title input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title or main theme (Optional)..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Writing Textarea */}
          <div className="flex-1 flex flex-col min-h-[180px]">
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely. Describe what you experienced today, tension factors, moments of calm, or thoughts about your journey..."
              className="w-full flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed resize-none"
            />
          </div>

          {/* Footer Controls & Indicators */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Encrypted & Private</span>
              </div>

              <span>
                {wordCount} {wordCount === 1 ? 'word' : 'words'} • {charCount} chars
              </span>

              {lastSaved && (
                <span className="flex items-center gap-1 text-emerald-400/90">
                  <CheckCircle className="w-3 h-3" />
                  Saved locally {lastSaved}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Analyzing & Saving...' : 'Save & Analyze Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
