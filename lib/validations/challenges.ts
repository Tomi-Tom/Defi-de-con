import { z } from 'zod'

export const challengeFieldSchema = z.object({
  name: z.string().min(1).regex(/^[a-z_]+$/, 'snake_case uniquement'),
  label: z.string().min(1, 'Label requis'),
  type: z.enum(['number', 'text', 'date', 'boolean', 'file', 'image']),
  required: z.boolean().default(true),
  order: z.number().int().min(0),
  config: z.record(z.string(), z.unknown()).nullable().default(null),
})

export const createChallengeSchema = z.object({
  title: z.string().min(3, 'Minimum 3 caracteres').max(100),
  description: z.string().max(2000).default(''),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  duration_days: z.number().int().min(1).max(365),
  upload_config: z.object({
    allowed_types: z.array(z.string()),
    max_size_mb: z.number().min(1).max(50),
  }).optional(),
  fields: z.array(challengeFieldSchema).min(1, 'Au moins un champ requis'),
})

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type ChallengeFieldInput = z.infer<typeof challengeFieldSchema>
