import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  stressSignal: number;
  emotionSignals: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, default: 'Daily Reflection' },
    content: { type: String, required: true, maxlength: 10000 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    stressSignal: { type: Number, default: 0.3, min: 0, max: 1 },
    emotionSignals: [{ type: String }],
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
