import { CompensationClaim, ICompensationClaim } from '../../models/CompensationClaim.js';
import { CreateCompensationClaimInput, CalculateCompensationInput } from './compensation.validation.js';

export interface StatutoryCategorySchedule {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  typicalInterimAmount: number;
  statutoryClause: string;
  processingTimeline: string;
  description: string;
  mandatoryDocuments: string[];
}

// Statutory compensation guidelines under Section 357A CrPC and NALSA Central Victim Compensation Scheme (CVCFS)
export const STATUTORY_SCHEDULES: StatutoryCategorySchedule[] = [
  {
    id: 'RAPE_SEXUAL_ASSAULT',
    name: 'Rape & Aggravated Sexual Assault',
    minAmount: 400000,
    maxAmount: 700000,
    typicalInterimAmount: 100000,
    statutoryClause: 'NALSA CVCFS Schedule Item 1 / Sec 357A CrPC',
    processingTimeline: 'Interim relief within 15 days of MLC/FIR, balance within 60 days',
    description: 'Mandatory statutory compensation for physical trauma, specialized mental healthcare, and rehabilitation.',
    mandatoryDocuments: [
      'Copy of First Information Report (FIR)',
      'Medico-Legal Examination (MLC) report',
      'Proof of identity (Aadhaar / Voter ID)',
      'Bank passbook copy for Direct Benefit Transfer (DBT)',
    ],
  },
  {
    id: 'POCSO_CHILD_VICTIM',
    name: 'Child Sexual Abuse (POCSO Act)',
    minAmount: 500000,
    maxAmount: 1000000,
    typicalInterimAmount: 150000,
    statutoryClause: 'Section 33(8) POCSO Act & Special Rule 9 / NALSA POCSO Guidelines',
    processingTimeline: 'Immediate interim within 30 days ordered by Special POCSO Court',
    description: 'Special statutory fund for care, counseling, safe education, and non-disclosure rehabilitation of minor victims.',
    mandatoryDocuments: [
      'Copy of FIR / Special POCSO Court Complaint',
      'Child Age Verification Document (Birth Certificate / School record)',
      'Medical & Psychological assessment report',
      'Legal Guardian Identity & Bank Passbook',
    ],
  },
  {
    id: 'LOSS_OF_LIFE',
    name: 'Loss of Life / Homicide of Sole Breadwinner',
    minAmount: 500000,
    maxAmount: 1000000,
    typicalInterimAmount: 200000,
    statutoryClause: 'Section 357A(1) CrPC / State Victim Compensation Scheme Item 4',
    processingTimeline: 'Interim subsistence grant within 30 days, final post-inquiry',
    description: 'Livelihood restitution, dependent rehabilitation, and funeral/urgent financial support for surviving dependents.',
    mandatoryDocuments: [
      'Copy of FIR and Charge-sheet / Post-Mortem Report',
      'Death Certificate of the deceased',
      'Legal Heir Certificate / Survivorship Certificate',
      'Dependent Bank Account & Identity Proof',
    ],
  },
  {
    id: 'GRIEVOUS_HURT_PERMANENT_DISABILITY',
    name: 'Grievous Hurt & Permanent Incapacity (80%+)',
    minAmount: 300000,
    maxAmount: 600000,
    typicalInterimAmount: 100000,
    statutoryClause: 'Sec 320 IPC Grievous Hurt / Sec 357A CrPC',
    processingTimeline: 'Interim medical support within 14 days, balance post-medical board inquiry',
    description: 'Financial aid for prosthetic devices, critical surgeries, and permanent loss of earning capacity.',
    mandatoryDocuments: [
      'Copy of FIR / Police report',
      'Disability Certificate from Government Medical Board / Civil Surgeon',
      'Hospital Discharge Summary & Treatment Invoices',
      'Bank Account Details for DBT',
    ],
  },
  {
    id: 'PARTIAL_DISABILITY',
    name: 'Partial Disability & Severe Trauma (40%–79%)',
    minAmount: 200000,
    maxAmount: 400000,
    typicalInterimAmount: 50000,
    statutoryClause: 'Section 357A CrPC / NALSA Guidelines Item 6',
    processingTimeline: 'Disbursed within 45–60 days of application',
    description: 'Financial compensation for prolonged medical care, psychiatric rehabilitation, and vocational support.',
    mandatoryDocuments: [
      'Copy of FIR',
      'Hospital MLC & Treatment Bills',
      'Medical Disability Evaluation Report',
      'Bank Account Passbook / Cancelled Cheque',
    ],
  },
  {
    id: 'ACID_ATTACK',
    name: 'Acid Attack & Chemical Disfigurement',
    minAmount: 300000,
    maxAmount: 800000,
    typicalInterimAmount: 100000,
    statutoryClause: 'Supreme Court Laxmi v. UOI / Section 357B & 357C CrPC',
    processingTimeline: 'Mandatory ₹1,00,000 within 15 days for specialized surgery, balance in 60 days',
    description: 'Statutory emergency reconstructive surgery, burn center treatment, and long-term socio-economic rehabilitation.',
    mandatoryDocuments: [
      'Copy of FIR under Sec 326A / 326B IPC',
      'Medical certification of burn & disfigurement percentage',
      'Surgical treatment estimation quotation',
      'Victim Identity & Bank details',
    ],
  },
  {
    id: 'HUMAN_TRAFFICKING',
    name: 'Rehabilitation of Victims of Human Trafficking',
    minAmount: 200000,
    maxAmount: 400000,
    typicalInterimAmount: 50000,
    statutoryClause: 'NALSA Compensation Scheme for Women / Sec 357A CrPC',
    processingTimeline: 'Safe shelter subsistence within 14 days of rescue',
    description: 'Relief for safe housing, repatriation, legal advocacy, and psychological stabilization after rescue.',
    mandatoryDocuments: [
      'Rescue memo / FIR copy',
      'CWC or District Magistrate order',
      'Identity verification / Counselor report',
      'DBT Bank details',
    ],
  },
  {
    id: 'LOSS_OF_FETUS',
    name: 'Loss of Fetus / Miscarriage Caused by Assault',
    minAmount: 200000,
    maxAmount: 300000,
    typicalInterimAmount: 50000,
    statutoryClause: 'NALSA Scheme Clause 5 / Section 312-316 IPC',
    processingTimeline: 'Immediate medical grant within 15 days',
    description: 'Statutory compensation for physical harm, medical care, and psychological counseling.',
    mandatoryDocuments: [
      'Copy of FIR',
      'Gynecological MLC / Obstetric Medical Report',
      'Identity & Residence Proof',
      'Bank Account details',
    ],
  },
];

