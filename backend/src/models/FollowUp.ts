import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  interventionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  dueDate: Date;
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    interventionId: { type: Schema.Types.ObjectId, ref: 'Intervention', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);
