import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/index.js';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  department?: string;
  yearOfStudy?: number;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['USER', 'COUNSELOR', 'ADMIN'], default: 'USER', required: true, index: true },
    department: { type: String, default: 'Computer Science' },
    yearOfStudy: { type: Number, default: 2 },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
