import mongoose, { Schema, Document } from 'mongoose';
import { CaseStage } from '../types/index.js';

export interface ICheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
  senseOfSafety?: number;
  supportAvailability?: number;
  caseRelatedStress?: number;
  caseStage?: CaseStage;
  optionalNote?: string;
  timestamp: Date;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mood: { type: Number, required: true, min: 1, max: 10 },
    stress: { type: Number, required: true, min: 1, max: 10 },
    energy: { type: Number, required: true, min: 1, max: 10 },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    senseOfSafety: { type: Number, min: 1, max: 10, default: 7 },
    supportAvailability: { type: Number, min: 1, max: 10, default: 7 },
    caseRelatedStress: { type: Number, min: 1, max: 10, default: 5 },
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
    },
    optionalNote: { type: String, trim: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
