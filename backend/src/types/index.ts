import { Request } from 'express';

export type UserRole = 'USER' | 'COUNSELOR' | 'ADMIN';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export type RiskLevel = 'STABLE' | 'WATCH' | 'ELEVATED' | 'REQUIRES_REVIEW';

export interface IRiskFactorItem {
  feature: string;
  impact: number;
  direction?: 'increase' | 'decrease';
  description?: string;
}
