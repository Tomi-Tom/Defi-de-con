'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { POINTS, STREAK_MILESTONES } from '@/lib/utils/points'

interface AwardPointsParams {
  userId: string
  challengeId: string
  entryId: string
  currentStreak: number
  isFirstEntry: boolean
}

export async function awardPoints({ userId, challengeId, entryId, currentStreak, isFirstEntry }: AwardPointsParams) {
  const admin = createAdminClient()
  let totalAwarded = 0
  const awards: Array<{ action: string; points: number }> = []

  // Daily entry points
  awards.push({ action: 'daily_entry', points: POINTS.DAILY_ENTRY })
  totalAwarded += POINTS.DAILY_ENTRY

  // First entry bonus
  if (isFirstEntry) {
    awards.push({ action: 'first_entry', points: POINTS.FIRST_ENTRY })
    totalAwarded += POINTS.FIRST_ENTRY
  }

  // Streak bonuses
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak === milestone.days) {
      // Check not already awarded
      const { data: existing } = await admin
        .from('points_log')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .eq('action', milestone.action)
        .limit(1)

      if (!existing || existing.length === 0) {
        awards.push({ action: milestone.action, points: milestone.points })
        totalAwarded += milestone.points
      }
    }
  }

  // Insert all point logs
  if (awards.length > 0) {
    await admin.from('points_log').insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      awards.map(a => ({
        user_id: userId,
        challenge_id: challengeId,
        entry_id: entryId,
        action: a.action,
        points: a.points,
      })) as any
    )

    // Update denormalized totals
    await admin.rpc('increment_points' as any, {
      p_user_id: userId,
      p_challenge_id: challengeId,
      p_points: totalAwarded,
    })
  }

  return { totalAwarded, awards }
}
