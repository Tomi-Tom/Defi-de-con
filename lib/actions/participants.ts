'use server'

import { requireAuthAction } from '@/lib/supabase/require-auth'
import { refresh } from 'next/cache'

export async function joinChallenge(challengeId: string) {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const { error } = await supabase
    .from('challenge_participants')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ challenge_id: challengeId, user_id: user.id } as any)

  if (error) {
    if (error.code === '23505') return { error: 'Deja inscrit a ce defi' }
    return { error: 'Erreur lors de l\'inscription' }
  }

  refresh()
  return { success: true }
}

export async function leaveChallenge(challengeId: string) {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const { error } = await supabase
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)

  if (error) return { error: 'Erreur lors de la desinscription' }

  refresh()
  return { success: true }
}
