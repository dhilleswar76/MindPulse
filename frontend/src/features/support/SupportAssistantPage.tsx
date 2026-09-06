import React, { useState } from 'react';
import { Bot, Send, Shield, Sparkles, Wind, BookOpen, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isSafety?: boolean;
  resources?: string[];
}

export const SupportAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I'm your **MindPulse Support Assistant**.\n\nI can help you with:\n• Grounding and breathing exercises (e.g. 4-7-8 method)\n• Reflective journaling prompts for academic stress\n• Sleep routine optimization\n• Finding campus peer & counseling resources\n\nHow can I support your wellness today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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
          text: res.data?.reply || 'I am here to support your daily wellness routines.',
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
          text: "Thank you for sharing. Remember to pace yourself, drink some water, and take 3 deep belly breaths. Let's explore grounding exercises or journaling prompts.",
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Bot className="w-7 h-7 text-teal-400" />
          MindPulse Support Assistant
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Non-clinical conversational companion for grounding exercises, wellness prompts, and resource navigation.
        </p>
      </div>

      {/* Non-Diagnostic Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Non-Clinical Assistant:</strong> Not an AI Therapist or medical diagnostician. For clinical emergencies, dial 988.
        </span>
      </div>

      {/* Chat Container */}
      <div className="glass-card border border-slate-800 flex flex-col h-[520px]">
        {/* Messages scroll area */}
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
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-glass'
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
              <span>MindPulse Assistant is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => handleQuickPrompt("I'm feeling anxious about my exam tomorrow. Can you guide me through a breathing exercise?")}
            className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 flex items-center gap-1.5"
          >
            <Wind className="w-3 h-3 text-teal-400" />
            Breathing Exercise
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Give me a journaling prompt to help with stress.")}
            className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            Journaling Prompt
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("What are the best habits to recover from a sleep deficit?")}
            className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full shrink-0 border border-slate-700/60 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Sleep Tips
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or question about wellness, grounding, or study stress..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-xl disabled:opacity-40 transition-opacity shadow-lg shadow-teal-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
