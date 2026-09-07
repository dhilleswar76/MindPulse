import { z } from 'zod';

export const createInterventionSchema = z.object({
  userId: z.string().min(1),
  caseId: z.string().optional(),
  type: z.enum([
    'COUNSELLING',
    'PROFESSIONAL_REFERRAL',
    'LEGAL_AID',
    'PROTECTION_SUPPORT',
    'RELOCATION_SUPPORT',
    'FINANCIAL_ASSISTANCE',
    'REHABILITATION_SUPPORT',
    'CHECK_IN_CHAT',
    'OTHER',
  ]),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'FOLLOW_UP_REQUIRED']).default('PLANNED'),
  clinicalNotes: z.string().min(3, 'Notes must be at least 3 characters'),
  actionItems: z.array(z.string()).optional(),
  scheduledDate: z.string().optional(),
  riskBeforeScore: z.number().optional(),
});

export const updateInterventionSchema = z.object({
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'FOLLOW_UP_REQUIRED']).optional(),
  clinicalNotes: z.string().optional(),
  actionItems: z.array(z.string()).optional(),
  riskAfterScore: z.number().optional(),
  completedDate: z.string().optional(),
});

export type CreateInterventionInput = z.infer<typeof createInterventionSchema>;
export type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>;
