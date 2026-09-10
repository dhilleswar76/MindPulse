import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Sparkles, Trash2, Tag, Shield } from 'lucide-react';
import api from '../../services/api';
import { JournalEntry } from '../../types';
import { JournalEditorModal } from './JournalEditorModal';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/journal');
      setEntries(res.data?.entries || []);
    } catch {
      setEntries([
        {
          _id: 'sample_1',
          title: 'Preparing for Pre-Trial Testimony & Nighttime Anxiety',
          content: 'Having trouble sleeping ahead of the upcoming court date. Feeling a lot of tension about facing questions, but speaking with the support advocate helped me organize my thoughts.',
          sentiment: 'negative',
          stressSignal: 0.72,
          emotionSignals: ['hearing_anxiety', 'sleep_disruption', 'hypervigilance'],
          isPrivate: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'sample_2',
          title: 'Met with Legal Aid Counsel & Safe Transport Confirmed',
          content: 'The district legal service authority advocate confirmed protected escort for the hearing session. Feeling much more secure and relieved after today.',
          sentiment: 'positive',
          stressSignal: 0.28,
          emotionSignals: ['safety_reassurance', 'legal_clarity', 'grounded'],
          isPrivate: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/journal/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
    } catch {
      setEntries(entries.filter((e) => e._id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-teal-400" />
            Journal & Reflection Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Expressive writing with privacy-first linguistic signal analysis.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Reflection Entry
        </button>
      </div>

      {/* NLP Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-200 block mb-0.5">Prototype NLP Signal Analysis</span>
          Entries are analyzed for emotional valence and stress cues to enrich your personal baseline. These tags are automated linguistic proxies and not clinical psychological evaluations.
        </div>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading reflection entries...</div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-medium text-slate-300">No journal entries yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Writing down thoughts helps organize stress and improves sleep quality.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 rounded-xl text-xs font-semibold"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <div key={entry._id} className="glass-card p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-slate-100">{entry.title}</h3>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
                  {entry.content}
                </p>
              </div>

              {/* NLP Signals Footer */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Sentiment tag */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                      entry.sentiment === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : entry.sentiment === 'negative'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-700/50 text-slate-300 border border-slate-600/40'
                    }`}
                  >
                    {entry.sentiment} Sentiment
                  </span>

                  {/* Stress signal indicator */}
                  <span className="text-[11px] text-slate-400">
                    Stress Signal: <strong className="text-slate-200">{Math.round(entry.stressSignal * 100)}%</strong>
                  </span>
                </div>

                {/* Emotion Tags */}
                {entry.emotionSignals && entry.emotionSignals.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {entry.emotionSignals.map((tag, idx) => (
                      <span key={idx} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 pt-1">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <JournalEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchEntries();
          }}
        />
      )}
    </div>
  );
};
