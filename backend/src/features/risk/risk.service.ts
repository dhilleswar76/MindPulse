import { RiskScore } from '../../models/index.js';
import { checkinService } from '../checkins/checkins.service.js';
import { mlClient } from '../../services/mlClient.service.js';

export const riskService = {
  getCurrentRisk: async (userId: string) => {
    try {
      const latest = await RiskScore.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
      if (latest) return latest;
    } catch {}

    // Compute live from checkins
    const checkins = await checkinService.getUserCheckIns(userId, 14);
    const prediction = await mlClient.predictRisk(userId, checkins);
    return {
      userId,
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      factors: prediction.factors,
      modelVersion: prediction.modelVersion,
      calculatedAt: new Date(),
    };
  },

  getRiskHistory: async (userId: string) => {
    try {
      const scores = await RiskScore.find({ userId }).sort({ calculatedAt: -1 }).limit(10).lean();
      if (scores && scores.length > 0) return scores;
    } catch {}

    // Synthetic fallback
    return [
      {
        riskScore: 0.58,
        riskLevel: 'ELEVATED',
        factors: [{ feature: 'Sleep Reduction', impact: 0.22 }, { feature: 'Elevated Stress', impact: 0.18 }],
        calculatedAt: new Date(),
      },
      {
        riskScore: 0.42,
        riskLevel: 'WATCH',
        factors: [{ feature: 'Sleep Reduction', impact: 0.15 }],
        calculatedAt: new Date(Date.now() - 86400000),
      },
      {
        riskScore: 0.25,
        riskLevel: 'STABLE',
        factors: [{ feature: 'Stable Baseline', impact: 0.05 }],
        calculatedAt: new Date(Date.now() - 172800000),
      },
    ];
  },
};
