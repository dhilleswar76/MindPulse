import mongoose, { Schema, Document } from 'mongoose';

export type InterventionType = 'CHECK_IN_CHAT' | 'COUNSELING_SESSION' | 'RESOURCE_REFERRAL' | 'ACADEMIC_ADJUSTMENT';
export type InterventionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FOLLOW_UP_REQUIRED';

export interface IIntervention extends Document {
  userId: mongoose.Types.ObjectId;
  counselorId: mongoose.Types.ObjectId;
  type: InterventionType;
  status: InterventionStatus;
  clinicalNotes: string;
  actionItems?: string[];
  scheduledDate?: Date;
  completedDate?: Date;
  riskBeforeScore?: number;
  riskAfterScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InterventionSchema = new Schema<IIntervention>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    counselorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['CHECK_IN_CHAT', 'COUNSELING_SESSION', 'RESOURCE_REFERRAL', 'ACADEMIC_ADJUSTMENT'],
      default: 'CHECK_IN_CHAT',
      required: true,
    },
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'FOLLOW_UP_REQUIRED'],
      default: 'PLANNED',
      index: true,
    },
    clinicalNotes: { type: String, required: true },
    actionItems: [{ type: String }],
    scheduledDate: { type: Date, default: Date.now },
    completedDate: { type: Date },
    riskBeforeScore: { type: Number, min: 0, max: 1 },
    riskAfterScore: { type: Number, min: 0, max: 1 },
  },
  { timestamps: true }
);

export const Intervention = mongoose.model<IIntervention>('Intervention', InterventionSchema);
