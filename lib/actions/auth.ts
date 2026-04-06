'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

export type AuthState = {
  error?: string
  fieldErrors?: Record<string, string>
  values?: Record<string, string>
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const values = {
    email: formData.get('email') as string ?? '',
    password: formData.get('password') as string ?? '',
  }

  const parsed = loginSchema.safeParse(values)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { fieldErrors, values }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email ou mot de passe incorrect', values }
  }

  redirect('/dashboard')
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const values = {
    username: formData.get('username') as string ?? '',
    email: formData.get('email') as string ?? '',
    password: formData.get('password') as string ?? '',
  }

  const parsed = signupSchema.safeParse(values)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return { fieldErrors, values }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Cet email est deja utilise', values }
    }
    return { error: `Erreur: ${error.message}`, values }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
