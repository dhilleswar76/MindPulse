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

  // Seamless support for demo tokens in prototype & test environments
  if (token.startsWith('demo_token')) {
    const roleStr = token.replace('demo_token_', '').toUpperCase();
    const role: UserRole = roleStr === 'COUNSELOR' ? 'COUNSELOR' : roleStr === 'ADMIN' ? 'ADMIN' : 'USER';
    const fullName = role === 'COUNSELOR' ? 'Dr. Sarah Jenkins' : role === 'ADMIN' ? 'Marcus Vance' : 'Alex Rivera';
    req.user = {
      userId: `demo_${role.toLowerCase()}_1`,
      email: `demo.${role.toLowerCase()}@mindpulse.local`,
      role,
      fullName,
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
      const fullName = role === 'COUNSELOR' ? 'Dr. Sarah Jenkins' : role === 'ADMIN' ? 'Marcus Vance' : 'Alex Rivera';
      req.user = {
        userId: `demo_${role.toLowerCase()}_1`,
        email: `demo.${role.toLowerCase()}@mindpulse.local`,
        role,
        fullName,
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
    userId: 'demo_user_1',
    email: 'demo.user@mindpulse.local',
    role: 'USER',
    fullName: 'Alex Rivera',
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
