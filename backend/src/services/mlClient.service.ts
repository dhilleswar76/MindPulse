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

const getMlHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.mlServiceApiKey) {
    headers['X-API-Key'] = config.mlServiceApiKey;
  }
  return headers;
};

export const mlClient = {
  predictRisk: async (userId: string, checkIns: any[]): Promise<MLRiskResponse | null> => {
    try {
      const response = await axios.post<MLRiskResponse>(
        `${config.mlServiceUrl}/predict-risk`,
        { userId, recentCheckIns: checkIns },
        {
          timeout: 5000,
          headers: getMlHeaders(),
        }
      );
      return response.data;
    } catch (err: any) {
      // Safe logging: log status/message without logging any sensitive checkin or personal payload
      logger.warn(`ML risk service call unavailable at ${config.mlServiceUrl}/predict-risk [${err.message}]. Preserving check-in record.`);
      return null;
    }
  },

  analyzeJournal: async (userId: string, text: string): Promise<MLJournalResponse | null> => {
    try {
      const response = await axios.post<MLJournalResponse>(
        `${config.mlServiceUrl}/analyze-journal`,
        { userId, text },
        {
          timeout: 5000,
          headers: getMlHeaders(),
        }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`ML journal service call unavailable [${err.message}]. Preserving journal entry.`);
      return null;
    }
  },

  forecastRisk: async (userId: string, checkIns: any[]): Promise<MLForecastResponse | null> => {
    try {
      const response = await axios.post<MLForecastResponse>(
        `${config.mlServiceUrl}/forecast-risk`,
        { userId, checkIns, forecastDays: 7 },
        {
          timeout: 5000,
          headers: getMlHeaders(),
        }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`ML forecast service call unavailable [${err.message}].`);
      return null;
    }
  },

  analyzeVoice: async (userId: string, audioMeta: { durationSec: number; sampleRate?: number }): Promise<any> => {
    try {
      const response = await axios.post(
        `${config.mlServiceUrl}/analyze-voice`,
        { userId, audioDurationSeconds: audioMeta.durationSec, sampleRate: audioMeta.sampleRate || 16000 },
        {
          timeout: 5000,
          headers: getMlHeaders(),
        }
      );
      return response.data;
    } catch (err: any) {
      logger.warn(`ML voice service call unavailable [${err.message}].`);
      return {
        userId,
        status: 'temporarily_unavailable',
        message: 'Voice biomarker screening service is temporarily unavailable.',
        disclaimer: 'Non-diagnostic early decision support. Does not constitute a clinical medical diagnosis.',
      };
    }
  },
};

