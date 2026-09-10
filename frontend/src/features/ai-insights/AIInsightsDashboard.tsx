import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  PlusCircle,
  History,
  RotateCcw,
} from 'lucide-react';
import {
  analyzeCase,
  UnifiedAnalysisRequest,
  UnifiedAnalysisResponse,
  CheckInItem,
} from '../../services/mlApi';
import {
  getStoredCheckIns,
  storeCheckIns,
  resetCheckInHistory,
  subscribeCheckInUpdates,
} from '../../services/checkinHistory';
import { RiskCard } from './components/RiskCard';
import { AnomalyCard } from './components/AnomalyCard';
import { TrendCard } from './components/TrendCard';
import { ForecastCard } from './components/ForecastCard';
import { ExplainabilityCard } from './components/ExplainabilityCard';
import { ContributingSignalsCard } from './components/ContributingSignalsCard';
import { DataQualityCard } from './components/DataQualityCard';
import { HumanReviewAlert } from './components/HumanReviewAlert';
import { SubmitCheckInModal } from './components/SubmitCheckInModal';

interface AIInsightsDashboardProps {
  userId?: string;
  caseId?: string;
  caseStage?: string;
  initialCheckIns?: CheckInItem[];
  onTakeAction?: () => void;
  title?: string;
  subtitle?: string;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  userId = 'user_alex_101',
  caseId = 'MP-1042',
  caseStage = 'COURT_TRIAL',
  initialCheckIns,
  onTakeAction,
  title = 'AI-POWERED CASE INSIGHTS',
  subtitle = 'Real-time distress prediction, anomaly screening, and trajectory forecasting powered by MindPulse ML Engine',
}) => {
  // Check-in history state
  const [checkIns, setCheckIns] = useState<CheckInItem[]>(() => {
    if (initialCheckIns && initialCheckIns.length > 0) {
      return initialCheckIns;
    }
    return getStoredCheckIns(userId);
  });

  // Dedicated AI response state
  const [aiAnalysis, setAiAnalysis] = useState<UnifiedAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Baseline calibration parameters
  const historicalBaseline = {
    mood: 7.0,
    stress: 3.5,
    sleepHours: 7.5,
    anxiety: 3.0,
    senseOfSafety: 8.0,
  };

  /**
   * Executes /analyze with the provided check-in history.
   */
  const executeAnalysis = useCallback(
    async (historyToAnalyze: CheckInItem[]) => {
      setIsLoading(true);
      setError(null);
      // Ensure old cached result is cleared while new analysis runs
      setAiAnalysis(null);

      const payload: UnifiedAnalysisRequest = {
        userId,
        caseId,
        caseStage,
        recentCheckIns: historyToAnalyze,
        historicalBaseline: historyToAnalyze.length > 1 ? historicalBaseline : null,
        journalStressSignal: historyToAnalyze.length > 1 ? 0.85 : 0.7,
        voiceStressIndex: historyToAnalyze.length > 1 ? 0.82 : 0.65,
        forecastDays: 7,
      };

      console.log('ANALYZE REQUEST:', payload);

      try {
        const response = await analyzeCase(payload);
        console.log('NEW ML RESPONSE:', response);
        setAiAnalysis(response);
        setLastAnalyzedAt(new Date().toLocaleTimeString());
      } catch (err: any) {
        setError(err.message || 'Failed to complete ML case analysis.');
      } finally {
        setIsLoading(false);
      }
    },
    [userId, caseId, caseStage]
  );

  // Initial analysis on mount
  useEffect(() => {
    executeAnalysis(checkIns);
  }, []);

  // Listen for check-in updates from other pages (e.g. CheckinPage)
  useEffect(() => {
    const unsubscribe = subscribeCheckInUpdates((updatedList) => {
      console.log('CHECK-IN UPDATE DETECTED VIA EVENT:', updatedList);
      setCheckIns(updatedList);
      executeAnalysis(updatedList);
    }, userId);

    return unsubscribe;
  }, [executeAnalysis, userId]);

  /**
   * REQUIRED FLOW: Handles submission of a new check-in
   */
  const handleNewCheckIn = async (newCheckIn: CheckInItem) => {
    // 1. Log captured check-in
    console.log('NEW CHECK-IN:', newCheckIn);

    // 2. CRITICAL: Compute updatedCheckIns synchronously before updating state
    const updatedCheckIns = [...checkIns, newCheckIn];
    console.log('UPDATED HISTORY:', updatedCheckIns);

    // 3. Immediately update the recentCheckIns state and persist
    setCheckIns(updatedCheckIns);
    storeCheckIns(updatedCheckIns, userId);

    // 4. Close modal and execute /analyze with the UPDATED history
    setIsCheckInModalOpen(false);
    await executeAnalysis(updatedCheckIns);
  };

  /**
   * Resets check-in history to initial 4 observations
   */
  const handleResetHistory = () => {
    const reset = resetCheckInHistory(userId);
    setCheckIns(reset);
    executeAnalysis(reset);
  };

  /**
   * Quick toggle to test single-observation (INSUFFICIENT_DATA) mode
   */
  const handleSingleCheckInTest = () => {
    const single: CheckInItem[] = [
      {
        mood: 3.5,
        stress: 8.5,
        energy: 4.0,
        sleepHours: 4.5,
        anxiety: 8.0,
        senseOfSafety: 4.0,
        supportAvailability: 5.0,
        caseRelatedStress: 9.0,
        caseStage: 'INVESTIGATION',
        timestamp: new Date().toISOString(),
      },
    ];
    setCheckIns(single);
    storeCheckIns(single, userId);
    executeAnalysis(single);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Case Info */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-teal-400 font-bold text-xs bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
              Case: {caseId}
            </span>
            <span className="font-mono text-indigo-300 font-bold text-xs bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              Stage: {aiAnalysis?.caseStage || caseStage}
            </span>
            <span className="text-slate-500 text-xs">
              Participant: {aiAnalysis?.userId || userId}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {lastAnalyzedAt && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mr-2">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Analyzed: {lastAnalyzedAt}</span>
            </span>
          )}

          {/* New Check-In Button */}
          <button
            onClick={() => setIsCheckInModalOpen(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Check-In</span>
          </button>

          {/* Re-Analyze Button */}
          <button
            onClick={() => executeAnalysis(checkIns)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Run AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* History Telemetry Status Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <History className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Active History: <strong className="text-white">{checkIns.length}</strong> longitudinal observation(s)
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-[11px]">
            Latest: Mood {checkIns[checkIns.length - 1]?.mood || 3}/10, Stress {checkIns[checkIns.length - 1]?.stress || 8}/10
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSingleCheckInTest}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
            title="Test uncalibrated baseline (1 check-in)"
          >
            Test 1 Check-In Mode
          </button>

          <button
            onClick={handleResetHistory}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors flex items-center gap-1"
            title="Reset history to standard 4 check-ins"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset History</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 glass-card border border-teal-500/30 bg-teal-950/10 rounded-2xl text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-teal-400/20 border-t-teal-400 animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">
              Updating AI analysis...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Sending updated check-in history to http://localhost:8000/analyze to re-compute XGBoost risk,
              Isolation Forest anomalies, longitudinal slopes, and SHAP attributions.
            </p>
          </div>
        </div>
      )}

      {/* Error Message Banner */}
      {error && !isLoading && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Analysis Request Failed</span>
          </div>
          <p className="leading-relaxed">{error}</p>
          <button
            onClick={() => executeAnalysis(checkIns)}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-semibold mt-1 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Main Insights Content — Rendered ONLY when aiAnalysis is available */}
      {!isLoading && aiAnalysis && (
        <div className="space-y-6">
          {/* Human Review Alert Banner */}
          <HumanReviewAlert
            recommended={
              aiAnalysis.humanReviewRecommended ||
              aiAnalysis.risk?.human_review_recommended ||
              false
            }
            onTakeAction={onTakeAction}
          />

          {/* Core Row: Overall Risk & Anomaly Detection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <RiskCard risk={aiAnalysis.risk} />
            </div>
            <div className="lg:col-span-6">
              <AnomalyCard
                anomaly={aiAnalysis.anomaly}
                observationsUsed={aiAnalysis.data_quality?.observations_used}
              />
            </div>
          </div>

          {/* Trend & Forecast Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <TrendCard trend={aiAnalysis.trend} />
            </div>
            <div className="lg:col-span-6">
              <ForecastCard forecast={aiAnalysis.forecast} />
            </div>
          </div>

          {/* Explainability: Top Factors (SHAP) */}
          <ExplainabilityCard
            topFactors={aiAnalysis.explanation?.top_factors || []}
          />

          {/* Contributing Signals Grid */}
          <ContributingSignalsCard
            signals={aiAnalysis.explanation?.contributing_signals || []}
          />

          {/* Data Quality & Limitations */}
          <DataQualityCard dataQuality={aiAnalysis.data_quality} />

          {/* Mandatory Non-Diagnostic Policy Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 leading-relaxed">
            <Shield className="w-4 h-4 text-teal-400 inline mr-1.5 -mt-0.5" />
            <strong className="text-slate-300">Statutory Notice: </strong>
            {aiAnalysis.disclaimer ||
              'MindPulse decision-support system provides non-diagnostic alerts to assist human professionals.'}
          </div>
        </div>
      )}

      {/* Interactive Check-In Modal */}
      <SubmitCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onSubmit={handleNewCheckIn}
        isSubmitting={isLoading}
        currentStage={aiAnalysis?.caseStage || caseStage}
      />
    </div>
  );
};
