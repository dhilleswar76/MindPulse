import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Shield, Sparkles, Wind, BookOpen, HeartHandshake, PhoneCall, X, Minus } from 'lucide-react';
import api from '../../services/api';

export interface SupportChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  isSafety?: boolean;
  resources?: string[];
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
  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your **MindPulse Trauma-Informed Support Companion**.\n\nI can assist you with:\n• Grounding and breathing exercises (e.g., 4-7-8 somatic regulation before hearings)\n• Reflective journaling prompts for processing case-related tension\n• Explaining the 6-stage legal & rehabilitation journey\n• Connecting with DLSA Legal Aid and Victim Compensation contacts\n\nHow can I support your wellbeing today?",
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

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userText, timestamp: timeStr }]);
    setInput('');
    setIsTyping(true);

    try {
      const res: any = await api.post('/users/support-chat', { message: userText });
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data?.reply || 'I am here to support your daily wellness routines and case journey orientation.',
          isSafety: res.data?.isSafetyIntervention,
          resources: res.data?.resourcesSuggested,
          timestamp: replyTime,
        },
      ]);
    } catch {
      // Local fallback support response
      const fallbackTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "Thank you for sharing. Remember to pace yourself, drink some water, and take 3 deep belly breaths. Let's explore grounding exercises or connecting with your assigned counselor Dr. Sarah Jenkins.",
          timestamp: fallbackTime,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${
        isFloating
          ? 'w-full h-full'
          : 'h-[540px]'
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
                Available
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Non-Diagnostic Decision Support • Confidential</p>
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

              {m.resources && m.resources.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {m.resources.map((res, rIdx) => (
                    <span
                      key={rIdx}
                      className="bg-slate-900 text-teal-300 text-[10px] px-2 py-0.5 rounded border border-teal-500/20"
                    >
                      {res}
                    </span>
                  ))}
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
      <div className="px-3 py-1.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
        <button
          type="button"
          onClick={() => handleQuickPrompt("I have an upcoming court hearing and feeling nervous. Can you guide me through a 4-7-8 breathing exercise?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1 transition-colors"
        >
          <Wind className="w-3 h-3 text-teal-400" />
          <span>Hearing Grounding</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("What are the steps for victim compensation under Section 357A CrPC?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1 transition-colors"
        >
          <BookOpen className="w-3 h-3 text-indigo-400" />
          <span>Compensation Info</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("How can I request safe transit and witness protection with DLSA?")}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Witness Safe Transit</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about grounding, legal stages, or support..."
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
