import mongoose, { Schema, Document } from 'mongoose';
import { RiskLevel } from '../types/index.js';

export interface IRiskScore extends Document {
  userId: mongoose.Types.ObjectId;
  riskScore: number;
  riskLevel: RiskLevel;
  factors: Array<{
    feature: string;
    impact: number;
    direction?: string;
    description?: string;
  }>;
  anomalyScore?: number;
  modelVersion: string;
  calculatedAt: Date;
}

const RiskScoreSchema = new Schema<IRiskScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    riskScore: { type: Number, required: true, min: 0, max: 1 },
    riskLevel: {
      type: String,
      enum: ['STABLE', 'WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
      required: true,
      index: true,
    },
    factors: [
      {
        feature: { type: String, required: true },
        impact: { type: Number, required: true },
        direction: { type: String, default: 'increase' },
        description: { type: String },
      },
    ],
    anomalyScore: { type: Number, default: 0.0 },
    modelVersion: { type: String, default: 'prototype-v1.0' },
    calculatedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const RiskScore = mongoose.model<IRiskScore>('RiskScore', RiskScoreSchema);
