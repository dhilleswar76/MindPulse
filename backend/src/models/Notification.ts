import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'STAGE_COMPLETION_REQUESTED'
  | 'STAGE_APPROVED'
  | 'STAGE_REJECTED'
  | 'GENERAL';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipientRole: 'ADMIN' | 'COUNSELOR' | 'USER';
  recipientId?: mongoose.Types.ObjectId;
  caseId?: string;
  stage?: string;
  type: NotificationType;
  title: string;
  message: string;
  submittedBy?: string;
  status?: string;
  rejectionReason?: string;
  requestId?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientRole: {
      type: String,
      enum: ['ADMIN', 'COUNSELOR', 'USER'],
      required: true,
      index: true,
    },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    caseId: { type: String, index: true },
    stage: { type: String },
    type: {
      type: String,
      enum: ['STAGE_COMPLETION_REQUESTED', 'STAGE_APPROVED', 'STAGE_REJECTED', 'GENERAL'],
      default: 'GENERAL',
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    submittedBy: { type: String },
    status: { type: String },
    rejectionReason: { type: String },
    requestId: { type: Schema.Types.ObjectId, ref: 'StageTransitionRequest' },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
