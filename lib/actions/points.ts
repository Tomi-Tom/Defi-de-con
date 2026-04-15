'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { POINTS, STREAK_MILESTONES } from '@/lib/utils/points'

interface GoalEvaluation {
  fieldId: string
  targetValue: number
  actualValue: number
  hadPriorDeficit: boolean // was there accumulated deficit before today?
}

interface AwardPointsParams {
  userId: string
  challengeId: string
  entryId: string
  currentStreak: number
  isFirstEntry: boolean
  goalEvaluations?: GoalEvaluation[]
}

export async function awardPoints({ userId, challengeId, entryId, currentStreak, isFirstEntry, goalEvaluations }: AwardPointsParams) {
  const admin = createAdminClient()
  let totalAwarded = 0
  const awards: Array<{ action: string; points: number }> = []

  // Daily entry points (base)
  awards.push({ action: 'daily_entry', points: POINTS.DAILY_ENTRY })
  totalAwarded += POINTS.DAILY_ENTRY

  // Streak daily bonus (+1 per entry when streak >= 3)
  if (currentStreak >= 3) {
    awards.push({ action: 'streak_daily_bonus', points: POINTS.STREAK_DAILY_BONUS })
    totalAwarded += POINTS.STREAK_DAILY_BONUS
  }

  // Streak milestone bonuses
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak === milestone.days) {
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

  // Goal-based points (only if challenge has goals set)
  if (goalEvaluations && goalEvaluations.length > 0) {
    let missedCount = 0
    let catchupCount = 0
    let allMet = true

    for (const ge of goalEvaluations) {
      const diff = ge.actualValue - ge.targetValue

      if (diff < 0) {
        // Goal not met — penalty
        missedCount++
        allMet = false
      } else if (diff > 0 && ge.hadPriorDeficit) {
        // Exceeded goal AND had prior deficit — catchup bonus
        catchupCount++
      }
    }

    // Apply penalties
    if (missedCount > 0) {
      const penalty = missedCount * POINTS.GOAL_MISSED_PENALTY // negative number
      awards.push({ action: 'goal_missed', points: penalty })
      totalAwarded += penalty
    }

    // Apply catchup bonuses
    if (catchupCount > 0) {
      const bonus = catchupCount * POINTS.GOAL_CATCHUP_BONUS
      awards.push({ action: 'goal_catchup', points: bonus })
      totalAwarded += bonus
    }

    // Perfect day bonus (all goals met or exceeded)
    if (allMet && goalEvaluations.length > 0) {
      awards.push({ action: 'goal_perfect', points: POINTS.GOAL_PERFECT_BONUS })
      totalAwarded += POINTS.GOAL_PERFECT_BONUS
    }
  }

  // Ensure total doesn't go below 0 for this entry
  // (we don't want a single entry to result in negative total)
  totalAwarded = Math.max(totalAwarded, 0)

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await admin.rpc('increment_points' as any, {
      p_user_id: userId,
      p_challenge_id: challengeId,
      p_points: totalAwarded,
    })
  }

  return { totalAwarded, awards }
}
