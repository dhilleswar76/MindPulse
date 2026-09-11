import mongoose, { Schema, Document } from 'mongoose';
import { VictimType, CaseStage, CaseStatus, IStageHistoryItem, IPendingStageTransition } from '../types/index.js';

export interface ICase extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: string; // e.g. MP-1042
  victimId: mongoose.Types.ObjectId;
  victimType: VictimType;
  caseStage: CaseStage;
  caseStatus: CaseStatus;
  district: string;
  state: string;
  assignedCounselorId?: mongoose.Types.ObjectId;
  assignedCounselorName?: string;
  consentStatus: boolean;
  priorityScore: number; // 0.00 to 1.00
  recentRiskLevel: 'STABLE' | 'WATCH' | 'ELEVATED' | 'REQUIRES_REVIEW';
  incidentYear?: number;
  lastCheckInAt?: Date;
  notes?: string;
  stagesHistory?: IStageHistoryItem[];
  pendingStageTransition?: IPendingStageTransition;
  createdAt: Date;
  updatedAt: Date;
}

const StageHistoryItemSchema = new Schema(
  {
    stage: {
      type: String,
      enum: [
        'CASE_REGISTRATION',
        'INVESTIGATION',
        'COURT_TRIAL',
        'COMPENSATION',
        'REHABILITATION',
        'PROTECTION_SUPPORT',
        'CLOSED',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'LOCKED',
        'ACTIVE',
        'COMPLETION_REQUESTED',
        'COMPLETED',
        'REJECTED',
        'NOT_STARTED',
        'IN_PROGRESS',
        'AWAITING_VERIFICATION',
        'REOPENED',
      ],
      default: 'LOCKED',
    },
    enteredAt: { type: Date },
    completedAt: { type: Date },
    requestedAt: { type: Date },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
    confirmedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    evidenceReference: { type: String },
    notes: { type: String },
    reopenReason: { type: String },
    rejectionReason: { type: String },
    date: { type: String },
  },
  { _id: false }
);

const PendingStageTransitionSchema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'StageTransitionRequest' },
    requestedStage: {
      type: String,
      enum: [
        'CASE_REGISTRATION',
        'INVESTIGATION',
        'COURT_TRIAL',
        'COMPENSATION',
        'REHABILITATION',
        'PROTECTION_SUPPORT',
        'CLOSED',
      ],
      required: true,
    },
    requestedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PENDING', 'CLARIFICATION_REQUIRED'],
      default: 'PENDING',
    },
  },
  { _id: false }
);

const CaseSchema = new Schema<ICase>(
  {
    caseId: { type: String, required: true, unique: true, index: true, trim: true },
    victimId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    victimType: {
      type: String,
      enum: ['VICTIM', 'WITNESS', 'FAMILY_MEMBER', 'COMPLAINANT', 'OTHER_AFFECTED_PERSON'],
      default: 'VICTIM',
      required: true,
      index: true,
    },
    caseStage: {
      type: String,
      enum: [
        'CASE_REGISTRATION',
        'INVESTIGATION',
        'COURT_TRIAL',
        'COMPENSATION',
        'REHABILITATION',
        'PROTECTION_SUPPORT',
        'CLOSED',
      ],
      default: 'INVESTIGATION',
      required: true,
      index: true,
    },
    caseStatus: {
      type: String,
      enum: ['ACTIVE', 'UNDER_REVIEW', 'SUPPORT_IN_PROGRESS', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    district: { type: String, required: true, default: 'Central District', index: true },
    state: { type: String, required: true, default: 'National Capital Region', index: true },
    assignedCounselorId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedCounselorName: { type: String, default: 'Dr. Sarah Jenkins' },
    consentStatus: { type: Boolean, default: true },
    priorityScore: { type: Number, default: 0.5, min: 0, max: 1 },
    recentRiskLevel: {
      type: String,
      enum: ['STABLE', 'WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
      default: 'STABLE',
    },
    incidentYear: { type: Number, default: 2025 },
    lastCheckInAt: { type: Date },
    notes: { type: String },
    stagesHistory: [StageHistoryItemSchema],
    pendingStageTransition: { type: PendingStageTransitionSchema, default: null },
  },
  { timestamps: true }
);

export const Case = mongoose.model<ICase>('Case', CaseSchema);
