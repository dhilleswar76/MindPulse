import React from 'react';
import { Shield, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AIInsightsDashboard } from '../ai-insights/AIInsightsDashboard';

export const RiskAssessmentPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Understanding Your Wellbeing Signals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time, transparent indicators explaining what has contributed to recent shifts in your wellbeing.
          </p>
        </div>

        <Link
          to="/support"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow transition-colors self-start sm:self-auto"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Connect With Support</span>
        </Link>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 block mb-0.5">Non-Diagnostic Decision Support</strong>
          MindPulse analyzes patterns from your self-reported check-ins, sleep, and tension. It does not provide clinical diagnoses or psychiatric labels—it highlights early cues so your support team can offer timely assistance.
        </div>
      </div>

      {/* Real ML Service AI-Powered Case Insights Dashboard */}
      <AIInsightsDashboard
        userId="user_alex_101"
        caseId="MP-1042"
        caseStage="COURT_TRIAL"
        title="AI-POWERED CASE INSIGHTS"
        subtitle="Live inferences from MindPulse ML Service (http://localhost:8000/analyze)"
      />
    </div>
  );
};
