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

export type StageStatus =
  | 'LOCKED'
  | 'ACTIVE'
  | 'COMPLETION_REQUESTED'
  | 'COMPLETED'
  | 'REJECTED';

export type StageVerificationStatus =
  | 'LOCKED'
  | 'ACTIVE'
  | 'COMPLETION_REQUESTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'REOPENED';

export type StageTransitionRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUIRED';

export interface CaseStageInfo {
  stage: CaseStage;
  name: string;
  order: number;
  status: StageStatus;
  completedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  evidenceReference?: string;
}

export interface StageTransitionRequest {
  _id: string;
  caseId: string;
  fromStage: CaseStage;
  requestedStage: CaseStage;
  requestedByCounselor?: { _id: string; fullName: string; email: string } | string;
  counselorName: string;
  reason: string;
  evidenceReference: string;
  notes?: string;
  status: StageTransitionRequestStatus;
  reviewedBy?: { _id: string; fullName: string; email: string } | string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reopenReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingStageTransition {
  requestId?: string;
  requestedStage: CaseStage;
  requestedAt: string;
  status: 'PENDING' | 'CLARIFICATION_REQUIRED';
}

export interface AppNotification {
  _id: string;
  recipientRole: 'ADMIN' | 'COUNSELOR' | 'USER';
  recipientId?: string;
  caseId?: string;
  stage?: string;
  type:
    | 'STAGE_COMPLETION_REQUESTED'
    | 'STAGE_APPROVED'
    | 'STAGE_REJECTED'
    | 'COUNSELLING_REQUEST_CREATED'
    | 'COUNSELLING_REQUEST_ACCEPTED'
    | 'COUNSELLING_REQUEST_REJECTED'
    | 'COUNSELLING_REQUEST_APPROVED'
    | 'COUNSELLING_ALLOCATED'
    | 'GENERAL';
  title: string;
  message: string;
  submittedBy?: string;
  status?: string;
  rejectionReason?: string;
  requestId?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CounsellorStatus = 'NOT_ALLOCATED' | 'PENDING' | 'REQUESTED' | 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';

export type CounsellingRequestType = 'VICTIM_TO_ADMIN' | 'ADMIN_TO_COUNSELLOR' | 'COUNSELLOR_TO_ADMIN';

export type CounsellingRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'APPROVED' | 'CANCELLED';

export interface CounsellingRequest {
  _id: string;
  victimId: string;
  victimName: string;
  caseId: string;
  counsellorId?: string;
  counsellorName?: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: UserRole;
  requestType: CounsellingRequestType;
  status: CounsellingRequestStatus;
  caseStage?: string;
  riskLevel?: string;
  notes?: string;
  preferredLanguage?: string;
  preferredGender?: string;
  rejectionReason?: string;
  respondedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VictimCounsellorProfileResponse {
  victimId: string;
  victimName: string;
  caseId: string;
  caseStage: string;
  counsellorStatus: CounsellorStatus;
  counsellor: {
    id: string;
    fullName: string;
    email: string;
    specialization: string;
    experienceYears: number;
    availability: string;
    assignedSince: string;
    district?: string;
    phone?: string;
  } | null;
  pendingRequest: {
    _id: string;
    requestType: CounsellingRequestType;
    requestedByName: string;
    createdAt: string;
    status: CounsellingRequestStatus;
  } | null;
}

export interface AvailableVictimItem {
  id: string;
  victimId: string;
  victimName: string;
  caseId: string;
  caseStage: string;
  victimType: string;
  district: string;
  riskLevel: RiskLevel;
  counsellorStatus: CounsellorStatus;
  myPendingRequest?: {
    _id: string;
    status: CounsellingRequestStatus;
  } | null;
  hasActiveRequest: boolean;
  createdAt: string;
}

export interface AvailableCounsellorItem {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  experienceYears: number;
  district: string;
  currentCases: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'COUNSELOR';
  receiverId: string;
  message: string;
  messageType?: 'TEXT' | 'ATTACHMENT' | 'SYSTEM';
  read: boolean;
  readAt?: string | Date;
  createdAt: string | Date;
}

export interface ChatConversation {
  _id: string;
  victimId: string;
  victimName: string;
  counsellorId: string;
  counsellorName?: string;
  caseId: string;
  lastMessage?: string;
  lastMessageAt?: string | Date;
  lastSenderRole?: 'USER' | 'COUNSELOR';
  victimUnreadCount?: number;
  counsellorUnreadCount?: number;
  unreadCount?: number;
  status?: 'ACTIVE' | 'ARCHIVED';
}

export interface CounsellorSuggestionItem {
  _id: string;
  victimId: string;
  victimName: string;
  counsellorId: string;
  counsellorName: string;
  caseId: string;
  status: 'PENDING' | 'RESPONDED' | 'CANCELLED';
  telemetrySnapshot?: {
    mood?: number;
    stress?: number;
    sleepHours?: number;
    anxiety?: number;
    safety?: number;
    riskLevel?: string;
    riskScore?: number;
  };
  requestNotes?: string;
  suggestionMessage?: string;
  requestedAt: string | Date;
  respondedAt?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface VictimChatData {
  counsellor: {
    id: string;
    fullName: string;
    email: string;
    specialization: string;
    experienceYears: number;
    availabilityStatus: string;
    district?: string;
  } | null;
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  hasCounsellor: boolean;
  counsellorStatus?: CounsellorStatus;
}

export interface CounsellorInboxData {
  conversations: ChatConversation[];
  suggestionRequests: CounsellorSuggestionItem[];
  stats: {
    activeConversations: number;
    unreadMessages: number;
    pendingSuggestions: number;
    totalSuggestions: number;
  };
}
