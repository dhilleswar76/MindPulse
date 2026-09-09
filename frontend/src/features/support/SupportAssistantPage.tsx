import React from 'react';
import { Bot, Shield } from 'lucide-react';
import { SupportChatPanel } from './SupportChatPanel';

export const SupportAssistantPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Bot className="w-7 h-7 text-teal-400" />
          Trauma-Informed Support Companion
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Non-clinical conversational companion for grounding exercises, legal journey orientation, and resource navigation.
        </p>
      </div>

      {/* Non-Diagnostic Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Non-Clinical Decision Support:</strong> Not an AI therapist or medical diagnostician. For immediate crisis support, contact KIRAN at 1800-599-0019 or emergency services at 112.
        </span>
      </div>

      {/* Reusable Support Chat Container */}
      <SupportChatPanel isFloating={false} />
    </div>
  );
};

