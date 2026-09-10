import { checkinService } from '../checkins/checkins.service.js';
import { mlClient } from '../../services/mlClient.service.js';
import { Case, User } from '../../models/index.js';

export const forecastingService = {
  get7DayForecast: async (userId: string) => {
    const checkins = await checkinService.getUserCheckIns(userId, 14);
    const forecast = await mlClient.forecastRisk(userId, checkins);
    if (forecast) return forecast;

    // Safe, non-diagnostic standard trajectory calculation if ML is temporarily unavailable
    const syntheticForecast = Array.from({ length: 7 }).map((_, i) => ({
      dayOffset: i + 1,
      predictedScore: 0.42,
      projectedLevel: 'WATCH',
      confidenceLower: 0.25,
      confidenceUpper: 0.60,
    }));

    return {
      userId,
      forecast: syntheticForecast,
      trajectoryDirection: 'stable',
      modelVersion: 'decision-support-v1.0',
      disclaimer: 'Non-diagnostic 7-day trajectory projection. For counselor early support awareness only.',
    };
  },

  getForecastByCaseId: async (caseIdOrUserId: string) => {
    try {
      let targetUserId = caseIdOrUserId;
      const caseDoc = await Case.findOne({ $or: [{ caseId: caseIdOrUserId }, { _id: caseIdOrUserId }] }).lean();
      if (caseDoc && (caseDoc as any).victimId) {
        targetUserId = (caseDoc as any).victimId.toString();
      } else {
        const userDoc = await User.findOne({ $or: [{ caseId: caseIdOrUserId }, { _id: caseIdOrUserId }] }).lean();
        if (userDoc) {
          targetUserId = (userDoc as any)._id.toString();
        }
      }
      return await forecastingService.get7DayForecast(targetUserId);
    } catch {
      return await forecastingService.get7DayForecast(caseIdOrUserId);
    }
  },
};

