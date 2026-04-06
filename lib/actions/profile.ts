'use server'

import { requireAuthAction } from '@/lib/supabase/require-auth'
import { refresh } from 'next/cache'
import { updateProfileSchema } from '@/lib/validations/profile'

export async function updateProfile(formData: FormData) {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const parsed = updateProfileSchema.safeParse({
    username: formData.get('username') || undefined,
    entry_mode: formData.get('entry_mode') || undefined,
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') return { error: 'Ce nom d\'utilisateur est deja pris' }
    return { error: 'Erreur lors de la mise a jour' }
  }

  refresh()
  return { success: true }
}
