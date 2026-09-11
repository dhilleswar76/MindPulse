import mongoose, { Schema, Document } from 'mongoose';

export interface ICounsellorSuggestion extends Document {
  _id: mongoose.Types.ObjectId;
  victimId: mongoose.Types.ObjectId;
  victimName: string;
  counsellorId: mongoose.Types.ObjectId;
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
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CounsellorSuggestionSchema = new Schema<ICounsellorSuggestion>(
  {
    victimId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    victimName: {
      type: String,
      required: true,
    },
    counsellorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    counsellorName: {
      type: String,
      required: true,
    },
    caseId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESPONDED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    telemetrySnapshot: {
      mood: { type: Number },
      stress: { type: Number },
      sleepHours: { type: Number },
      anxiety: { type: Number },
      safety: { type: Number },
      riskLevel: { type: String },
      riskScore: { type: Number },
    },
    requestNotes: {
      type: String,
      trim: true,
    },
    suggestionMessage: {
      type: String,
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CounsellorSuggestionSchema.index({ victimId: 1, status: 1 });

export const CounsellorSuggestion = mongoose.model<ICounsellorSuggestion>(
  'CounsellorSuggestion',
  CounsellorSuggestionSchema
);
