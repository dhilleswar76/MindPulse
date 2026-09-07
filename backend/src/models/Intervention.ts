import mongoose, { Schema, Document } from 'mongoose';

export type InterventionType =
  | 'COUNSELLING'
  | 'PROFESSIONAL_REFERRAL'
  | 'LEGAL_AID'
  | 'PROTECTION_SUPPORT'
  | 'RELOCATION_SUPPORT'
  | 'FINANCIAL_ASSISTANCE'
  | 'REHABILITATION_SUPPORT'
  | 'CHECK_IN_CHAT'
  | 'OTHER';
export type InterventionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FOLLOW_UP_REQUIRED';

export interface IIntervention extends Document {
  userId: mongoose.Types.ObjectId;
  caseId?: string;
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
    caseId: { type: String, index: true },
    counselorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'COUNSELLING',
        'PROFESSIONAL_REFERRAL',
        'LEGAL_AID',
        'PROTECTION_SUPPORT',
        'RELOCATION_SUPPORT',
        'FINANCIAL_ASSISTANCE',
        'REHABILITATION_SUPPORT',
        'CHECK_IN_CHAT',
        'OTHER',
      ],
      default: 'COUNSELLING',
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
