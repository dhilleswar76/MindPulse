import React, { useState } from 'react';
import { Bot, Shield, Sparkles, Wind, HeartHandshake, PhoneCall, HelpCircle, Lock } from 'lucide-react';
import { SupportChatPanel } from './SupportChatPanel';
import { PrivacyConsentModal } from '../auth/PrivacyConsentModal';

export const SupportAssistantPage: React.FC = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Private & Encrypted • Non-Clinical Decision Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bot className="w-7 h-7 text-teal-400" />
            <span>Trauma-Informed Support Companion</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            A calm, conversational space to practice grounding exercises, ask questions about your 6-stage case journey, or prepare for upcoming court hearings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPrivacyModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shrink-0 self-start sm:self-auto"
        >
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Privacy & Boundaries</span>
        </button>
      </div>

      {/* Safety & Non-Diagnostic Transparency Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5 text-xs text-slate-300 leading-relaxed shadow-sm">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <strong className="text-white block mb-0.5">
            Compassionate AI Assistant Notice:
          </strong>
          This companion is an AI-assisted supportive guide. It is not an AI therapist or medical diagnostician and cannot provide clinical prescriptions. If you feel unsafe or require crisis intervention, please contact the 24/7 KIRAN helpline at <strong>1800-599-0019</strong> or emergency services at <strong>112</strong> immediately.
        </div>
      </div>

      {/* Reusable Support Chat Container */}
      <SupportChatPanel isFloating={false} />

      {/* Quick Human Support Option */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <HeartHandshake className="w-4 h-4 text-teal-400" />
          <span>
            Would you prefer to talk with a human counselor? <strong>Dr. Sarah Jenkins</strong> is assigned to your case.
          </span>
        </div>
        <span className="text-[11px] text-teal-400 font-semibold">
          Touchpoint coordinated through District Welfare Cell
        </span>
      </div>

      {/* Privacy Modal */}
      <PrivacyConsentModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
