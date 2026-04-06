import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function requireAuthAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, user: null, error: 'Non authentifie' as const }
  return { supabase, user, error: null }
}
