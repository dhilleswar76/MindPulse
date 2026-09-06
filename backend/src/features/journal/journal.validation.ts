import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, 'Journal content cannot be empty').max(10000),
  isPrivate: z.boolean().default(true),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
