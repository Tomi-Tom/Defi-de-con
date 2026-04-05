import { z } from 'zod'

export const entryValueSchema = z.object({
  field_id: z.string().uuid(),
  value_text: z.string().nullable().default(null),
  value_number: z.number().nullable().default(null),
  value_date: z.string().nullable().default(null),
  value_file_url: z.string().nullable().default(null),
})

export const submitEntrySchema = z.object({
  challenge_id: z.string().uuid(),
  values: z.array(entryValueSchema).min(1),
})

export type SubmitEntryInput = z.infer<typeof submitEntrySchema>
