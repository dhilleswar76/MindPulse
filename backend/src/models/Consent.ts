import mongoose, { Schema, Document } from 'mongoose';

export interface IConsent extends Document {
  userId: mongoose.Types.ObjectId;
  dataSharingConsent: boolean;
  counselorAlertConsent: boolean;
  anonymousResearchConsent: boolean;
  version: string;
  agreedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dataSharingConsent: { type: Boolean, default: true },
    counselorAlertConsent: { type: Boolean, default: true },
    anonymousResearchConsent: { type: Boolean, default: true },
    version: { type: String, default: '1.0' },
    agreedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Consent = mongoose.model<IConsent>('Consent', ConsentSchema);
