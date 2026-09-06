import { z } from 'zod';

export const createCheckInSchema = z.object({
  mood: z.number().min(1).max(10),
  stress: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  sleepHours: z.number().min(0).max(24),
  optionalNote: z.string().max(1000).optional(),
});

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
