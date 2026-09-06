import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IRiskFactorItem, RiskLevel } from '../types/index.js';

export interface MLRiskResponse {
  riskScore: number;
  riskLevel: RiskLevel;
  modelVersion: string;
  factors: IRiskFactorItem[];
  disclaimer: string;
}

export interface MLJournalResponse {
  sentiment: 'positive' | 'neutral' | 'negative';
  stressSignal: number;
  emotionSignals: string[];
  modelVersion: string;
}

export interface MLForecastResponse {
  userId: string;
  forecast: Array<{
    dayOffset: number;
    predictedScore: number;
    projectedLevel: string;
    confidenceLower: number;
    confidenceUpper: number;
  }>;
  trajectoryDirection: string;
  modelVersion: string;
}

export const mlClient = {
  predictRisk: async (userId: string, checkIns: any[]): Promise<MLRiskResponse> => {
    try {
      const response = await axios.post<MLRiskResponse>(
        `${config.mlServiceUrl}/predict-risk`,
        { userId, recentCheckIns: checkIns },
        { timeout: 3000 }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`ML service call failed (${config.mlServiceUrl}/predict-risk). Using deterministic fallback:`, err.message);
      
      // Safe fallback calculation
      const avgStress = checkIns.length ? checkIns.reduce((acc, c) => acc + (c.stress || 5), 0) / checkIns.length : 5;
      const avgSleep = checkIns.length ? checkIns.reduce((acc, c) => acc + (c.sleepHours || 7), 0) / checkIns.length : 7;
      const avgMood = checkIns.length ? checkIns.reduce((acc, c) => acc + (c.mood || 7), 0) / checkIns.length : 7;

      const score = Math.min(1.0, Math.max(0.0, (avgStress * 0.35 + (8 - Math.min(8, avgSleep)) * 2.5 + (10 - avgMood) * 2.5) / 10));
      const roundedScore = Math.round(score * 100) / 100;

      let level: RiskLevel = 'STABLE';
      if (roundedScore >= 0.75) level = 'REQUIRES_REVIEW';
      else if (roundedScore >= 0.55) level = 'ELEVATED';
      else if (roundedScore >= 0.30) level = 'WATCH';

      return {
        riskScore: roundedScore,
        riskLevel: level,
        modelVersion: 'fallback-v1.0',
        factors: [
          { feature: 'Elevated Stress', impact: 0.22, description: `Average reported stress: ${avgStress}/10` },
          { feature: 'Sleep Deficit', impact: 0.18, description: `Average sleep: ${avgSleep} hours` },
        ],
        disclaimer: 'Non-diagnostic decision-support fallback calculation.',
      };
    }
  },

  analyzeJournal: async (userId: string, text: string): Promise<MLJournalResponse> => {
    try {
      const response = await axios.post<MLJournalResponse>(
        `${config.mlServiceUrl}/analyze-journal`,
        { userId, text },
        { timeout: 3000 }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`ML service call failed (${config.mlServiceUrl}/analyze-journal). Using deterministic fallback:`, err.message);
      const isStress = /stress|overwhelm|tired|anxious|fail/i.test(text);
      const isPositive = /happy|grateful|good|calm|refreshed/i.test(text);
      return {
        sentiment: isStress ? 'negative' : (isPositive ? 'positive' : 'neutral'),
        stressSignal: isStress ? 0.65 : 0.25,
        emotionSignals: isStress ? ['fatigue', 'anxiety'] : ['reflective'],
        modelVersion: 'fallback-v1.0',
      };
    }
  },

  forecastRisk: async (userId: string, checkIns: any[]): Promise<MLForecastResponse> => {
    try {
      const response = await axios.post<MLForecastResponse>(
        `${config.mlServiceUrl}/forecast-risk`,
        { userId, checkIns, forecastDays: 7 },
        { timeout: 3000 }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`ML service forecast call failed. Using fallback:`, err.message);
      const forecast = Array.from({ length: 7 }).map((_, i) => ({
        dayOffset: i + 1,
        predictedScore: Math.round((0.35 + i * 0.02) * 100) / 100,
        projectedLevel: i > 4 ? 'ELEVATED' : 'WATCH',
        confidenceLower: 0.25,
        confidenceUpper: 0.55,
      }));
      return {
        userId,
        forecast,
        trajectoryDirection: 'escalating',
        modelVersion: 'fallback-v1.0',
      };
    }
  },
};
