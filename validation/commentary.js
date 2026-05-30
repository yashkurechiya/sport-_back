import { z } from 'zod';

export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().nonnegative().optional(),
  period: z.string().trim().min(1).optional(),
  eventType: z.string().trim().min(1).optional(),
  actor: z.string().trim().min(1).optional(),
  team: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).optional(),
  metadata: z.record(z.string(),z.any()).optional(),
  tags: z.array(z.string()).optional(),
}); 