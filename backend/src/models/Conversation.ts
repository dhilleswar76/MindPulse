import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  victimId: mongoose.Types.ObjectId;
  victimName: string;
  counsellorId: mongoose.Types.ObjectId;
  counsellorName: string;
  caseId: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastSenderRole?: 'USER' | 'COUNSELOR';
  victimUnreadCount: number;
  counsellorUnreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
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
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastSenderRole: {
      type: String,
      enum: ['USER', 'COUNSELOR'],
    },
    victimUnreadCount: {
      type: Number,
      default: 0,
    },
    counsellorUnreadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ victimId: 1, counsellorId: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
