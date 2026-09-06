import mongoose, { Schema, Document } from 'mongoose';

export type RecommendationCategory = 'BREATHING' | 'SLEEP' | 'MINDFULNESS' | 'CAMPUS_RESOURCE' | 'CRISIS_CONTACT';

export interface IRecommendation extends Document {
  title: string;
  category: RecommendationCategory;
  description: string;
  actionUrl?: string;
  durationMinutes?: number;
  targetRiskLevels: string[];
  isNonClinical: boolean;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['BREATHING', 'SLEEP', 'MINDFULNESS', 'CAMPUS_RESOURCE', 'CRISIS_CONTACT'],
      required: true,
    },
    description: { type: String, required: true },
    actionUrl: { type: String },
    durationMinutes: { type: Number, default: 5 },
    targetRiskLevels: [{ type: String }],
    isNonClinical: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
