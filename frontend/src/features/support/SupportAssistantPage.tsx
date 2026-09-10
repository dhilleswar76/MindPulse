import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Shield,
  Sparkles,
  Wind,
  BookOpen,
  AlertCircle,
  HeartHandshake,
  PhoneCall,
  RefreshCw,
  Eye,
  Mic,
  Smile,
  Info,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import api from '../../services/api';
import { VoiceStressModal } from '../voice/VoiceStressModal';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isSafety?: boolean;
  resources?: string[];
  timestamp?: string;
}

const QUICK_PROMPTS = [
  { id: 'calm', text: "Help me calm down", icon: Wind },
  { id: 'stressed', text: "I'm feeling stressed", icon: Sparkles },
  { id: 'focus', text: "I can't focus", icon: BookOpen },
  { id: 'difficult', text: "I had a difficult day", icon: HeartHandshake },
  { id: 'thoughts', text: "Help me organize my thoughts", icon: Bot },
  { id: 'comp', text: "Victim Compensation Info (Section 357A CrPC)", icon: Shield },
];

const JOURNAL_PROMPTS = [
  "What is one small moment today where you felt supported or grounded?",
  "Write about how your body feels right now after taking a slow deep breath.",
  "What thoughts are coming up about your upcoming case stage, and what is one step that feels manageable?",
  "List three things in your environment that bring a sense of safety and calm.",
  "What would you like your support counselor or legal advocate to know before your next meeting?",
];

