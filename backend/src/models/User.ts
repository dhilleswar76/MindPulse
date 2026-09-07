import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, VictimType, CaseStage } from '../types/index.js';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
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
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['USER', 'COUNSELOR', 'ADMIN'], default: 'USER', required: true, index: true },
    victimType: {
      type: String,
      enum: ['VICTIM', 'WITNESS', 'FAMILY_MEMBER', 'COMPLAINANT', 'OTHER_AFFECTED_PERSON'],
      default: 'VICTIM',
    },
    caseId: { type: String, index: true },
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
    },
    district: { type: String, default: 'Central District' },
    state: { type: String, default: 'National Capital Region' },
    supportStatus: { type: String, default: 'ACTIVE_MONITORING' },
    consentStatus: { type: Boolean, default: true },
    assignedCounselor: { type: String },
    department: { type: String },
    yearOfStudy: { type: Number },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