// In-memory store for fallback/dev demo
const inMemoryClaims: any[] = [];

export const compensationService = {
  getStatutorySchedules: () => {
    return STATUTORY_SCHEDULES;
  },

  calculateCompensation: (input: CalculateCompensationInput) => {
    const category = STATUTORY_SCHEDULES.find((s) => s.id === input.incidentCategory) || STATUTORY_SCHEDULES[0];

    let minAmount = category.minAmount;
    let maxAmount = category.maxAmount;
    let interimAmount = category.typicalInterimAmount;

    // NALSA rule: If victim is a child or minor under 18, statutory compensation is augmented by up to 50%
    if (input.isMinor) {
      minAmount = Math.round(minAmount * 1.5);
      maxAmount = Math.round(maxAmount * 1.5);
      interimAmount = Math.round(interimAmount * 1.5);
    }

    // Disability factor
    if (input.disabilityLevel === 'PERMANENT_80_PLUS') {
      minAmount = Math.max(minAmount, 400000);
      maxAmount = Math.max(maxAmount, 700000);
      interimAmount = Math.max(interimAmount, 100000);
    } else if (input.disabilityLevel === 'FATALITY') {
      minAmount = Math.max(minAmount, 500000);
      maxAmount = Math.max(maxAmount, 1000000);
      interimAmount = Math.max(interimAmount, 150000);
    }

    return {
      category: category.name,
      categoryId: category.id,
      statutoryClause: category.statutoryClause,
      processingTimeline: category.processingTimeline,
      estimatedMinAmount: minAmount,
      estimatedMaxAmount: maxAmount,
      interimReliefAmount: input.interimReliefNeeded ? interimAmount : 0,
      mandatoryDocuments: category.mandatoryDocuments,
      statutoryNotes: [
        'Interim relief under Section 357A(6) CrPC can be sanctioned immediately without waiting for trial verdict.',
        'Payment is routed via Direct Benefit Transfer (DBT) directly from the State Victim Compensation Fund.',
        'Receipt of compensation under this scheme does not prevent recovery of additional damages under civil law.',
      ],
    };
  },

  createClaim: async (userId: string, input: CreateCompensationClaimInput) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const claimNumber = `DLSA-${new Date().getFullYear()}-${randomSuffix}`;

    try {
      const claim = await CompensationClaim.create({
        ...input,
        userId,
        claimNumber,
        incidentDate: new Date(input.incidentDate),
        claimStatus: 'SUBMITTED',
        assignedCounselorName: 'Dr. Sarah Jenkins',
      });
      return claim;
    } catch {
      // Graceful in-memory fallback for local environments without Mongo connection
      const fallbackClaim = {
        _id: `claim_${Date.now()}`,
        userId,
        claimNumber,
        ...input,
        incidentDate: new Date(input.incidentDate),
        claimStatus: 'SUBMITTED',
        statutorySection: 'Section 357A CrPC / NALSA Scheme',
        assignedCounselorName: 'Dr. Sarah Jenkins',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryClaims.unshift(fallbackClaim);
      return fallbackClaim;
    }
  },

  getUserClaims: async (userId: string) => {
    try {
      const claims = await CompensationClaim.find({ userId }).sort({ createdAt: -1 });
      if (claims.length > 0) return claims;
    } catch {
      // Fallback
    }

    const userInMemory = inMemoryClaims.filter((c) => c.userId === userId);
    if (userInMemory.length > 0) return userInMemory;

    // Provide one initial seeded sample claim for demonstration if none exist
    return [
      {
        _id: 'seed_claim_101',
        userId,
        claimNumber: 'DLSA-2026-4912',
        applicantName: 'Alex Rivera',
        applicantRelation: 'SELF',
        contactPhone: '+91 98765 43210',
        address: 'Sector 4, Central District, Delhi',
        district: 'Central District',
        state: 'Delhi NCR',
        incidentCategory: 'GRIEVOUS_HURT_PERMANENT_DISABILITY',
        incidentDate: new Date(Date.now() - 30 * 86400000),
        firNumber: 'FIR No. 104/2026',
        policeStation: 'Connaught Place Police Station',
        lossDescription:
          'Sustained grievous fractures requiring surgical stabilization and orthopedic rehabilitation following severe road-rage assault.',
        estimatedMinAmount: 300000,
        estimatedMaxAmount: 600000,
        interimReliefRequested: true,
        interimReliefAmount: 100000,
        bankDetails: {
          accountHolderName: 'Alex Rivera',
          bankName: 'State Bank of India',
          accountNumber: '••••••••4829',
          ifscCode: 'SBIN0001234',
        },
        documents: [
          {
            docType: 'FIR_COPY',
            fileName: 'FIR_104_2026_Certified_Copy.pdf',
            fileSize: '1.4 MB',
            status: 'VERIFIED',
            uploadedAt: new Date(Date.now() - 15 * 86400000),
          },
          {
            docType: 'MEDICAL_REPORT',
            fileName: 'AIIMS_Discharge_Summary_Orthopedics.pdf',
            fileSize: '3.1 MB',
            status: 'VERIFIED',
            uploadedAt: new Date(Date.now() - 15 * 86400000),
          },
          {
            docType: 'IDENTITY_PROOF',
            fileName: 'Aadhaar_Card_AlexRivera.pdf',
            fileSize: '820 KB',
            status: 'VERIFIED',
            uploadedAt: new Date(Date.now() - 15 * 86400000),
          },
          {
            docType: 'BANK_PASSBOOK',
            fileName: 'SBI_Passbook_FrontPage_DBT.pdf',
            fileSize: '950 KB',
            status: 'VERIFIED',
            uploadedAt: new Date(Date.now() - 15 * 86400000),
          },
        ],
        claimStatus: 'UNDER_DLSA_REVIEW',
        statutorySection: 'Section 357A CrPC / NALSA Scheme Item 3',
        assignedCounselorName: 'Dr. Sarah Jenkins',
        counselorNotes:
          'DLSA Member Secretary has completed first inquiry. Recommendation for ₹1,00,000 interim surgical reimbursement submitted to Welfare Board.',
        createdAt: new Date(Date.now() - 15 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
      },
    ];
  },
};
