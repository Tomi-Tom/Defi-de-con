'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { refresh } from 'next/cache'

export async function createBadge(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'Non autorise' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const icon_url = (formData.get('icon_url') as string) || '/badges/default.svg'
  const condition_type = formData.get('condition_type') as string
  const condition_value = Number(formData.get('condition_value')) || 0

  if (!name || !condition_type) return { error: 'Nom et type de condition requis' }

  const admin = createAdminClient()
  const { error } = await admin.from('badges').insert({
    name,
    description: description || '',
    icon_url,
    condition_type,
    condition_value,
  } as any)

  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function deleteBadge(badgeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'Non autorise' }

  const admin = createAdminClient()
  const { error } = await admin.from('badges').delete().eq('id', badgeId)
  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function awardBadgeToUser(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'Non autorise' }

  const badge_id = formData.get('badge_id') as string
  const user_id = formData.get('user_id') as string
  const challenge_id = (formData.get('challenge_id') as string) || null

  if (!badge_id || !user_id) return { error: 'Badge et utilisateur requis' }

  const admin = createAdminClient()

  // Check if already awarded
  let query = admin
    .from('user_badges')
    .select('id')
    .eq('user_id', user_id)
    .eq('badge_id', badge_id)

  if (challenge_id) {
    query = query.eq('challenge_id', challenge_id)
  } else {
    query = query.is('challenge_id', null)
  }

  const { data: existing } = await query.limit(1)
  if (existing && existing.length > 0) return { error: 'Badge deja attribue a cet utilisateur' }

  const { error } = await admin.from('user_badges').insert({
    user_id,
    badge_id,
    challenge_id,
  } as any)

  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}

export async function revokeBadgeFromUser(userBadgeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!profile?.is_admin) return { error: 'Non autorise' }

  const admin = createAdminClient()
  const { error } = await admin.from('user_badges').delete().eq('id', userBadgeId)
  if (error) return { error: `Erreur: ${error.message}` }

  refresh()
  return { success: true }
}
