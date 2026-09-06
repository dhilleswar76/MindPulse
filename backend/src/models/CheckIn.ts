import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  mood: number;
  stress: number;
  energy: number;
  sleepHours: number;
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
    optionalNote: { type: String, trim: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
