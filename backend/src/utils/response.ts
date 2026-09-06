import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res: Response, error: string, statusCode = 400, details?: any): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  });
};
