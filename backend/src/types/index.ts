import { Request } from 'express';

export type UserRole = 'USER' | 'COUNSELOR' | 'ADMIN';

export type VictimType = 'VICTIM' | 'WITNESS' | 'FAMILY_MEMBER' | 'COMPLAINANT' | 'OTHER_AFFECTED_PERSON';

export type CaseStage =
  | 'CASE_REGISTRATION'
  | 'INVESTIGATION'
  | 'COURT_TRIAL'
  | 'COMPENSATION'
  | 'REHABILITATION'
  | 'PROTECTION_SUPPORT'
  | 'CLOSED';

export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'SUPPORT_IN_PROGRESS' | 'CLOSED';

export type SupportType =
  | 'COUNSELLING'
  | 'PROFESSIONAL_REFERRAL'
  | 'LEGAL_AID'
  | 'PROTECTION_SUPPORT'
  | 'RELOCATION_SUPPORT'
  | 'FINANCIAL_ASSISTANCE'
  | 'REHABILITATION_SUPPORT'
  | 'OTHER';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  victimType?: VictimType;
  caseId?: string;
  caseStage?: CaseStage;
  district?: string;
  state?: string;
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

export type StageVerificationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'COMPLETED'
  | 'REOPENED';

export type StageTransitionRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUIRED';

export interface IStageHistoryItem {
  stage: CaseStage;
  status: StageVerificationStatus;
  enteredAt?: Date;
  completedAt?: Date;
  requestedAt?: Date;
  requestedBy?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
  evidenceReference?: string;
  notes?: string;
  reopenReason?: string;
  date?: string;
}

export interface IPendingStageTransition {
  requestId?: string;
  requestedStage: CaseStage;
  requestedAt: Date;
  status: 'PENDING' | 'CLARIFICATION_REQUIRED';
}

