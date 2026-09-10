import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Shield, Sparkles, Wind, BookOpen, HeartHandshake, PhoneCall, X, Minus, Scale, Moon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export interface SupportChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  isSafety?: boolean;
  resources?: string[];
  followUpSuggestions?: string[];
  timestamp?: string;
}

interface SupportChatPanelProps {
  isFloating?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}

export const SupportChatPanel: React.FC<SupportChatPanelProps> = ({
  isFloating = false,
  onClose,
  onMinimize,
}) => {
  const { user } = useAuth();
  const counselorName =
    user?.assignedCounselor && user.assignedCounselor !== 'Dr. Sarah Jenkins' && !user.assignedCounselor.includes('Jenkins')
      ? user.assignedCounselor
      : 'your assigned counselor';

  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your **MindPulse Trauma-Informed Support Companion**.\n\nI can assist you with:\n• **4-7-8 Somatic Breathing** or **5-4-3-2-1 Sensory Grounding**\n• Preparing for upcoming **court hearings & witness protection**\n• Statutory **Victim Compensation (Sec 357A CrPC)** & Form I guidance\n• Connecting with **free DLSA Legal Defense (15100)** or your counselor\n• Restorative **bedtime relaxation routines (NSDR)**\n\nHow can I support your wellbeing today?",
      followUpSuggestions: [
        'Can you guide me through a 4-7-8 breathing exercise?',
        'Give me a grounding exercise.',
        'What is victim compensation?',
        'How can I get free legal assistance?',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText !== undefined ? customText : input;
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Append user message immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userText, timestamp: timeStr }]);
    if (customText === undefined) {
      setInput('');
    }
    setIsTyping(true);

    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const res: any = await api.post('/users/support-chat', {
        message: userText,
        history: historyPayload,
      });

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data?.reply || 'I am here to support your daily wellness routines and case journey orientation.',
          isSafety: res.data?.isSafetyIntervention,
          resources: res.data?.resourcesSuggested,
          followUpSuggestions: res.data?.followUpSuggestions,
          timestamp: replyTime,
        },
      ]);
    } catch {
      // Local fallback with intent analysis so offline / network drops NEVER return a single generic phrase
      const fallbackTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const localReply = generateLocalAssistantResponse(userText, historyPayload, counselorName);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: localReply.reply,
          isSafety: localReply.isSafety,
          resources: localReply.resources,
          followUpSuggestions: localReply.followUpSuggestions,
          timestamp: fallbackTime,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSend(undefined, promptText);
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${
        isFloating ? 'w-full h-full' : 'h-[580px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>MindPulse Support Assistant</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Contextual Non-Clinical Decision Support • Confidential</p>
          </div>
        </div>

        {isFloating && (
          <div className="flex items-center gap-1">
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                title="Minimize assistant"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Minimize Support Assistant"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close assistant"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close Support Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Safety Notice Strip */}
      <div className="px-3.5 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
        <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>
          Non-clinical guidance. For 24/7 crisis support, call <strong>Tele-MANAS (14416)</strong> or <strong>KIRAN (1800-599-0019)</strong>.
        </span>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-br-none shadow-md'
                  : m.isSafety
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-200 rounded-bl-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Resource Badges */}
              {m.resources && m.resources.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {m.resources.map((res, rIdx) => (
                    <span
                      key={rIdx}
                      className="bg-slate-900 text-teal-300 text-[10px] px-2 py-0.5 rounded-md border border-teal-500/20 font-medium"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              )}

              {/* Follow-up Suggestion Chips */}
              {m.followUpSuggestions && m.followUpSuggestions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Suggested follow-ups:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.followUpSuggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleQuickPrompt(sug)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-teal-300 hover:text-white border border-teal-500/20 transition-colors text-left"
                      >
                        → {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {m.timestamp && (
                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-teal-200/80' : 'text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 p-2">
            <Bot className="w-3.5 h-3.5 text-teal-400 animate-spin" />
            <span>Support Assistant is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
        <button
          type="button"
          onClick={() => handleQuickPrompt("I have an upcoming court hearing and feeling nervous. Can you guide me through a 4-7-8 breathing exercise?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Wind className="w-3 h-3 text-teal-400" />
          <span>Hearing Grounding</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("Can you guide me through a 4-7-8 breathing exercise?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Wind className="w-3 h-3 text-teal-400" />
          <span>4-7-8 Breathing</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("Give me a grounding exercise.")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>5-4-3-2-1 Grounding</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("What is victim compensation?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-3 h-3 text-amber-400" />
          <span>Compensation Info</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("How can I get free legal assistance?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Scale className="w-3 h-3 text-sky-400" />
          <span>Free Legal Aid (15100)</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("I can't sleep tonight.")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Moon className="w-3 h-3 text-indigo-400" />
          <span>Bedtime Rest (NSDR)</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("I want to talk to my counselor.")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <HeartHandshake className="w-3 h-3 text-emerald-400" />
          <span>Talk to Counselor</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickPrompt("What are the witness safe travel and protection options?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Shield className="w-3 h-3 text-cyan-400" />
          <span>Witness Safe Travel</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about 4-7-8 breathing, grounding, legal defense, compensation, or sleep..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 transition-opacity shadow"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// INTENT-AWARE LOCAL ASSISTANT FALLBACK
// Used if the user is offline or backend service is momentarily unreachable.
// ============================================================================

function generateLocalAssistantResponse(
  message: string,
  history: { sender: string; text: string }[],
  counselorName: string
): { reply: string; isSafety: boolean; resources: string[]; followUpSuggestions: string[] } {
  const lower = message.toLowerCase().trim();

  // Crisis
  if (/\b(suicid|kill myself|end it all|die|self harm|urgent|emergency|danger)\b/i.test(lower)) {
    return {
      reply: "I hear that you need urgent support right now. Please connect with immediate human help:\n\n• Tele-MANAS: Call 14416 (24/7 Toll-Free)\n• KIRAN Helpline: Call 1800-599-0019 (24/7 Toll-Free)\n• Emergency: Dial 112\n• Legal Defense: Dial 15100",
      isSafety: true,
      resources: ['Tele-MANAS 14416', 'KIRAN 1800-599-0019', 'Emergency 112'],
      followUpSuggestions: ['Call 14416', 'Call 1800-599-0019'],
    };
  }

  // Safe transit & Witness Protection
  if (/\b(safe transit|safe travel|police escort|witness protection|witness safe travel)\b/i.test(lower)) {
    return {
      reply: "Under the **Witness Protection Scheme**, you can request:\n\n• Secure police transit to and from court depositions\n• Protected waiting rooms with separate courthouse entry/exit\n• Testifying via secure video link to avoid intimidation\n\nContact the District Witness Protection Committee or your counselor to request protection orders.",
      isSafety: false,
      resources: ['Witness Protection Scheme', 'District Protection Committee'],
      followUpSuggestions: ['Hearing Grounding', 'Free Legal Aid (15100)'],
    };
  }

  // 4-7-8 Breathing
  if (/\b(4-7-8|breath|breathing|inhale|exhale)\b/i.test(lower)) {
    return {
      reply: "Let's do the **4-7-8 Somatic Breathing Exercise** together:\n\n1. Inhale quietly through your nose for 4 seconds (1... 2... 3... 4...)\n2. Hold your breath gently for 7 seconds (1... 2... 3... 4... 5... 6... 7...)\n3. Exhale slowly through your mouth for 8 seconds (1... 2... 3... 4... 5... 6... 7... 8...)\n\nTake one natural breath. Repeat this cycle 2–3 times to calm pre-hearing tension.",
      isSafety: false,
      resources: ['4-7-8 Breathing Guide', 'Grounding Directory'],
      followUpSuggestions: ['Repeat 4-7-8 breathing', 'Give me a grounding exercise'],
    };
  }

  // 5-4-3-2-1 Grounding
  if (/\b(grounding|5-4-3-2-1|sensory|ground me)\b/i.test(lower)) {
    return {
      reply: "Here is the **5-4-3-2-1 Sensory Grounding Technique**:\n\n• 5 things you see in the room\n• 4 things you can physically feel\n• 3 things you can hear\n• 2 things you can smell\n• 1 thing you can taste\n\nTake a slow breath. Your focus is returned to the safety of the present moment.",
      isSafety: false,
      resources: ['5-4-3-2-1 Sensory Reset', 'Grounding Tool'],
      followUpSuggestions: ['Try 4-7-8 breathing', 'Return to resources'],
    };
  }

  // Court Anxiety
  if (/\b(court|hearing|trial|deposition|judge)\b/i.test(lower)) {
    return {
      reply: `Court proceedings can evoke strong anxiety. Remember your rights under witness protection:\n\n• Right to a separate, confidential waiting room\n• Right to free DLSA legal counsel accompaniment\n• Right to request safe transit assistance\n\nYou can also contact ${counselorName} for pre-hearing accompaniment review.`,
      isSafety: false,
      resources: ['DLSA Witness Protection', 'Court Accompaniment'],
      followUpSuggestions: ['Guide me through 4-7-8 breathing', 'Free legal aid details'],
    };
  }

  // Victim Compensation
  if (/\b(compensation|357a|financial relief|relief|grant)\b/i.test(lower)) {
    return {
      reply: "Under **Section 357A CrPC**, victims can access:\n\n• Interim financial grants within 14–30 days of FIR\n• Emergency medical and surgical reimbursement\n• Long-term rehabilitation and family subsistence grants\n\nSubmit Form I through the District Legal Services Authority (DLSA) with your counselor's assistance.",
      isSafety: false,
      resources: ['Section 357A CrPC', 'DLSA Form I Guidelines'],
      followUpSuggestions: ['How to submit Form I', 'Free legal assistance'],
    };
  }

  // Legal Aid
  if (/\b(legal|lawyer|advocate|nalsa|dlsa|15100)\b/i.test(lower)) {
    return {
      reply: "Under the Legal Services Authorities Act, 1987, you are entitled to **free panel advocate representation** at zero fee.\n\n• Dial **15100** (24/7 National Legal Aid Toll-Free Helpline)\n• Or visit your local District Court DLSA front office.\n\n*Notice: Information is for educational guidance, not formal legal advice.*",
      isSafety: false,
      resources: ['NALSA / DLSA Free Legal Defense', 'Toll-Free 15100'],
      followUpSuggestions: ['Call 15100', 'Victim compensation details'],
    };
  }

  // Sleep
  if (/\b(sleep|insomnia|bedtime|nightmare|rest)\b/i.test(lower)) {
    return {
      reply: "When sleep is difficult due to case hypervigilance:\n\n1. Try 10-minute Non-Sleep Deep Rest (NSDR) or progressive muscle relaxation.\n2. Write down racing worries in your private MindPulse journal to set them aside.\n3. Dim lights and let your shoulders drop.\n\nNSDR is a gentle relaxation practice, not a medical treatment.",
      isSafety: false,
      resources: ['Bedtime NSDR Relaxation', 'Reflection Journal'],
      followUpSuggestions: ['Start relaxation', 'Write in reflection journal'],
    };
  }

  // Counselor
  if (/\b(counselor|therapist|psychologist|talk to)\b/i.test(lower)) {
    return {
      reply: `You can connect with **${counselorName}** through the District Welfare Support Cell. They can assist with emotional debriefs, hearing accompaniment, and compensation applications.`,
      isSafety: false,
      resources: ['District Welfare Cell Touchpoint', 'Counselor Support'],
      followUpSuggestions: ['Request hearing accompaniment', 'Start daily check-in'],
    };
  }

  // Smalltalk / Casual Greetings
  if (/^how (are|r) (you|u)( doing)?\??$/i.test(lower)) {
    return {
      reply: "I'm doing well, thank you for asking! 😊 How are you feeling today?",
      isSafety: false,
      resources: ['Wellbeing Check-in', 'Grounding Exercises'],
      followUpSuggestions: ['I am feeling nervous.', 'Can you guide me through a 4-7-8 breathing exercise?', 'What can you do?'],
    };
  }

  if (/^(thank you|thanks|thx)\b/i.test(lower)) {
    const isShort = lower === 'thanks';
    return {
      reply: isShort ? "You're welcome! 😊" : "You're welcome! 😊 I'm here if you need anything else.",
      isSafety: false,
      resources: ['Wellbeing Check-in'],
      followUpSuggestions: ['Can you guide me through a 4-7-8 breathing exercise?', 'What is victim compensation?'],
    };
  }

  if (/^(bye|goodbye|take care|see you)\b/i.test(lower)) {
    return {
      reply: "Take care! 👋 You can come back whenever you need support.",
      isSafety: false,
      resources: ['Tele-MANAS 14416', 'Emergency 112'],
      followUpSuggestions: ['Check in tomorrow', 'Emergency 112'],
    };
  }

  if (/^what can you do\??$/i.test(lower)) {
    return {
      reply: "I can help with grounding exercises, breathing exercises, general wellbeing support, and information about available legal and support resources.",
      isSafety: false,
      resources: ['4-7-8 Breathing', 'Grounding Exercises', 'Legal Aid (15100)', 'Section 357A CrPC'],
      followUpSuggestions: ['Can you guide me through a 4-7-8 breathing exercise?', 'Give me a grounding exercise.', 'What is victim compensation?'],
    };
  }

  if (/^good (morning|afternoon|evening)\b/i.test(lower)) {
    const timeWord = lower.includes('morning') ? 'Good morning! ☀️' : lower.includes('afternoon') ? 'Good afternoon! ☀️' : 'Good evening! 🌙';
    return {
      reply: `${timeWord} How are you feeling today?`,
      isSafety: false,
      resources: ['Wellbeing Check-in', '4-7-8 Breathing'],
      followUpSuggestions: ["I'm nervous about my court hearing.", 'Can you guide me through a 4-7-8 breathing exercise?'],
    };
  }

  if (/^(hii|hi|hi there|hiiii)\b/i.test(lower)) {
    return {
      reply: "Hii! 👋 How can I help you today?",
      isSafety: false,
      resources: ['4-7-8 Breathing', 'Grounding Directory'],
      followUpSuggestions: ['Can you guide me through a 4-7-8 breathing exercise?', 'Give me a grounding exercise.', 'What is victim compensation?'],
    };
  }

  if (/^(hello|hello there)\b/i.test(lower)) {
    return {
      reply: "Hello! 👋 What would you like to talk about?",
      isSafety: false,
      resources: ['4-7-8 Breathing', 'Legal Aid Directory'],
      followUpSuggestions: ['Can you guide me through a 4-7-8 breathing exercise?', 'What is victim compensation?', 'How can I get free legal assistance?'],
    };
  }

  if (/^(hey|heyy|hey there|what's up|whats up)\b/i.test(lower)) {
    return {
      reply: "Hey! 👋 I'm here to help. What would you like to discuss?",
      isSafety: false,
      resources: ['4-7-8 Breathing', 'Grounding Directory'],
      followUpSuggestions: ['Can you guide me through a 4-7-8 breathing exercise?', 'What can you do?'],
    };
  }

  // Default General Info
  return {
    reply: "I am here to support you. You can ask me for a 4-7-8 breathing exercise, 5-4-3-2-1 sensory grounding, information on Section 357A victim compensation, free DLSA legal aid (15100), or connecting with your counselor. What would you like guidance on?",
    isSafety: false,
    resources: ['4-7-8 Breathing Guide', 'Legal Aid Directory', 'Compensation Guide'],
    followUpSuggestions: ['Guide me through 4-7-8 breathing', 'What is victim compensation?', 'How can I get free legal aid?'],
  };
}
