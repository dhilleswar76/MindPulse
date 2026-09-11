import mongoose, { Schema, Document } from 'mongoose';

export interface ICompensationDocument {
  docType: 'FIR_COPY' | 'MEDICAL_REPORT' | 'IDENTITY_PROOF' | 'BANK_PASSBOOK' | 'TREATMENT_BILLS' | 'OTHER';
  fileName: string;
  fileSize: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'PENDING';
  uploadedAt: Date;
}

export interface ICompensationClaim extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  claimNumber: string;
  applicantName: string;
  applicantRelation: 'SELF' | 'PARENT_GUARDIAN' | 'SPOUSE' | 'LEGAL_HEIR' | 'LEGAL_COUNSEL';
  contactPhone: string;
  email?: string;
  address: string;
  district: string;
  state: string;
  incidentCategory: string;
  incidentDate: Date;
  firNumber: string;
  policeStation: string;
  lossDescription: string;
  estimatedMinAmount: number;
  estimatedMaxAmount: number;
  interimReliefRequested: boolean;
  interimReliefAmount?: number;
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  documents: ICompensationDocument[];
  claimStatus: 'SUBMITTED' | 'UNDER_DLSA_REVIEW' | 'INTERIM_SANCTIONED' | 'DISBURSED' | 'REJECTED';
  statutorySection: string;
  assignedCounselorName?: string;
  counselorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompensationDocumentSchema = new Schema<ICompensationDocument>(
  {
    docType: {
      type: String,
      enum: ['FIR_COPY', 'MEDICAL_REPORT', 'IDENTITY_PROOF', 'BANK_PASSBOOK', 'TREATMENT_BILLS', 'OTHER'],
      required: true,
    },
    fileName: { type: String, required: true },
    fileSize: { type: String, default: '1.2 MB' },
    status: {
      type: String,
      enum: ['SUBMITTED', 'VERIFIED', 'PENDING'],
      default: 'SUBMITTED',
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CompensationClaimSchema = new Schema<ICompensationClaim>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    claimNumber: { type: String, required: true, unique: true, index: true },
    applicantName: { type: String, required: true, trim: true },
    applicantRelation: {
      type: String,
      enum: ['SELF', 'PARENT_GUARDIAN', 'SPOUSE', 'LEGAL_HEIR', 'LEGAL_COUNSEL'],
      default: 'SELF',
      required: true,
    },
    contactPhone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, required: true },
    district: { type: String, required: true, default: 'Central District' },
    state: { type: String, required: true, default: 'National Capital Region' },
    incidentCategory: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    firNumber: { type: String, required: true, trim: true },
    policeStation: { type: String, required: true, trim: true },
    lossDescription: { type: String, required: true },
    estimatedMinAmount: { type: Number, required: true, default: 200000 },
    estimatedMaxAmount: { type: Number, required: true, default: 500000 },
    interimReliefRequested: { type: Boolean, default: true },
    interimReliefAmount: { type: Number, default: 100000 },
    bankDetails: {
      accountHolderName: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
    },
    documents: [CompensationDocumentSchema],
    claimStatus: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_DLSA_REVIEW', 'INTERIM_SANCTIONED', 'DISBURSED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true,
    },
    statutorySection: { type: String, default: 'Section 357A CrPC / NALSA Scheme' },
    assignedCounselorName: { type: String, default: 'Dr. Sarah Jenkins' },
    counselorNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const CompensationClaim = mongoose.model<ICompensationClaim>('CompensationClaim', CompensationClaimSchema);
