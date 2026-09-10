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
  | 'CHECK_IN_CHAT'
  | 'OTHER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  victimType?: VictimType;
  caseId?: string;
  caseStage?: CaseStage;
  district?: string;
  state?: string;
  supportStatus?: string;
  consentStatus?: boolean;
  assignedCounselor?: string;
  department?: string;
  yearOfStudy?: number;
}

export type RiskLevel = 'STABLE' | 'WATCH' | 'ELEVATED' | 'REQUIRES_REVIEW';

export interface RiskFactor {
  feature: string;
  impact: number;
  direction?: 'increase' | 'decrease';
  description?: string;
}

export interface RiskScoreData {
  riskScore: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  modelVersion: string;
  calculatedAt?: string;
  caseStageContext?: string;
  humanReviewRecommended?: boolean;
}

export interface CheckIn {
  _id?: string;
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
  senseOfSafety?: number;
  supportAvailability?: number;
  caseRelatedStress?: number;
  caseStage?: CaseStage;
  optionalNote?: string;
  timestamp: string | Date;
}

export interface JournalEntry {
  _id?: string;
  title: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  stressSignal: number;
  emotionSignals: string[];
  signals?: {
    stress?: number;
    fear?: number;
    sleep_concern?: number;
    case_tension?: number;
    support_seeking?: number;
  };
  signalSummary?: string;
  moodContext?: string;
  isPrivate: boolean;
  createdAt: string | Date;
}

export interface Recommendation {
  _id: string;
  title: string;
  category:
    | 'BREATHING'
    | 'SLEEP'
    | 'MINDFULNESS'
    | 'LEGAL_AID'
    | 'VICTIM_COMPENSATION'
    | 'WITNESS_PROTECTION'
    | 'COUNSELING_PATHWAY'
    | 'DISTRICT_WELFARE'
    | 'CRISIS_CONTACT';
  description: string;
  durationMinutes?: number;
  actionUrl?: string;
  targetRiskLevels: string[];
  isNonClinical: boolean;
}

export interface CounselorCase {
  id: string;
  caseId: string;
  userId: string;
  victimName: string;
  victimEmail?: string;
  victimType?: VictimType;
  caseStage: CaseStage;
  district: string;
  state: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskTrend: string;
  daysInDistress: number;
  recentCheckIn: {
    mood: number;
    stress: number;
    energy: number;
    sleepHours: number;
    senseOfSafety?: number;
    supportAvailability?: number;
    caseRelatedStress?: number;
    caseStage?: CaseStage;
    timestamp: string;
  };
  topSignals: RiskFactor[];
  aiSummary: string;
  suggestedPathways?: string[];
  interventionsCount: number;
}

export interface Intervention {
  _id: string;
  userId: string;
  caseId?: string;
  victimName?: string;
  counselorId: string;
  counselorName?: string;
  type: SupportType;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FOLLOW_UP_REQUIRED';
  clinicalNotes: string;
  actionItems?: string[];
  scheduledDate?: string;
  completedDate?: string;
  riskBeforeScore?: number;
  riskAfterScore?: number;
  createdAt: string;
}

export interface CaseJourneyStage {
  key: CaseStage;
  label: string;
  description: string;
  order: number;
}

