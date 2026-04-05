import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
})

export const signupSchema = z.object({
  username: z.string().min(3, 'Minimum 3 caracteres').max(30, 'Maximum 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Lettres, chiffres, tirets et underscores uniquement'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
