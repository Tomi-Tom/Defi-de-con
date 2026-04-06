'use server'

import { requireAdminAction } from '@/lib/supabase/require-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { refresh } from 'next/cache'

export async function createAdjustment(formData: FormData) {
  const { user, error: authError } = await requireAdminAction()
  if (authError || !user) return { error: authError ?? 'Non autorise' }

  const challenge_id = formData.get('challenge_id') as string
  const user_id = formData.get('user_id') as string
  const field_id = formData.get('field_id') as string
  const adjustment = Number(formData.get('adjustment'))
  const reason = (formData.get('reason') as string) || ''

  if (!challenge_id || !user_id || !field_id) return { error: 'Champs requis manquants' }
  if (isNaN(adjustment) || adjustment === 0) return { error: 'Ajustement invalide (doit etre different de 0)' }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await admin.from('participant_adjustments').insert({
    challenge_id,
    user_id,
    field_id,
    adjustment,
    reason,
    created_by: user.id,
  } as any)

  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function deleteAdjustment(adjustmentId: string) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const { error } = await admin.from('participant_adjustments').delete().eq('id', adjustmentId)
  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}
