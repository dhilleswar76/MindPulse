import axios from 'axios';

/**
 * MindPulse ML Microservice API Client
 * Connects directly to the real FastAPI ML microservice on port 8000.
 */

const ML_BASE_URL =
  import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

export interface CheckInItem {
  mood: number;
  stress: number;
  energy?: number;
  sleepHours?: number;
  sleep?: number;
  anxiety?: number;
  senseOfSafety?: number;
  supportAvailability?: number;
  social_connection?: number;
  caseRelatedStress?: number;
  wellbeing_score?: number;
  caseStage?: string;
  timestamp?: string;
  optionalNote?: string;
  journalStressSignal?: number;
  journalSentiment?: string;
  voiceStressIndex?: number;
}

export interface UnifiedAnalysisRequest {
  userId: string;
  caseId?: string;
  caseStage?: string;
  recentCheckIns: CheckInItem[];
  historicalBaseline?: Record<string, any> | null;
  journalStressSignal?: number | null;
  voiceStressIndex?: number | null;
  forecastDays?: number;
}

export interface RiskResult {
  risk_score?: number;
  riskScore: number;
  risk_level?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  riskLevel: 'STABLE' | 'WATCH' | 'ELEVATED' | 'REQUIRES_REVIEW' | string;
  confidence: number;
  direction: string;
  human_review_recommended?: boolean;
  trend?: string;
}

export interface AnomalyResult {
  is_anomaly: boolean;
  isAnomaly?: boolean;
  anomaly_score: number;
  anomalyScore?: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  affected_features: string[];
  explanation: string[];
}

export interface TrendResult {
  direction: 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'WORSENING' | 'VOLATILE' | 'INSUFFICIENT_DATA' | string;
  recent_moving_average: Record<string, number>;
  historical_moving_average: Record<string, number>;
  slopes: Record<string, number>;
  consecutive_deterioration_count: number;
  volatility_index: number;
  explanation: string[];
}

export interface ForecastPoint {
  dayOffset: number;
  predictedScore: number;
  projectedLevel: string;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface ForecastResult {
  forecast_available: boolean;
  reason?: string | null;
  trajectory: string;
  forecast_points: ForecastPoint[];
}

export interface TopFactor {
  feature: string;
  impact: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  direction: 'POSITIVE' | 'NEGATIVE' | 'STABLE' | string;
  value?: number | null;
  baseline?: number | null;
  reason?: string | null;
  impactScore: number;
}

export interface ContributingSignal {
  feature: string;
  direction: 'increased' | 'decreased' | 'elevated' | 'declined' | 'stable' | string;
  impact: number;
  description?: string | null;
  baselineComparison?: string | null;
}

export interface ExplanationResult {
  top_factors: TopFactor[];
  contributing_signals: ContributingSignal[];
  baseline_status?: string;
}

export interface DataQualityResult {
  quality_level: 'INSUFFICIENT' | 'LIMITED' | 'FAIR' | 'GOOD' | string;
  confidence: number;
  observations_used: number;
  limitations: string[];
}

export interface UnifiedAnalysisResponse {
  userId: string;
  caseStage?: string;
  risk: RiskResult;
  anomaly: AnomalyResult;
  trend: TrendResult;
  forecast: ForecastResult;
  explanation: ExplanationResult;
  data_quality: DataQualityResult;
  modelVersion: string;
  humanReviewRecommended: boolean;
  disclaimer: string;
}

/**
 * Calls the real FastAPI ML /analyze endpoint.
 * Throws structured, counselor-friendly errors without leaking internal stack traces.
 */
export async function analyzeCase(
  payload: UnifiedAnalysisRequest
): Promise<UnifiedAnalysisResponse> {
  try {
    const res = await axios.post<UnifiedAnalysisResponse>(
      `${ML_BASE_URL}/analyze`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      }
    );
    return res.data;
  } catch (err: any) {
    if (err.response) {
      const status = err.response.status;
      if (status === 422) {
        throw new Error(
          'Input validation error: The check-in telemetry submitted could not be processed by the ML engine. Please verify the metric format.'
        );
      }
      if (status === 500) {
        throw new Error(
          'ML Service Error: The predictive risk engine encountered an issue while generating inferences. Please try re-analyzing in a moment.'
        );
      }
      throw new Error(
        `ML Analysis request failed with status code ${status}. (${err.response.data?.detail || 'Unknown error'})`
      );
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error(
        'ML Service Timeout: The analysis took longer than 15 seconds to respond. Please check if the ML microservice on port 8000 is running.'
      );
    }
    throw new Error(
      'ML Service Unavailable: Unable to connect to the MindPulse ML engine at http://localhost:8000. Please ensure the Python FastAPI microservice is running.'
    );
  }
}
