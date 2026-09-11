import { z } from 'zod';

export const createCompensationClaimSchema = z.object({
  applicantName: z.string().min(2, 'Applicant name is required'),
  applicantRelation: z.enum(['SELF', 'PARENT_GUARDIAN', 'SPOUSE', 'LEGAL_HEIR', 'LEGAL_COUNSEL']),
  contactPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(5, 'Residential address is required'),
  district: z.string().default('Central District'),
  state: z.string().default('Delhi NCR'),
  incidentCategory: z.string().min(2, 'Incident category is required'),
  incidentDate: z.string().or(z.date()),
  firNumber: z.string().min(2, 'FIR / Complaint reference number is required'),
  policeStation: z.string().min(2, 'Police station jurisdiction is required'),
  lossDescription: z.string().min(10, 'Please provide brief description of injury or loss'),
  estimatedMinAmount: z.number().default(200000),
  estimatedMaxAmount: z.number().default(500000),
  interimReliefRequested: z.boolean().default(true),
  interimReliefAmount: z.number().optional(),
  bankDetails: z.object({
    accountHolderName: z.string().min(2, 'Account holder name is required'),
    bankName: z.string().min(2, 'Bank name is required'),
    accountNumber: z.string().min(6, 'Valid bank account number is required'),
    ifscCode: z.string().min(6, 'Valid IFSC code is required'),
  }),
  documents: z
    .array(
      z.object({
        docType: z.enum(['FIR_COPY', 'MEDICAL_REPORT', 'IDENTITY_PROOF', 'BANK_PASSBOOK', 'TREATMENT_BILLS', 'OTHER']),
        fileName: z.string().min(1),
        fileSize: z.string().default('1.5 MB'),
        status: z.enum(['SUBMITTED', 'VERIFIED', 'PENDING']).default('SUBMITTED'),
      })
    )
    .min(1, 'At least one mandatory document (e.g. FIR or Medical report) must be provided'),
});

export const calculateCompensationSchema = z.object({
  incidentCategory: z.string(),
  isMinor: z.boolean().default(false),
  disabilityLevel: z.enum(['NONE', 'PARTIAL_40_79', 'PERMANENT_80_PLUS', 'FATALITY']).default('NONE'),
  interimReliefNeeded: z.boolean().default(true),
});

export type CreateCompensationClaimInput = z.infer<typeof createCompensationClaimSchema>;
export type CalculateCompensationInput = z.infer<typeof calculateCompensationSchema>;
