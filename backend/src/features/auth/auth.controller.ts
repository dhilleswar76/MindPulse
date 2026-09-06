import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (err: any) {
      return sendError(res, err.message, 401);
    }
  },

  getCurrentUser: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    return sendSuccess(res, { user: req.user });
  },
};
