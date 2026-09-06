export type UserRole = 'USER' | 'COUNSELOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
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
}

export interface CheckIn {
  _id?: string;
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
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
  isPrivate: boolean;
  createdAt: string | Date;
}

export interface Recommendation {
  _id: string;
  title: string;
  category: 'BREATHING' | 'SLEEP' | 'MINDFULNESS' | 'CAMPUS_RESOURCE' | 'CRISIS_CONTACT';
  description: string;
  durationMinutes?: number;
  actionUrl?: string;
  targetRiskLevels: string[];
  isNonClinical: boolean;
}

export interface CounselorCase {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  yearOfStudy: number;
  riskLevel: RiskLevel;
  riskScore: number;
  riskTrend: string;
  daysInDistress: number;
  recentCheckIn: {
    mood: number;
    stress: number;
    energy: number;
    sleepHours: number;
    timestamp: string;
  };
  topSignals: RiskFactor[];
  aiSummary: string;
  interventionsCount: number;
}

export interface Intervention {
  _id: string;
  userId: string;
  studentName?: string;
  counselorId: string;
  counselorName?: string;
  type: 'CHECK_IN_CHAT' | 'COUNSELING_SESSION' | 'RESOURCE_REFERRAL' | 'ACADEMIC_ADJUSTMENT';
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FOLLOW_UP_REQUIRED';
  clinicalNotes: string;
  actionItems?: string[];
  scheduledDate?: string;
  completedDate?: string;
  riskBeforeScore?: number;
  riskAfterScore?: number;
  createdAt: string;
}
