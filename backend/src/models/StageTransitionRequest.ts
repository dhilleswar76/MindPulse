import mongoose, { Schema, Document } from 'mongoose';
import { CaseStage, StageTransitionRequestStatus } from '../types/index.js';

export interface IStageTransitionRequest extends Document {
  _id: mongoose.Types.ObjectId;
  caseId: string; // e.g. MP-1042
  caseObjId?: mongoose.Types.ObjectId;
  fromStage: CaseStage;
  requestedStage: CaseStage;
  requestedByCounselor: mongoose.Types.ObjectId;
  counselorName: string;
  reason: string;
  evidenceReference: string;
  notes?: string;
  status: StageTransitionRequestStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewerName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  reopenReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StageTransitionRequestSchema = new Schema<IStageTransitionRequest>(
  {
    caseId: { type: String, required: true, index: true, trim: true },
    caseObjId: { type: Schema.Types.ObjectId, ref: 'Case' },
    fromStage: {
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
    requestedByCounselor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    counselorName: { type: String, required: true },
    reason: { type: String, required: true },
    evidenceReference: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION_REQUIRED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    reopenReason: { type: String },
  },
  { timestamps: true }
);

export const StageTransitionRequest = mongoose.model<IStageTransitionRequest>(
  'StageTransitionRequest',
  StageTransitionRequestSchema
);
