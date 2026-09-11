import mongoose, { Schema, Document } from 'mongoose';
import {
  CounsellingRequestType,
  CounsellingRequestStatus,
  UserRole,
  RiskLevel,
} from '../types/index.js';

export interface ICounsellingRequest extends Document {
  _id: mongoose.Types.ObjectId;
  victimId: mongoose.Types.ObjectId;
  victimName: string;
  caseId: string;
  counsellorId?: mongoose.Types.ObjectId;
  counsellorName?: string;
  requestedBy: mongoose.Types.ObjectId;
  requestedByName: string;
  requestedByRole: UserRole;
  requestType: CounsellingRequestType;
  status: CounsellingRequestStatus;
  caseStage?: string;
  riskLevel?: RiskLevel;
  notes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  approvedAt?: Date;
}

const CounsellingRequestSchema = new Schema<ICounsellingRequest>(
  {
    victimId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    victimName: { type: String, required: true },
    caseId: { type: String, required: true, index: true },
    counsellorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    counsellorName: { type: String },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedByName: { type: String, required: true },
    requestedByRole: {
      type: String,
      enum: ['ADMIN', 'COUNSELOR', 'USER'],
      required: true,
    },
    requestType: {
      type: String,
      enum: ['ADMIN_TO_COUNSELLOR', 'COUNSELLOR_TO_ADMIN', 'VICTIM_TO_ADMIN'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'APPROVED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    caseStage: { type: String, default: 'INVESTIGATION' },
    riskLevel: {
      type: String,
      enum: ['STABLE', 'WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
      default: 'WATCH',
    },
    notes: { type: String },
    rejectionReason: { type: String },
    respondedAt: { type: Date },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export const CounsellingRequest = mongoose.model<ICounsellingRequest>(
  'CounsellingRequest',
  CounsellingRequestSchema
);
