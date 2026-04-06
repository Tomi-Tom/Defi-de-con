'use server'

import { requireAdminAction, requireAuthAction } from '@/lib/supabase/require-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { refresh } from 'next/cache'
import { addDays, format } from 'date-fns'

// Simplified input type — no Zod, just validate manually for clarity
interface CreateChallengeInput {
  title: string
  description: string
  start_date: string
  duration_days: number
  fields: Array<{
    label: string
    type: string
    required: boolean
  }>
}

export async function createChallenge(input: CreateChallengeInput) {
  // Admin check
  const { user, error: authError } = await requireAdminAction()
  if (authError || !user) return { error: authError ?? 'Non autorise' }

  // Validate basic fields
  if (!input.title || input.title.trim().length < 2) {
    return { error: 'Le titre doit faire au moins 2 caracteres' }
  }
  if (!input.start_date || !/^\d{4}-\d{2}-\d{2}$/.test(input.start_date)) {
    return { error: 'Date de debut invalide' }
  }
  if (!input.duration_days || input.duration_days < 1 || input.duration_days > 365) {
    return { error: 'La duree doit etre entre 1 et 365 jours' }
  }
  if (!input.fields || input.fields.length === 0) {
    return { error: 'Ajoute au moins un champ' }
  }

  // Validate and clean fields
  const cleanFields = input.fields
    .filter(f => f.label && f.label.trim().length > 0)
    .map((f, i) => ({
      name: f.label
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || `champ_${i}`,
      label: f.label.trim(),
      type: ['number', 'text', 'date', 'boolean', 'file', 'image'].includes(f.type) ? f.type : 'text',
      required: f.required ?? true,
      order: i,
      config: null,
    }))

  if (cleanFields.length === 0) {
    return { error: 'Ajoute au moins un champ avec un label' }
  }

  // Compute end date
  const endDate = format(addDays(new Date(input.start_date), input.duration_days), 'yyyy-MM-dd')

  const admin = createAdminClient()

  // Insert challenge
  const { data: challengeData, error: challengeError } = await admin
    .from('challenges')
    .insert({
      title: input.title.trim(),
      description: (input.description ?? '').trim(),
      start_date: input.start_date,
      duration_days: input.duration_days,
      end_date: endDate,
      created_by: user.id,
      status: 'draft',
      cover_image_url: null,
      upload_config: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select('id')
    .single()

  if (challengeError) {
    console.error('Challenge insert error:', challengeError)
    return { error: `Erreur creation defi: ${challengeError.message}` }
  }
  if (!challengeData) {
    return { error: 'Erreur creation defi: aucune donnee retournee' }
  }

  const challengeId = (challengeData as { id: string }).id

  // Insert fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: fieldsError } = await admin
    .from('challenge_fields')
    .insert(
      cleanFields.map(f => ({
        ...f,
        challenge_id: challengeId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any
    )

  if (fieldsError) {
    console.error('Fields insert error:', fieldsError)
    // Rollback: delete the orphan challenge
    await admin.from('challenges').delete().eq('id', challengeId)
    return { error: `Erreur creation champs: ${fieldsError.message}` }
  }

  return { success: true, challengeId }
}

export async function updateChallenge(challengeId: string, input: unknown) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const data = input as Record<string, unknown>

  const endDate = format(
    addDays(new Date(data.start_date as string), data.duration_days as number),
    'yyyy-MM-dd'
  )

  const { error } = await admin
    .from('challenges')
    .update({
      title: data.title,
      description: data.description ?? '',
      start_date: data.start_date,
      duration_days: data.duration_days,
      end_date: endDate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', challengeId)

  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function publishChallenge(challengeId: string) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const { error } = await admin
    .from('challenges')
    .update({ status: 'active' // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', challengeId)
    .eq('status', 'draft')

  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function deleteChallenge(challengeId: string) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const { error } = await admin
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('status', 'draft')

  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function duplicateChallenge(challengeId: string) {
  const { user, error: authError } = await requireAdminAction()
  if (authError || !user) return { error: authError ?? 'Non autorise' }

  const admin = createAdminClient()

  // Fetch original
  const { data: original } = await admin
    .from('challenges')
    .select('title, description, duration_days, upload_config, challenge_fields(*)')
    .eq('id', challengeId)
    .single()

  if (!original) return { error: 'Defi introuvable' }

  const orig = original as Record<string, unknown>
  const today = new Date().toISOString().slice(0, 10)
  const endDate = format(addDays(new Date(today), orig.duration_days as number), 'yyyy-MM-dd')

  const { data: newChallenge, error } = await admin
    .from('challenges')
    .insert({
      title: `Copie de ${orig.title}`,
      description: orig.description ?? '',
      start_date: today,
      end_date: endDate,
      duration_days: orig.duration_days,
      created_by: user.id,
      status: 'draft',
      cover_image_url: null,
      upload_config: orig.upload_config ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .select('id')
    .single()

  if (error || !newChallenge) return { error: `Erreur: ${error?.message ?? 'inconnue'}` }

  const newId = (newChallenge as Record<string, unknown>).id as string

  // Clone fields
  const fields = (orig.challenge_fields ?? []) as Array<Record<string, unknown>>
  if (fields.length > 0) {
    await admin.from('challenge_fields').insert(
      fields.map(f => ({
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        order: f.order,
        config: f.config,
        challenge_id: newId,
      }// eslint-disable-next-line @typescript-eslint/no-explicit-any
    )) as any
    )
  }

  refresh()
  return { success: true, challengeId: newId }
}
