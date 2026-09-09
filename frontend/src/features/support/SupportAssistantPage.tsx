import React, { useState, useEffect } from 'react';
import { Bot, Send, Shield, Sparkles, Wind, BookOpen, AlertCircle, HeartHandshake, PhoneCall, RefreshCw, Eye } from 'lucide-react';
import api from '../../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isSafety?: boolean;
  resources?: string[];
}

const JOURNAL_PROMPTS = [
  "What is one small moment today where you felt supported or grounded?",
  "Write about how your body feels right now after practicing a deep breath.",
  "What thoughts are coming up about your upcoming case stage, and what is one step that feels manageable?",
  "List three things in your environment that bring a sense of safety and calm.",
  "What would you like your support counselor or legal advocate to know before your next meeting?"
];

export const SupportAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Welcome! I am your **MindPulse Trauma-Informed Support Companion**.\n\nI provide non-clinical support including:\n• **Somatic Grounding**: Interactive 4-7-8 breathing & 5-4-3-2-1 sensory exercises\n• **Reflective Writing Prompts**: Gentle themes to help organize thoughts before hearings\n• **6-Stage Legal Journey Orientation**: Understanding legal and rehabilitation milestones\n• **Resource Navigation**: Connecting with DLSA Legal Aid, KIRAN Helpline, and your support counselor\n\nHow can I support your wellbeing right now?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'breathing' | 'grounding' | 'prompts'>('chat');

  // 4-7-8 Breathing State
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Ready'>('Ready');
  const [breathTimer, setBreathTimer] = useState<number>(0);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);

  // Journal Prompt State
  const [currentPromptIdx, setCurrentPromptIdx] = useState<number>(0);

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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const res: any = await api.post('/users/support-chat', { message: userText });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data?.reply || 'I am here to guide your non-clinical wellness routines.',
          isSafety: res.data?.isSafetyIntervention,
          resources: res.data?.resourcesSuggested,
        },
      ]);
    } catch {
      // Local fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "Thank you for reaching out. Please remember to take a slow, deep breath. If you are experiencing acute distress, you can connect with KIRAN Helpline at 1800-599-0019 or contact your counselor Dr. Sarah Jenkins.",
          resources: ['KIRAN 1800-599-0019', 'DLSA Advocate Support'],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setActiveTab('chat');
    setInput(promptText);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-teal-400" />
            Trauma-Informed Support Companion
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Non-clinical decision support for somatic grounding, legal journey orientation, and human support discovery.
          </p>
        </div>

        {/* Quick Helpline Badge */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-rose-500/30 text-xs shrink-0">
          <PhoneCall className="w-4 h-4 text-rose-400" />
          <div>
            <span className="text-slate-400 block text-[10px]">24/7 Crisis Helpline</span>
            <span className="font-bold text-rose-300">KIRAN: 1800-599-0019</span>
          </div>
        </div>
      </div>

      {/* Non-Diagnostic Regulatory Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Non-Clinical Decision Support:</strong> MindPulse Companion provides grounding exercises and resource navigation. It is not an AI therapist, medical diagnostician, or replacement for human counselors.
        </span>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          Conversational Support
        </button>

        <button
          onClick={() => setActiveTab('breathing')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'breathing'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Wind className="w-4 h-4" />
          4-7-8 Somatic Breathing
        </button>

        <button
          onClick={() => setActiveTab('grounding')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'grounding'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          5-4-3-2-1 Grounding
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'prompts'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Reflection Prompts
        </button>
      </div>

      {/* Tab 1: Chat Viewport */}
      {activeTab === 'chat' && (
        <div className="glass-card border border-slate-800 flex flex-col h-[500px] rounded-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-br-none shadow-lg'
                      : m.isSafety
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200 rounded-bl-none'
                      : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {m.resources && m.resources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                      {m.resources.map((res, rIdx) => (
                        <span
                          key={rIdx}
                          className="bg-slate-800/80 text-teal-300 text-[11px] px-2 py-0.5 rounded border border-teal-500/20"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Bot className="w-4 h-4 text-teal-400 animate-spin" />
                <span>MindPulse Support Companion is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => handleQuickPrompt("I am feeling severe anxiety ahead of my court hearing tomorrow. Can you guide me through a calming breathing exercise?")}
              className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 flex items-center gap-1.5"
            >
              <Wind className="w-3 h-3 text-teal-400" />
              Hearing Anxiety Grounding
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("What compensation options exist under Section 357A CrPC?")}
              className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 flex items-center gap-1.5"
            >
              <BookOpen className="w-3 h-3 text-indigo-400" />
              Victim Compensation Info
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt("How do I connect with DLSA legal aid for protected witness escort?")}
              className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              DLSA Legal Aid Contact
            </button>
          </div>

          {/* Input box */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about grounding, legal stage orientation, or wellness support..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white rounded-xl disabled:opacity-40 transition-opacity shadow-lg shadow-teal-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: 4-7-8 Somatic Breathing Interactive Widget */}
      {activeTab === 'breathing' && (
        <div className="glass-card p-8 border border-slate-800 text-center space-y-6 rounded-2xl">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
              <Wind className="w-6 h-6 text-teal-400" />
              4-7-8 Somatic Calming Technique
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Somatic breathing regulates nervous system arousal before stressful legal depositions or pre-trial hearings.
            </p>
          </div>

          {/* Visual Breathing Circle */}
          <div className="flex justify-center items-center py-6">
            <div
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-4 shadow-2xl ${
                breathingPhase === 'Inhale'
                  ? 'scale-110 bg-teal-500/20 border-teal-400 shadow-teal-500/30'
                  : breathingPhase === 'Hold'
                  ? 'scale-105 bg-indigo-500/20 border-indigo-400 shadow-indigo-500/30'
                  : breathingPhase === 'Exhale'
                  ? 'scale-90 bg-rose-500/20 border-rose-400 shadow-rose-500/30'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {breathingPhase === 'Ready' ? 'Press Start' : breathingPhase}
              </span>
              <span className="text-4xl font-bold text-white my-1">
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
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 text-white font-semibold rounded-xl text-xs shadow-lg"
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
        <div className="glass-card p-6 border border-slate-800 space-y-4 rounded-2xl">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            5-4-3-2-1 Sensory Grounding Protocol
          </h2>
          <p className="text-xs text-slate-400">
            Use your 5 physical senses to reconnect with your immediate environment when feeling hypervigilance or case-related stress.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-bold text-teal-400">5</span>
              <h4 className="text-xs font-bold text-slate-200">See</h4>
              <p className="text-[11px] text-slate-400">Acknowledge 5 things around you (a lamp, desk, tree outside).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-bold text-indigo-400">4</span>
              <h4 className="text-xs font-bold text-slate-200">Touch</h4>
              <p className="text-[11px] text-slate-400">Feel 4 textures (your clothes, chair surface, cool water glass).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-bold text-amber-400">3</span>
              <h4 className="text-xs font-bold text-slate-200">Hear</h4>
              <p className="text-[11px] text-slate-400">Listen for 3 background sounds (clock ticking, distant breeze, hum).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-bold text-emerald-400">2</span>
              <h4 className="text-xs font-bold text-slate-200">Smell</h4>
              <p className="text-[11px] text-slate-400">Notice 2 scents (fresh air, coffee aroma, soap).</p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xl font-bold text-rose-400">1</span>
              <h4 className="text-xs font-bold text-slate-200">Taste</h4>
              <p className="text-[11px] text-slate-400">Notice 1 taste (mint, sip of water, or focus on a deep breath).</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Reflection Prompt Generator */}
      {activeTab === 'prompts' && (
        <div className="glass-card p-6 border border-slate-800 space-y-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Non-Diagnostic Reflection Prompts
            </h2>
            <button
              onClick={() => setCurrentPromptIdx((prev) => (prev + 1) % JOURNAL_PROMPTS.length)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
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
              Writing down your answers in the MindPulse Journal log helps organize case-related stress.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
