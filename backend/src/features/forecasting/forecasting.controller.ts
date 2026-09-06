import { Response } from 'express';
import { forecastingService } from './forecasting.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const forecastingController = {
  getForecast: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const forecast = await forecastingService.get7DayForecast(userId);
      return sendSuccess(res, forecast);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
