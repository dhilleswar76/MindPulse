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

  // Support demo persona tokens for seamless prototype, test & evaluation
  if (token.startsWith('demo_token')) {
    const roleStr = token.replace('demo_token_', '').toUpperCase();
    const role: UserRole = roleStr === 'COUNSELOR' ? 'COUNSELOR' : roleStr === 'ADMIN' ? 'ADMIN' : 'USER';
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

export const optionalAuthenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    if (token.startsWith('demo_token')) {
      const roleStr = token.replace('demo_token_', '').toUpperCase();
      const role: UserRole = roleStr === 'COUNSELOR' ? 'COUNSELOR' : roleStr === 'ADMIN' ? 'ADMIN' : 'USER';
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
      return next();
    } catch {}
  }

  // Default anonymous/protected fallback user context for safe non-clinical companion queries
  req.user = {
    userId: 'demo_user',
    email: 'demo.user@mindpulse.local',
    role: 'USER',
    fullName: 'Alex Rivera (Protected Witness)',
    victimType: 'WITNESS',
    caseId: 'MP-1042',
    caseStage: 'COURT_TRIAL',
    district: 'Central District',
    state: 'National Capital Region',
  };
  next();
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
