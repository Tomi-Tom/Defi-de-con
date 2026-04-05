import { z } from 'zod'

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Lettres, chiffres, tirets et underscores uniquement')
    .optional(),
  avatar_url: z.string().url().nullable().optional(),
  entry_mode: z.enum(['quick', 'wizard']).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
