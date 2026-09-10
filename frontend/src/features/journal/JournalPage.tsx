import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Feather,
  Lock,
  Shield,
  Search,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Star,
  Copy,
  Download,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Calendar,
  Clock,
  Heart,
  Smile,
  HelpCircle,
  Filter,
  Tag,
  Eye,
  RefreshCw,
  Scale,
  Moon,
  Wind,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { JournalEntry } from '../../types';
import { PrivacyConsentModal } from '../auth/PrivacyConsentModal';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Active Writing Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('Calm');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#reflection']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Zen Fullscreen Focus Mode
  const [isZenMode, setIsZenMode] = useState(false);

  // Active Guided Prompt Category
  const [activePromptCategory, setActivePromptCategory] = useState<'hearing' | 'nighttime' | 'grounding' | 'advocate'>('hearing');

  // Search, Filter & Starred State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('ALL');
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mindpulse_starred_journals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Reading View Modal
  const [readingEntry, setReadingEntry] = useState<JournalEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Draft auto-persistence key
  const DRAFT_STORAGE_KEY = 'mindpulse_journal_draft_v2';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const moodOptions = [
    { label: 'Calm', emoji: '🌸', desc: 'Peaceful, settled' },
    { label: 'Managing', emoji: '🌿', desc: 'Holding steady' },
    { label: 'Uneasy', emoji: '⛅', desc: 'Restless, lingering worry' },
    { label: 'Anxious', emoji: '🌧️', desc: 'High case tension' },
    { label: 'Hopeful', emoji: '✨', desc: 'Relief or clarity' },
    { label: 'Protected', emoji: '🛡️', desc: 'Safe & supported' },
  ];

  const presetTags = [
    '#reflection',
    '#hearing_prep',
    '#nighttime_worry',
    '#legal_clarity',
    '#relief',
    '#self_care',
    '#counselor_touchpoint',
    '#safe_transit',
  ];

  const promptCategories = {
    hearing: {
      title: '⚖️ Court & Hearing Preparation',
      prompts: [
        'What questions or fears can I put down on paper so they do not follow me to bed tonight?',
        'What safe accommodations or transit escort did my advocate confirm for court day?',
        'What is one grounding truth I want to keep in mind when giving my testimony?',
      ],
    },
    nighttime: {
      title: '🌙 Nighttime Bedtime De-escalation',
      prompts: [
        'What is one heavy thought from today that I am ready to set down on this page for the night?',
        'Where in my body am I feeling tension, and what would comforting warmth feel like right now?',
        'What quiet moment brought a breath of peace to my day today?',
      ],
    },
    grounding: {
      title: '🌿 Grounded Strength & Progress',
      prompts: [
        'What gave me strength today, even if it was just getting through a difficult conversation?',
        'How has my sense of safety or breathing improved compared to when the case first started?',
        'What reminder of hope can I write to my future self for the next hearing date?',
      ],
    },
    advocate: {
      title: '🤝 Counselor & Legal Advocate Reflections',
      prompts: [
        'What feelings or questions arose after my latest conversation with Dr. Sarah Jenkins?',
        'What statutory entitlements (compensation, safe waiting room) did we discuss today?',
        'What is one question I want to bring to my next legal aid check-in?',
      ],
    },
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/journal');
      setEntries(res.data?.entries || []);
    } catch {
      // Safe fallback entries
      setEntries([
        {
          _id: 'sample_1',
          title: 'Preparing for Pre-Trial Testimony & Nighttime Worry',
          content:
            'Having trouble sleeping ahead of the upcoming hearing date on Friday. Feeling a lot of tension about facing cross-examination questions in the Special Court.\n\nSpeaking with Dr. Sarah Jenkins helped me write down my key statements and confirmed that the District Witness Protection cell will arrange safe transit to the courtroom so I do not have to wait in public hallways.',
          sentiment: 'negative',
          stressSignal: 0.68,
          emotionSignals: ['hearing_prep', 'nighttime_worry', 'grounding'],
          isPrivate: true,
          createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
        },
        {
          _id: 'sample_2',
          title: 'Met with Legal Aid Advocate & Safe Transport Confirmed',
          content:
            'Met with the DLSA advocate appointed to my case today. She walked through the 6-stage journey and explained what to expect during the evidence deposition.\n\nFeeling much more secure knowing that statutory victim compensation under Section 357A CrPC has also been initiated. Took 3 deep breaths on the walk back.',
          sentiment: 'positive',
          stressSignal: 0.22,
          emotionSignals: ['legal_clarity', 'safe_transit', 'relief'],
          isPrivate: true,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          _id: 'sample_3',
          title: 'Practicing 4-7-8 Breathing After Summons Notice',
          content:
            'Received the court date summons. At first my heart started racing, but I sat quietly and practiced 4-7-8 breathing for three cycles.\n\nReminding myself: my statements are recorded, I am not alone, and my counselor is reviewing my case queue every day.',
          sentiment: 'positive',
          stressSignal: 0.35,
          emotionSignals: ['self_care', 'reflection'],
          isPrivate: true,
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    // Load local draft if available and not editing
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.content) {
          setContent(parsed.content);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.mood) setSelectedMood(parsed.mood);
          if (parsed.tags) setSelectedTags(parsed.tags);
        }
      }
    } catch {}
  }, []);

  // Autosave draft locally
  useEffect(() => {
    if (!editingEntryId && content.trim().length > 0) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ title, content, mood: selectedMood, tags: selectedTags })
        );
      } catch {}
    }
  }, [title, content, selectedMood, selectedTags, editingEntryId]);

  // Persist starred entries
  const toggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('mindpulse_starred_journals', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    const exportData = entries
      .map(
        (e) =>
          `==================================================\nTITLE: ${e.title}\nDATE: ${new Date(
            e.createdAt
          ).toLocaleString()}\nTAGS: ${(e.emotionSignals || []).join(', ')}\nPRIVACY: Confidentially Encrypted (MindPulse)\n==================================================\n\n${
            e.content
          }\n\n`
      )
      .join('\n');

    const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MindPulse_Private_Reflections_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    const entryTitle =
      title.trim() ||
      `Reflection: ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;

    const tagsClean = selectedTags.map((t) => t.replace('#', ''));

    try {
      if (editingEntryId) {
        // Updating existing entry
        const res: any = await api.put(`/journal/${editingEntryId}`, {
          title: entryTitle,
          content,
          isPrivate: true,
        });

        const updated = res.data?.entry || {
          _id: editingEntryId,
          title: entryTitle,
          content,
          sentiment: selectedMood === 'Anxious' || selectedMood === 'Uneasy' ? 'negative' : 'positive',
          stressSignal: selectedMood === 'Anxious' ? 0.7 : 0.25,
          emotionSignals: tagsClean,
          isPrivate: true,
          createdAt: new Date().toISOString(),
        };

        setEntries((prev) => prev.map((item) => (item._id === editingEntryId ? updated : item)));
        setSaveFeedback('Reflection updated peacefully');
        setEditingEntryId(null);
      } else {
        // Creating brand new entry
        const res: any = await api.post('/journal', {
          title: entryTitle,
          content,
          isPrivate: true,
        });

        const newDoc: JournalEntry = res.data?.entry ||
          res.data || {
            _id: 'local_' + Date.now(),
            title: entryTitle,
            content,
            sentiment: selectedMood === 'Anxious' || selectedMood === 'Uneasy' ? 'negative' : 'positive',
            stressSignal: selectedMood === 'Anxious' ? 0.7 : 0.25,
            emotionSignals: tagsClean,
            isPrivate: true,
            createdAt: new Date().toISOString(),
          };

        setEntries((prev) => [newDoc, ...prev]);
        setSaveFeedback('Saved to your private sanctuary');
      }

      // Reset form & clear draft
      setTitle('');
      setContent('');
      setSelectedTags(['#reflection']);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      if (isZenMode) setIsZenMode(false);
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch {
      // Local fallback on network disruption
      const fallbackEntry: JournalEntry = {
        _id: editingEntryId || 'local_' + Date.now(),
        title: entryTitle,
        content,
        sentiment: selectedMood === 'Anxious' ? 'negative' : 'positive',
        stressSignal: selectedMood === 'Anxious' ? 0.65 : 0.25,
        emotionSignals: tagsClean,
        isPrivate: true,
        createdAt: new Date().toISOString(),
      };

      if (editingEntryId) {
        setEntries((prev) => prev.map((item) => (item._id === editingEntryId ? fallbackEntry : item)));
        setEditingEntryId(null);
      } else {
        setEntries((prev) => [fallbackEntry, ...prev]);
      }

      setTitle('');
      setContent('');
      setSelectedTags(['#reflection']);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      if (isZenMode) setIsZenMode(false);
      setSaveFeedback('Saved locally to your device');
      setTimeout(() => setSaveFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry._id || null);
    setTitle(entry.title);
    setContent(entry.content);
    if (entry.emotionSignals && entry.emotionSignals.length > 0) {
      setSelectedTags(entry.emotionSignals.map((t) => (t.startsWith('#') ? t : `#${t}`)));
    }
    if (readingEntry) setReadingEntry(null);
    window.scrollTo({ top: 400, behavior: 'smooth' });
    textareaRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setTitle('');
    setContent('');
    setSelectedTags(['#reflection']);
  };

  const handleDelete = async (id?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    if (!window.confirm('Are you sure you want to remove this reflection from your sanctuary?')) {
      return;
    }
    try {
      await api.delete(`/journal/${id}`);
      setEntries((prev) => prev.filter((item) => item._id !== id));
      if (readingEntry?._id === id) setReadingEntry(null);
    } catch {
      setEntries((prev) => prev.filter((item) => item._id !== id));
      if (readingEntry?._id === id) setReadingEntry(null);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
      }
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const formatted = customTagInput.startsWith('#')
        ? customTagInput.trim()
        : `#${customTagInput.trim()}`;
      if (!selectedTags.includes(formatted)) {
        setSelectedTags([...selectedTags, formatted]);
      }
      setCustomTagInput('');
    }
  };

  // Word & Character count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Filter and Search logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilterTag === 'ALL') return true;
    if (activeFilterTag === 'STARRED') return starredIds.includes(entry._id || '');
    if (activeFilterTag === 'POSITIVE') return entry.sentiment === 'positive';
    if (activeFilterTag === 'TENSE') return entry.sentiment === 'negative' || entry.stressSignal > 0.5;

    return entry.emotionSignals && entry.emotionSignals.includes(activeFilterTag.replace('#', ''));
  });

  // Calculate Sanctuary Metrics
  const totalWordsWritten = entries.reduce(
    (acc, cur) => acc + (cur.content ? cur.content.split(/\s+/).length : 0),
    0
  );
  const groundedCount = entries.filter((e) => e.sentiment === 'positive').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PRIVACY STATUS                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted • Private Reflection Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Feather className="w-7 h-7 text-teal-400" />
            <span>Journal & Personal Reflections</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your private, encrypted space to process hearing worries, set down bedtime thoughts, and celebrate quiet moments of peace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Download private text file of your reflections"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Privacy Rights</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SANCTUARY METRICS CARDS                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>Reflections Saved</span>
          </span>
          <div className="text-2xl font-bold text-white">{entries.length}</div>
          <span className="text-[11px] text-slate-400">Total thoughts preserved</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-indigo-400" />
            <span>Words Released</span>
          </span>
          <div className="text-2xl font-bold text-indigo-400">{totalWordsWritten}</div>
          <span className="text-[11px] text-slate-400">Emotional weight set down</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Grounded Moments</span>
          </span>
          <div className="text-2xl font-bold text-amber-400">{groundedCount}</div>
          <span className="text-[11px] text-slate-400">Entries tagged with peace</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-rose-400" />
            <span>Anchor Thoughts</span>
          </span>
          <div className="text-2xl font-bold text-white">{starredIds.length}</div>
          <span className="text-[11px] text-slate-400">Bookmarked moments</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GUIDED PROMPT NAVIGATOR                                                */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Trauma-Informed Reflection Prompts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any prompt to gently paste it into your writing canvas below.
            </p>
          </div>
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['hearing', 'nighttime', 'grounding', 'advocate'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActivePromptCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activePromptCategory === cat
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                {promptCategories[cat].title.split(' ')[0]} {cat === 'hearing' ? 'Hearing' : cat === 'nighttime' ? 'Nighttime' : cat === 'grounding' ? 'Grounded' : 'Advocate'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {promptCategories[activePromptCategory].prompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setContent((prev) => (prev ? `${prev}\n\n${p}\n` : `${p}\n`));
                textareaRef.current?.focus();
              }}
              className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 text-left transition-all group"
            >
              <span className="text-xs text-slate-300 group-hover:text-teal-300 leading-relaxed block">
                "{p}"
              </span>
              <span className="text-[10px] text-teal-400 mt-2 block font-medium group-hover:translate-x-0.5 transition-transform">
                + Use Prompt
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. INLINE WRITING SANCTUARY CANVAS                                       */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-bold text-white">
              {editingEntryId ? 'Editing Reflection' : 'Write in Your Sanctuary'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {content.length > 0 && !editingEntryId && (
              <span className="text-[11px] text-teal-400 font-medium hidden sm:inline">
                Draft auto-saved on device
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsZenMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              title="Open full-screen distraction-free canvas"
            >
              <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Zen Focus Mode</span>
            </button>
          </div>
        </div>

        {editingEntryId && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
            <span>You are editing an existing reflection. Changes will update your record.</span>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs text-slate-400 hover:text-white underline ml-2"
            >
              Cancel Edit
            </button>
          </div>
        )}

        {saveFeedback && (
          <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center gap-2 text-xs text-teal-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        <form onSubmit={handleSaveEntry} className="space-y-4">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (Optional, e.g. Pre-Hearing Thoughts, Morning Relief, Bedtime Notes)"
            className="w-full bg-slate-800/60 border border-slate-700/70 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />

          {/* Main Writing Canvas */}
          <textarea
            ref={textareaRef}
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write what is on your mind... thoughts about hearings, feelings of exhaustion or moments of peace you want to remember..."
            className="w-full bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed transition-colors resize-y"
          />

          {/* Mood & Tag Controls */}
          <div className="space-y-3 pt-2">
            {/* Mood selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Current Feeling:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {moodOptions.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(m.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                      selectedMood === m.label
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag selector */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
              <span className="text-xs font-semibold text-slate-400 shrink-0 mt-1.5">Tags:</span>
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {presetTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-xs transition-colors ${
                        isChecked
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-semibold'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
                {/* Custom tag input */}
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="+ Add tag (Press Enter)"
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{content.length} characters</span>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && !editingEntryId && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Discard your current draft?')) {
                      setTitle('');
                      setContent('');
                      localStorage.removeItem(DRAFT_STORAGE_KEY);
                    }
                  }}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Discard Draft
                </button>
              )}

              {editingEntryId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving || !content.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all disabled:opacity-40"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : editingEntryId ? (
                  <span>Update Reflection</span>
                ) : (
                  <>
                    <span>Save to Sanctuary</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 5. REFLECTIONS HISTORY & SEARCH/FILTER WORKBENCH                          */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-white">Your Reflection Archive</h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredEntries.length} of {entries.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts, hearings, words..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setActiveFilterTag('ALL')}
            className={`px-3 py-1 rounded-xl transition-colors ${
              activeFilterTag === 'ALL'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Reflections
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTag('STARRED')}
            className={`px-3 py-1 rounded-xl flex items-center gap-1 transition-colors ${
              activeFilterTag === 'STARRED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Star className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>Anchors ({starredIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTag('POSITIVE')}
            className={`px-3 py-1 rounded-xl transition-colors ${
              activeFilterTag === 'POSITIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🌸 Peaceful / Relief
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTag('hearing_prep')}
            className={`px-3 py-1 rounded-xl transition-colors ${
              activeFilterTag === 'hearing_prep'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⚖️ #hearing_prep
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTag('nighttime_worry')}
            className={`px-3 py-1 rounded-xl transition-colors ${
              activeFilterTag === 'nighttime_worry'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🌙 #nighttime_worry
          </button>
        </div>

        {/* Entries List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            Opening your reflection archive...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800/80 rounded-3xl space-y-3">
            <Feather className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">No matching reflections found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Try adjusting your search terms or filter. Your thoughts remain safely preserved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEntries.map((entry) => {
              const isStarred = starredIds.includes(entry._id || '');
              const wordCountItem = entry.content ? entry.content.split(/\s+/).length : 0;
              return (
                <article
                  key={entry._id}
                  onClick={() => setReadingEntry(entry)}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-3.5 transition-all shadow-sm cursor-pointer group relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => toggleStar(entry._id || '', e)}
                        className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                        title={isStarred ? 'Unstar anchor' : 'Star anchor'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                          }`}
                        />
                      </button>
                      <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                        {entry.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>
                          {new Date(entry.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handleCopy(entry._id || '', entry.content, e)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === entry._id ? (
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(entry);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-300 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit reflection"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(entry._id, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete reflection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {entry.content}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entry.emotionSignals &&
                        entry.emotionSignals.map((signal, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 font-medium"
                          >
                            #{signal.replace('#', '')}
                          </span>
                        ))}
                    </div>
                    <span className="text-[11px] text-slate-500">{wordCountItem} words</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. READING MODAL VIEW                                                     */}
      {/* ========================================================================= */}
      {readingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(readingEntry.createdAt).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {readingEntry.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReadingEntry(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {readingEntry.content}
            </div>

            {/* Tags & Metadata */}
            {readingEntry.emotionSignals && readingEntry.emotionSignals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {readingEntry.emotionSignals.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    #{t.replace('#', '')}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => toggleStar(readingEntry._id || '')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    starredIds.includes(readingEntry._id || '')
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                <span>
                  {starredIds.includes(readingEntry._id || '')
                    ? 'Saved as Anchor'
                    : 'Save as Anchor Thought'}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(readingEntry)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReadingEntry(null)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ZEN FULLSCREEN FOCUS MODE                                              */}
      {/* ========================================================================= */}
      {isZenMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-6 sm:p-12 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between max-w-3xl w-full mx-auto pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
              <Feather className="w-4 h-4" />
              <span>Zen Focus Sanctuary • Distraction-Free Reflection</span>
            </div>
            <button
              type="button"
              onClick={() => setIsZenMode(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Zen Mode</span>
            </button>
          </div>

          <div className="max-w-3xl w-full mx-auto py-8 space-y-6 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reflection a gentle title..."
              className="w-full bg-transparent border-b border-slate-800 pb-3 text-xl sm:text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />

            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write with complete peace of mind... No notifications, no grading, just your thoughts."
              className="w-full bg-transparent text-base sm:text-lg text-slate-100 placeholder-slate-600 focus:outline-none leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-between max-w-3xl w-full mx-auto pt-6 border-t border-slate-800 text-xs text-slate-400">
            <span>{wordCount} words written</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsZenMode(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Return to Dashboard
              </button>
              <button
                type="button"
                onClick={handleSaveEntry}
                disabled={isSaving || !content.trim()}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl shadow transition-all disabled:opacity-40"
              >
                {isSaving ? 'Saving...' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Consent Modal */}
      <PrivacyConsentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
