import React, { useState } from 'react';
import { X, Sparkles, Shield } from 'lucide-react';
import api from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JournalEditorModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/journal', {
        title: title || 'Daily Reflection',
        content,
        isPrivate: true,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save reflection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 border border-slate-700 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            New Reflection Entry
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Reflections after hearing preparation / daily feelings"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">What's on your mind today?</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Express what you're experiencing, stress factors, or moments of clarity..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Encrypted & private to your personal account</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Analyzing & Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
