import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  riskLevel: 'WATCH' | 'COUNSELOR_REVIEW';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  triggerReason: string;
  assignedCounselorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    riskLevel: { type: String, enum: ['WATCH', 'COUNSELOR_REVIEW'], default: 'COUNSELOR_REVIEW', required: true },
    status: { type: String, enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'], default: 'OPEN', index: true },
    triggerReason: { type: String, required: true },
    assignedCounselorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
