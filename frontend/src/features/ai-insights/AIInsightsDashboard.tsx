import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  FileCheck,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  analyzeCase,
  UnifiedAnalysisRequest,
  UnifiedAnalysisResponse,
  CheckInItem,
} from '../../services/mlApi';
import { RiskCard } from './components/RiskCard';
import { AnomalyCard } from './components/AnomalyCard';
import { TrendCard } from './components/TrendCard';
import { ForecastCard } from './components/ForecastCard';
import { ExplainabilityCard } from './components/ExplainabilityCard';
import { ContributingSignalsCard } from './components/ContributingSignalsCard';
import { DataQualityCard } from './components/DataQualityCard';
import { HumanReviewAlert } from './components/HumanReviewAlert';

interface AIInsightsDashboardProps {
  userId?: string;
  caseId?: string;
  caseStage?: string;
  initialCheckIns?: CheckInItem[];
  onTakeAction?: () => void;
  title?: string;
  subtitle?: string;
}

// Pre-built scenarios for comprehensive SIH evaluator testing of real ML outputs
const SCENARIOS = {
  CASE_CURRENT: {
    label: 'Case Telemetry',
    description: 'Current real case observations',
  },
  MULTI_DAY_DISTRESS: {
    label: 'High Distress & Anomaly (Multi-Day)',
    description: '5 consecutive check-ins with surge in court-related anxiety',
  },
  SINGLE_OBSERVATION: {
    label: 'Early Intake (Single Check-in)',
    description: '1 check-in demonstrating uncalibrated baseline priors',
  },
};

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({
  userId = 'user_alex_101',
  caseId = 'MP-1042',
  caseStage = 'COURT_TRIAL',
  initialCheckIns,
  onTakeAction,
  title = 'AI-POWERED CASE INSIGHTS',
  subtitle = 'Real-time distress prediction, anomaly screening, and trajectory forecasting powered by MindPulse ML Engine',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<
    'CASE_CURRENT' | 'MULTI_DAY_DISTRESS' | 'SINGLE_OBSERVATION'
  >('MULTI_DAY_DISTRESS');

  const [analysisData, setAnalysisData] =
    useState<UnifiedAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);

  // Build payload based on selected scenario
  const getPayloadForScenario = useCallback(
    (scenario: 'CASE_CURRENT' | 'MULTI_DAY_DISTRESS' | 'SINGLE_OBSERVATION'): UnifiedAnalysisRequest => {
      if (scenario === 'SINGLE_OBSERVATION') {
        return {
          userId,
          caseId,
          caseStage: 'INVESTIGATION',
          recentCheckIns: [
            {
              mood: 3.5,
              stress: 8.0,
              sleepHours: 4.5,
              anxiety: 7.5,
              senseOfSafety: 4.0,
              supportAvailability: 5.0,
              caseRelatedStress: 8.5,
              caseStage: 'INVESTIGATION',
              timestamp: new Date().toISOString(),
            },
          ],
          historicalBaseline: null,
          journalStressSignal: 0.75,
          voiceStressIndex: 0.68,
          forecastDays: 7,
        };
      }

      if (scenario === 'MULTI_DAY_DISTRESS') {
        return {
          userId,
          caseId,
          caseStage,
          recentCheckIns: [
            {
              mood: 7.0,
              stress: 3.5,
              sleepHours: 8.0,
              anxiety: 3.0,
              senseOfSafety: 8.0,
              supportAvailability: 8.0,
              caseRelatedStress: 3.0,
              timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
            },
            {
              mood: 6.0,
              stress: 4.5,
              sleepHours: 7.0,
              anxiety: 4.5,
              senseOfSafety: 7.0,
              supportAvailability: 7.0,
              caseRelatedStress: 4.5,
              timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
            },
            {
              mood: 5.0,
              stress: 6.5,
              sleepHours: 5.5,
              anxiety: 6.5,
              senseOfSafety: 5.5,
              supportAvailability: 6.0,
              caseRelatedStress: 7.0,
              timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
            {
              mood: 3.5,
              stress: 8.0,
              sleepHours: 4.5,
              anxiety: 8.0,
              senseOfSafety: 4.0,
              supportAvailability: 4.5,
              caseRelatedStress: 8.5,
              timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
            },
            {
              mood: 2.5,
              stress: 9.0,
              sleepHours: 3.5,
              anxiety: 9.0,
              senseOfSafety: 3.0,
              supportAvailability: 3.5,
              caseRelatedStress: 9.5,
              timestamp: new Date().toISOString(),
            },
          ],
          historicalBaseline: {
            mood: 7.0,
            stress: 3.5,
            sleepHours: 7.5,
            anxiety: 3.0,
            senseOfSafety: 8.0,
          },
          journalStressSignal: 0.85,
          voiceStressIndex: 0.82,
          forecastDays: 7,
        };
      }

      // CASE_CURRENT
      const checkInsToUse =
        initialCheckIns && initialCheckIns.length > 0
          ? initialCheckIns
          : [
              {
                mood: 3.0,
                stress: 8.5,
                sleepHours: 4.0,
                anxiety: 8.0,
                senseOfSafety: 4.0,
                supportAvailability: 6.0,
                caseRelatedStress: 9.0,
                caseStage,
                timestamp: new Date().toISOString(),
              },
            ];

      return {
        userId,
        caseId,
        caseStage,
        recentCheckIns: checkInsToUse,
        historicalBaseline: null,
        journalStressSignal: 0.7,
        voiceStressIndex: 0.65,
        forecastDays: 7,
      };
    },
    [userId, caseId, caseStage, initialCheckIns]
  );

  // Execute real ML request
  const runAnalysis = useCallback(
    async (scenario = selectedScenario) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = getPayloadForScenario(scenario);
        const response = await analyzeCase(payload);
        setAnalysisData(response);
        setLastAnalyzedAt(new Date().toLocaleTimeString());
      } catch (err: any) {
        setError(err.message || 'Failed to complete ML case analysis.');
      } finally {
        setIsLoading(false);
      }
    },
    [getPayloadForScenario, selectedScenario]
  );

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Case Info */}
      <div className="glass-card p-6 border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-teal-400 font-bold text-xs bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
              Case: {caseId}
            </span>
            <span className="font-mono text-indigo-300 font-bold text-xs bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
              Stage: {analysisData?.caseStage || caseStage}
            </span>
            <span className="text-slate-500 text-xs">
              Participant: {analysisData?.userId || userId}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Actions & Refresh */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {lastAnalyzedAt && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Last analyzed: {lastAnalyzedAt}</span>
            </span>
          )}

          <button
            onClick={() => runAnalysis()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Run AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector Pill Tabs (Allows 1-click test of GOOD vs INSUFFICIENT_DATA modes) */}
      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Evaluation Scenario:</span>
        </span>

        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SCENARIOS) as Array<keyof typeof SCENARIOS>).map(
            (scKey) => {
              const isSelected = selectedScenario === scKey;
              return (
                <button
                  key={scKey}
                  onClick={() => {
                    setSelectedScenario(scKey);
                    runAnalysis(scKey);
                  }}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={SCENARIOS[scKey].description}
                >
                  {SCENARIOS[scKey].label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 glass-card border border-slate-800 rounded-2xl text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-teal-400/20 border-t-teal-400 animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">
              Analyzing wellbeing data...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Calling ML service at http://localhost:8000/analyze to compute XGBoost risk score,
              isolation anomaly detection, longitudinal slopes, and SHAP TreeExplainer attributions.
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
            onClick={() => runAnalysis()}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-semibold mt-1 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Main Insights Content */}
      {!isLoading && analysisData && (
        <div className="space-y-6">
          {/* Human Review Alert Banner */}
          <HumanReviewAlert
            recommended={
              analysisData.humanReviewRecommended ||
              analysisData.risk?.human_review_recommended ||
              false
            }
            onTakeAction={onTakeAction}
          />

          {/* Core Row: Overall Risk & Anomaly Detection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <RiskCard risk={analysisData.risk} />
            </div>
            <div className="lg:col-span-6">
              <AnomalyCard
                anomaly={analysisData.anomaly}
                observationsUsed={analysisData.data_quality?.observations_used}
              />
            </div>
          </div>

          {/* Trend & Forecast Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <TrendCard trend={analysisData.trend} />
            </div>
            <div className="lg:col-span-6">
              <ForecastCard forecast={analysisData.forecast} />
            </div>
          </div>

          {/* Explainability: Top Factors (SHAP) */}
          <ExplainabilityCard
            topFactors={analysisData.explanation?.top_factors || []}
          />

          {/* Contributing Signals Grid */}
          <ContributingSignalsCard
            signals={analysisData.explanation?.contributing_signals || []}
          />

          {/* Data Quality & Limitations */}
          <DataQualityCard dataQuality={analysisData.data_quality} />

          {/* Mandatory Non-Diagnostic Policy Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 leading-relaxed">
            <Shield className="w-4 h-4 text-teal-400 inline mr-1.5 -mt-0.5" />
            <strong className="text-slate-300">Statutory Notice: </strong>
            {analysisData.disclaimer ||
              'MindPulse decision-support system provides non-diagnostic alerts to assist human professionals.'}
          </div>
        </div>
      )}
    </div>
  );
};
