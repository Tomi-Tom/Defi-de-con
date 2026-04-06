'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface CheckBadgesParams {
  userId: string
  challengeId: string
  currentStreak: number
}

export async function checkAndAwardBadges({ userId, challengeId, currentStreak }: CheckBadgesParams) {
  const admin = createAdminClient()
  const newBadges: Array<{ name: string; iconUrl: string }> = []

  type Badge = {
    id: string; name: string; icon_url: string
    condition_type: string; condition_value: number
  }

  // Get all badge definitions
  const { data: badgesRaw } = await admin.from('badges').select('*')
  if (!badgesRaw) return newBadges
  const badges = badgesRaw as unknown as Badge[]

  // Get user's existing badges
  const { data: userBadgesRaw } = await admin
    .from('user_badges')
    .select('badge_id, challenge_id')
    .eq('user_id', userId)

  const userBadges = (userBadgesRaw ?? []) as unknown as Array<{ badge_id: string; challenge_id: string | null }>

  const existingBadgeKeys = new Set(
    userBadges.map(ub => `${ub.badge_id}-${ub.challenge_id ?? 'null'}`)
  )

  // Check first entry ever (Premier pas)
  const firstEntryBadge = badges.find(b => b.name === 'Premier pas')
  if (firstEntryBadge && !existingBadgeKeys.has(`${firstEntryBadge.id}-null`)) {
    const { count } = await admin
      .from('daily_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count === 1) {
      await admin.from('user_badges').insert({
        user_id: userId,
        badge_id: firstEntryBadge.id,
        challenge_id: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      newBadges.push({ name: firstEntryBadge.name, iconUrl: firstEntryBadge.icon_url })
    }
  }

  // Check streak badges
  const streakBadges = badges.filter(b => b.condition_type === 'streak')
  for (const badge of streakBadges) {
    const key = `${badge.id}-${challengeId}`
    if (currentStreak >= badge.condition_value && !existingBadgeKeys.has(key)) {
      await admin.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
        challenge_id: challengeId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      newBadges.push({ name: badge.name, iconUrl: badge.icon_url })
    }
  }

  // Check Challenger badge (joined 5 challenges)
  const challengerBadge = badges.find(b => b.name === 'Challenger')
  if (challengerBadge && !existingBadgeKeys.has(`${challengerBadge.id}-null`)) {
    const { count } = await admin
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count >= 5) {
      await admin.from('user_badges').insert({
        user_id: userId,
        badge_id: challengerBadge.id,
        challenge_id: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      newBadges.push({ name: challengerBadge.name, iconUrl: challengerBadge.icon_url })
    }
  }

  return newBadges
}
