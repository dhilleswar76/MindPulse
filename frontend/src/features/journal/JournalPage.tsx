import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  Tag,
  Shield,
  Mic,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Filter,
  LayoutGrid,
  List,
  Info,
  Heart,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { JournalEntry } from '../../types';
import { JournalEditorModal } from './JournalEditorModal';
import { VoiceStressModal } from '../voice/VoiceStressModal';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/journal');
      setEntries(res.data?.entries || []);
    } catch {
      // Deterministic rich sample entries for demo / offline
      setEntries([
        {
          _id: 'sample_1',
          title: 'Preparing for Pre-Trial Testimony & Nighttime Anxiety',
          content:
            'Having trouble sleeping ahead of the upcoming court date. Feeling a lot of tension about facing cross-examination questions, but speaking with the DLSA advocate helped me organize my thoughts and confirm my protected transport escort.',
          sentiment: 'negative',
          stressSignal: 0.72,
          emotionSignals: ['hearing_anxiety', 'sleep_disruption', 'case_tension', 'support_seeking'],
          signals: {
            stress: 0.75,
            fear: 0.65,
            sleep_concern: 0.80,
            case_tension: 0.85,
            support_seeking: 0.50,
          },
          signalSummary: 'Your entry contains signs of stress-related language, sleep concerns, and case-related tension.',
          moodContext: 'anxious',
          isPrivate: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'sample_2',
          title: 'Met with Legal Aid Counsel & Safe Transport Confirmed',
          content:
            'The district legal service authority advocate confirmed protected escort for the hearing session. Practiced 4-7-8 somatic breathing before the session. Feeling much more secure and relieved after today.',
          sentiment: 'positive',
          stressSignal: 0.28,
          emotionSignals: ['safety_reassurance', 'legal_clarity', 'grounded'],
          signals: {
            stress: 0.20,
            fear: 0.15,
            sleep_concern: 0.10,
            case_tension: 0.25,
            support_seeking: 0.60,
          },
          signalSummary: 'Your entry contains positive or grounding reflections and clear support-seeking indicators.',
          moodContext: 'hopeful',
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

  // Filter logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag =
      selectedTag === 'ALL' ||
      (selectedTag === 'POSITIVE' && entry.sentiment === 'positive') ||
      (selectedTag === 'STRESS' && (entry.stressSignal || 0) > 0.5) ||
      (entry.emotionSignals && entry.emotionSignals.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-teal-400" />
              Your Safe Space
            </h1>
            <span className="text-[11px] bg-teal-500/10 text-teal-300 px-3 py-1 rounded-full border border-teal-500/20 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Private Reflection • AI-Assisted Insights
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Write freely. Your thoughts don't need to be perfect. Our non-diagnostic NLP signals help build personal self-awareness over time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-semibold rounded-xl text-xs shadow-md transition-all"
          >
            <Mic className="w-4 h-4 text-teal-400" />
            Voice Check-In
          </button>

          <button
            type="button"
            onClick={() => setIsEditorOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Reflection Entry
          </button>
        </div>
      </div>

      {/* Non-Diagnostic Safety Callout Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-slate-100 block mb-0.5 font-semibold">Non-Diagnostic Wellbeing Signals Notice</strong>
          Linguistic indicators (stress cues, sleep references, case-related tension) provide an automated reflection proxy to help notice patterns over time. These are non-clinical signals and do not constitute psychological or medical evaluations.
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reflections..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filter Chips & View Mode Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedTag === 'ALL'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTag('POSITIVE')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedTag === 'POSITIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grounded
            </button>
            <button
              onClick={() => setSelectedTag('STRESS')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedTag === 'STRESS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stress Signals
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Timeline View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Entries List View */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-teal-400 animate-spin" />
          <span>Retrieving your private reflections...</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 border border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-200">No reflections yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto">
            Your first entry can be anything — there is no right or wrong way to begin writing.
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold rounded-xl text-xs shadow-lg"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6 max-w-4xl mx-auto'
          }
        >
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntryId === entry._id;
            const signals = entry.signals || {
              stress: entry.stressSignal || 0.3,
              fear: entry.stressSignal > 0.5 ? 0.6 : 0.2,
              sleep_concern: entry.stressSignal > 0.6 ? 0.7 : 0.1,
              case_tension: 0.4,
              support_seeking: 0.3,
            };

            return (
              <div
                key={entry._id}
                className="glass-card p-6 border border-slate-800/90 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl"
              >
                <div>
                  {/* Top Entry Card Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-400" />
                          {new Date(entry.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>

                        {entry.moodContext && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 uppercase tracking-wider">
                            {entry.moodContext}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 leading-snug">{entry.title}</h3>
                    </div>

                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
                    {entry.content}
                  </p>
                </div>

                {/* AI Insights & Signals Section */}
                <div className="pt-4 border-t border-slate-800/90 space-y-3">
                  {/* Summary Callout Box */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-200 block mb-0.5">Signals worth paying attention to</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {entry.signalSummary || 'Linguistic signal patterns show baseline emotional balance.'}
                      </p>
                    </div>
                  </div>

                  {/* Signal Indicators Bar Breakdown */}
                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                      <span>Detected Linguistic Signals</span>
                      <span className="text-teal-400/90 text-[10px]">Non-Diagnostic</span>
                    </div>

                    {/* Stress Signal */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Stress-Related Language</span>
                        <span className="font-bold text-slate-200">{Math.round((signals.stress || 0.3) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(10, (signals.stress || 0.3) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Sleep Concern */}
                    {signals.sleep_concern && signals.sleep_concern > 0.2 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Sleep Concerns</span>
                          <span className="font-bold text-slate-200">{Math.round(signals.sleep_concern * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(10, signals.sleep_concern * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emotion Tags */}
                  {entry.emotionSignals && entry.emotionSignals.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                      {entry.emotionSignals.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
                        >
                          #{tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable Technical Details */}
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedEntryId(isExpanded ? null : entry._id || null)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Technical Signal Metrics' : 'View Technical Signal Metrics'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-slate-400 animate-fade-in">
                        <div className="flex justify-between">
                          <span>Sentiment Classification:</span>
                          <strong className="text-slate-200 capitalize">{entry.sentiment}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Stress Signal Raw Score:</span>
                          <strong className="text-slate-200">{entry.stressSignal || 0.3} / 1.0</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Model Pipeline:</span>
                          <strong className="text-teal-400">MindPulse NLP Deterministic Proxy v1.2</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <JournalEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSuccess={() => {
            setIsEditorOpen(false);
            fetchEntries();
          }}
        />
      )}

      {/* Voice Checkin Modal */}
      {isVoiceModalOpen && (
        <VoiceStressModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
        />
      )}
    </div>
  );
};
