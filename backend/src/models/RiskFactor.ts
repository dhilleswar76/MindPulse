import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskFactor extends Document {
  riskScoreId: mongoose.Types.ObjectId;
  featureName: string;
  shapValue: number;
  baselineDelta: number;
}

const RiskFactorSchema = new Schema<IRiskFactor>(
  {
    riskScoreId: { type: Schema.Types.ObjectId, ref: 'RiskScore', required: true, index: true },
    featureName: { type: String, required: true },
    shapValue: { type: Number, required: true },
    baselineDelta: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const RiskFactor = mongoose.model<IRiskFactor>('RiskFactor', RiskFactorSchema);
