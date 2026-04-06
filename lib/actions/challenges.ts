'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuthAction } from '@/lib/supabase/require-auth'
import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { createChallengeSchema } from '@/lib/validations/challenges'
import { addDays, format } from 'date-fns'

export async function createChallenge(input: unknown) {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const parsed = createChallengeSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return { error: msg }
  }

  const { fields, ...challengeData } = parsed.data
  const endDate = format(addDays(new Date(challengeData.start_date), challengeData.duration_days), 'yyyy-MM-dd')

  // Use admin client for insert (RLS requires is_admin check which fails with anon key)
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const { data: challenge, error } = await admin
    .from('challenges')
    .insert({
      title: challengeData.title,
      description: challengeData.description ?? '',
      start_date: challengeData.start_date,
      duration_days: challengeData.duration_days,
      end_date: endDate,
      created_by: user.id,
      status: 'draft',
      cover_image_url: null,
      upload_config: challengeData.upload_config ?? null,
    } as any)
    .select('id')
    .single()

  if (error || !challenge) return { error: `Erreur: ${error?.message ?? 'inconnue'}` }

  // Insert fields (use admin client for RLS bypass)
  const { error: fieldsError } = await admin.from('challenge_fields').insert(
    fields.map(f => ({ ...f, challenge_id: (challenge as any).id })) as any
  )
  if (fieldsError) return { error: `Erreur champs: ${fieldsError.message}` }

  return { success: true, challengeId: (challenge as any).id }
}

export async function updateChallenge(challengeId: string, input: unknown) {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const parsed = createChallengeSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { fields, ...challengeData } = parsed.data
  const endDate = format(addDays(new Date(challengeData.start_date), challengeData.duration_days), 'yyyy-MM-dd')

  const { error } = await supabase
    .from('challenges')
    .update({ ...challengeData, end_date: endDate })
    .eq('id', challengeId)

  if (error) return { error: 'Erreur lors de la mise a jour' }

  // Replace fields
  await supabase.from('challenge_fields').delete().eq('challenge_id', challengeId)
  await supabase.from('challenge_fields').insert(
    fields.map(f => ({ ...f, challenge_id: challengeId }))
  )

  refresh()
  return { success: true }
}

export async function publishChallenge(challengeId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'active' })
    .eq('id', challengeId)
    .eq('status', 'draft')

  if (error) return { error: 'Erreur lors de la publication' }

  refresh()
  return { success: true }
}

export async function deleteChallenge(challengeId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('status', 'draft')

  if (error) return { error: 'Impossible de supprimer (le defi a peut-etre des participants)' }

  refresh()
  return { success: true }
}

export async function duplicateChallenge(challengeId: string) {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  // Fetch original
  const { data: original } = await supabase
    .from('challenges')
    .select('title, description, duration_days, upload_config, challenge_fields(*)')
    .eq('id', challengeId)
    .single()

  if (!original) return { error: 'Defi introuvable' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const today = new Date().toISOString().slice(0, 10)
  const endDate = format(addDays(new Date(today), (original as any).duration_days), 'yyyy-MM-dd')

  const { data: newChallenge, error } = await admin
    .from('challenges')
    .insert({
      title: `Copie de ${(original as any).title}`,
      description: (original as any).description,
      start_date: today,
      end_date: endDate,
      duration_days: (original as any).duration_days,
      created_by: user.id,
      status: 'draft',
      cover_image_url: null,
      upload_config: (original as any).upload_config ?? null,
    } as any)
    .select('id')
    .single()

  if (error || !newChallenge) return { error: `Erreur: ${error?.message ?? 'inconnue'}` }

  // Clone fields
  const fields = ((original as any).challenge_fields ?? []) as Array<{ name: string; label: string; type: string; required: boolean; order: number; config: any }>
  if (fields.length > 0) {
    await admin.from('challenge_fields').insert(
      fields.map(f => ({ name: f.name, label: f.label, type: f.type, required: f.required, order: f.order, config: f.config, challenge_id: (newChallenge as any).id })) as any
    )
  }

  refresh()
  return { success: true, challengeId: (newChallenge as any).id }
}
