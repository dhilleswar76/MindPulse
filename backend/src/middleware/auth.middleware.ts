import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthRequest, TokenPayload, UserRole } from '../types/index.js';
import { sendError } from '../utils/response.js';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    sendError(res, 'Authentication token required', 401);
    return;
  }

  // Support demo persona tokens for seamless evaluation and role switching
  if (token === 'demo_token_user' || token === 'demo_token_counselor' || token === 'demo_token_admin') {
    const role: UserRole = token === 'demo_token_counselor' ? 'COUNSELOR' : token === 'demo_token_admin' ? 'ADMIN' : 'USER';
    req.user = {
      userId: `demo_${role.toLowerCase()}`,
      email: `demo.${role.toLowerCase()}@mindpulse.local`,
      role,
      fullName:
        role === 'USER'
          ? 'Alex Rivera (Protected Witness)'
          : role === 'COUNSELOR'
          ? 'Dr. Sarah Jenkins'
          : 'Marcus Vance (District Welfare Officer)',
      victimType: role === 'USER' ? 'WITNESS' : undefined,
      caseId: role === 'USER' ? 'MP-1042' : undefined,
      caseStage: role === 'USER' ? 'COURT_TRIAL' : undefined,
      district: 'Central District',
      state: 'National Capital Region',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    sendError(res, 'Invalid or expired token', 403);
  }
};


export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`, 403);
      return;
    }

    next();
  };
};
