import { checkinService } from '../checkins/checkins.service.js';
import { mlClient } from '../../services/mlClient.service.js';

export const forecastingService = {
  get7DayForecast: async (userId: string) => {
    const checkins = await checkinService.getUserCheckIns(userId, 14);
    return mlClient.forecastRisk(userId, checkins);
  },
};