export const SupportAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "How are you feeling today?\n\nYou can talk about whatever is on your mind. I'm here to listen and help you think through it.\n\nI can assist with:\n• **Somatic Grounding**: Interactive 4-7-8 breathing & 5-4-3-2-1 sensory protocols\n• **Thought Organization**: Reflection prompts for your private journal\n• **Legal Rights Orientation**: DLSA legal aid, witness protection, & Section 357A CrPC compensation",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'breathing' | 'grounding' | 'prompts'>('chat');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [showContextCard, setShowContextCard] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 4-7-8 Breathing State
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [breathTimer, setBreathTimer] = useState<number>(0);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);

  // Journal Prompt Index
  const [currentPromptIdx, setCurrentPromptIdx] = useState<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 4-7-8 Breathing Timer logic
  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (breathingPhase === 'Inhale') {
            if (prev >= 4) {
              setBreathingPhase('Hold');
              return 1;
            }
          } else if (breathingPhase === 'Hold') {
            if (prev >= 7) {
              setBreathingPhase('Exhale');
              return 1;
            }
          } else if (breathingPhase === 'Exhale') {
            if (prev >= 8) {
              setBreathingPhase('Inhale');
              return 1;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase]);

  const startBreathing = () => {
    setBreathingPhase('Inhale');
    setBreathTimer(1);
    setIsBreathingActive(true);
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    setBreathingPhase('Ready');
    setBreathTimer(0);
  };

  const handleSend = async (textToSend?: string) => {
    const msgText = (textToSend || input).trim();
    if (!msgText) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: msgText, timestamp: time }]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res: any = await api.post('/users/support-chat', { message: msgText });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data?.reply || 'I am here to guide your non-clinical wellness routines.',
          isSafety: res.data?.isSafetyIntervention,
          resources: res.data?.resourcesSuggested,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      // Local fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "Thank you for reaching out. Please remember to take a slow, deep breath. If you are experiencing acute distress, you can connect with KIRAN Helpline at 1800-599-0019 or contact your designated support counselor Dr. Sarah Jenkins.",
          resources: ['KIRAN: 1800-599-0019', 'Tele-MANAS: 14416', 'DLSA Advocate Support'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render markdown text formatting cleanly (bolding, bullet points, numbered lists)
  const formatResponseText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold parser
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-slate-100">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 my-1">
            {formattedLine}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <li key={idx} className="ml-4 list-decimal text-slate-200 my-1">
            {formattedLine}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="my-1">{formattedLine}</p>;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-teal-400" />
            AI Support Companion
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            A calm, supportive AI space to talk through your thoughts, practice somatic grounding, or explore legal rights.
          </p>
        </div>

        {/* 24/7 Helpline Card */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-rose-500/30 text-xs shrink-0 shadow-lg">
          <PhoneCall className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">24/7 Crisis Helplines</span>
            <span className="font-bold text-rose-300">KIRAN: 1800-599-0019</span> • <span className="font-bold text-teal-300">Tele-MANAS: 14416</span>
          </div>
        </div>
      </div>

      {/* Non-Diagnostic Regulatory Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Non-Clinical Decision Support:</strong> MindPulse Assistant provides non-diagnostic grounding, organization, and resource orientation. It is not an AI therapist or medical diagnostician.
        </span>
      </div>

      {/* Optional Context-Aware Signal Card */}
      {showContextCard && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 to-indigo-950/40 border border-teal-500/30 flex items-start justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-teal-300 block mb-0.5">Recent Reflection Signal Noticed</span>
              <p className="text-slate-300 leading-relaxed">
                Your recent reflection log indicated elevated stress-related language about upcoming case proceedings. Would you like to talk about what's been making things difficult?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSend("I've been feeling stressed about my upcoming court testimony. Can you help me talk through it?")}
              className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-xl font-semibold border border-teal-500/30 transition-colors"
            >
              Talk About It
            </button>
            <button
              onClick={() => setShowContextCard(false)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            Conversational Support
          </button>

          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'breathing'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wind className="w-4 h-4" />
            4-7-8 Somatic Breathing
          </button>

          <button
            onClick={() => setActiveTab('grounding')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'grounding'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            5-4-3-2-1 Grounding
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'prompts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Reflection Prompts
          </button>
        </div>

        {/* Action button to open Voice check-in */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <Mic className="w-3.5 h-3.5 text-teal-400" />
          Voice Check-In
        </button>
      </div>

      {/* Tab 1: Chat Viewport */}
      {activeTab === 'chat' && (
        <div className="glass-card border border-slate-800/90 flex flex-col h-[560px] rounded-2xl overflow-hidden shadow-2xl">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-br-none shadow-lg'
                      : m.isSafety
                      ? 'bg-rose-950/80 border border-rose-500/40 text-rose-100 rounded-bl-none shadow-xl'
                      : 'bg-slate-900/95 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="text-xs">{formatResponseText(m.text)}</div>

                  {m.resources && m.resources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {m.resources.map((res, rIdx) => (
                        <span
                          key={rIdx}
                          className="bg-slate-800/90 text-teal-300 text-[11px] px-2.5 py-0.5 rounded-lg border border-teal-500/20 font-medium"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.timestamp && (
                    <div className="text-[10px] text-slate-500 text-right mt-1">
                      {m.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Bot className="w-4 h-4 text-teal-400 animate-spin" />
                <span>Support Companion is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Support Prompts Chips */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Quick Prompts:</span>
            {QUICK_PROMPTS.map((qp) => {
              const Icon = qp.icon;
              return (
                <button
                  key={qp.id}
                  type="button"
                  onClick={() => handleSend(qp.text)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-full shrink-0 border border-slate-700/70 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-teal-400" />
                  <span>{qp.text}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write what's on your mind..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white rounded-xl disabled:opacity-40 transition-opacity shadow-lg shadow-teal-500/20"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: 4-7-8 Somatic Breathing Widget */}
      {activeTab === 'breathing' && (
        <div className="glass-card p-8 border border-slate-800 text-center space-y-6 rounded-2xl shadow-xl">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
              <Wind className="w-6 h-6 text-teal-400" />
              4-7-8 Somatic Calming Technique
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Somatic breathing regulates autonomic arousal before stressful legal depositions or pre-trial hearings.
            </p>
          </div>

          {/* Visual Breathing Circle */}
          <div className="flex justify-center items-center py-6">
            <div
              className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-4 shadow-2xl ${
                breathingPhase === 'Inhale'
                  ? 'scale-110 bg-teal-500/20 border-teal-400 shadow-teal-500/30'
                  : breathingPhase === 'Hold'
                  ? 'scale-105 bg-indigo-500/20 border-indigo-400 shadow-indigo-500/30'
                  : breathingPhase === 'Exhale'
                  ? 'scale-90 bg-rose-500/20 border-rose-400 shadow-rose-500/30'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {breathingPhase === 'Ready' ? 'Press Start' : breathingPhase}
              </span>
              <span className="text-4xl font-extrabold text-white my-1">
                {breathingPhase === 'Ready' ? '4-7-8' : `${breathTimer}s`}
              </span>
              <span className="text-[11px] text-slate-300">
                {breathingPhase === 'Inhale'
                  ? 'Breathe in slowly (4s)'
                  : breathingPhase === 'Hold'
                  ? 'Hold gently (7s)'
                  : breathingPhase === 'Exhale'
                  ? 'Exhale fully (8s)'
                  : 'Somatic Grounding'}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {!isBreathingActive ? (
              <button
                onClick={startBreathing}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20"
              >
                Start 4-7-8 Breathing Cycle
              </button>
            ) : (
              <button
                onClick={stopBreathing}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs"
              >
                Stop Exercise
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: 5-4-3-2-1 Sensory Grounding Guide */}
      {activeTab === 'grounding' && (
        <div className="glass-card p-6 border border-slate-800 space-y-4 rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            5-4-3-2-1 Sensory Grounding Protocol
          </h2>
          <p className="text-xs text-slate-400">
            Use your 5 physical senses to reconnect with your immediate environment when feeling hypervigilance or case-related stress.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-extrabold text-teal-400">5</span>
              <h4 className="text-xs font-bold text-slate-200">See</h4>
              <p className="text-[11px] text-slate-400">Acknowledge 5 things around you (a desk, tree, window light).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-extrabold text-indigo-400">4</span>
              <h4 className="text-xs font-bold text-slate-200">Touch</h4>
              <p className="text-[11px] text-slate-400">Feel 4 textures (your clothes, chair surface, cool water glass).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-extrabold text-amber-400">3</span>
              <h4 className="text-xs font-bold text-slate-200">Hear</h4>
              <p className="text-[11px] text-slate-400">Listen for 3 background sounds (clock ticking, distant breeze, hum).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-extrabold text-emerald-400">2</span>
              <h4 className="text-xs font-bold text-slate-200">Smell</h4>
              <p className="text-[11px] text-slate-400">Notice 2 scents (fresh air, coffee aroma, soap).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-extrabold text-rose-400">1</span>
              <h4 className="text-xs font-bold text-slate-200">Taste</h4>
              <p className="text-[11px] text-slate-400">Notice 1 taste (mint, sip of water, or focus on a deep breath).</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Reflection Prompt Generator */}
      {activeTab === 'prompts' && (
        <div className="glass-card p-6 border border-slate-800 space-y-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Non-Diagnostic Reflection Prompts
            </h2>
            <button
              onClick={() => setCurrentPromptIdx((prev) => (prev + 1) % JOURNAL_PROMPTS.length)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate New Prompt
            </button>
          </div>

          <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-teal-400 mx-auto" />
            <p className="text-base font-medium text-slate-100 italic leading-relaxed">
              "{JOURNAL_PROMPTS[currentPromptIdx]}"
            </p>
            <p className="text-xs text-slate-400">
              Writing down your answers in your private MindPulse reflection log helps organize case-related stress.
            </p>
          </div>
        </div>
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
