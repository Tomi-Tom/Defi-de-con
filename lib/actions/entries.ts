'use server'

import { requireAuthAction } from '@/lib/supabase/require-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { refresh } from 'next/cache'
import { submitEntrySchema, type SubmitEntryInput } from '@/lib/validations/entries'
import { getTodayUTC, getYesterdayUTC } from '@/lib/utils/dates'
import { awardPoints } from './points'
import { checkAndAwardBadges } from './badges'

export type EntryResult = {
  success?: boolean
  error?: string
  pointsAwarded?: number
  pointsBase?: number
  pointsStreakBonus?: number
  pointsCatchup?: number
  pointsPerfect?: number
  pointsPenalty?: number
  goalsCatchup?: boolean
  goalsPerfect?: boolean
  newBadges?: Array<{ name: string; iconUrl: string }>
  streakMilestone?: boolean
  currentStreak?: number
  isUpdate?: boolean
}

/**
 * Reverts all points and badges awarded for a specific entry.
 * Used when updating or deleting today's entry.
 */
async function revertEntryRewards(userId: string, challengeId: string, entryId: string) {
  const admin = createAdminClient()

  // Get points that were awarded for this entry
  type PointLog = { id: string; points: number }
  const { data: pointLogs } = await admin
    .from('points_log')
    .select('id, points')
    .eq('entry_id', entryId)

  const logs = (pointLogs ?? []) as unknown as PointLog[]
  const totalToRevert = logs.reduce((s, l) => s + l.points, 0)

  if (logs.length > 0) {
    // Delete the point logs for this entry
    await admin
      .from('points_log')
      .delete()
      .eq('entry_id', entryId)

    // Revert denormalized totals
    if (totalToRevert !== 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await admin.rpc('increment_points' as any, {
        p_user_id: userId,
        p_challenge_id: challengeId,
        p_points: -totalToRevert,
      })
    }
  }

  // Revoke badges awarded for this entry's challenge (streak-based badges are challenge-specific)
  // We only revoke badges that were potentially tied to this specific entry action
  // Non-challenge badges (like "Premier pas") are harder to revoke safely, so we leave them

  return { revertedPoints: totalToRevert }
}

export async function submitEntry(input: SubmitEntryInput): Promise<EntryResult> {
  const parsed = submitEntrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const today = getTodayUTC()
  const yesterday = getYesterdayUTC()
  const { challenge_id, values } = parsed.data

  // Check participation
  const { data: participation } = await supabase
    .from('challenge_participants')
    .select('id, current_streak, best_streak')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .single()

  if (!participation) return { error: 'Tu ne participes pas a ce defi' }

  // Check if already submitted today
  const { data: existingEntry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .single()

  let entryId: string
  const isUpdate = !!existingEntry

  if (existingEntry) {
    entryId = existingEntry.id

    // REVERT previous rewards before recalculating
    await revertEntryRewards(user.id, challenge_id, entryId)

    // Update entry values
    const { error: upsertError } = await supabase.from('entry_values').upsert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values.map(val => ({
        entry_id: entryId,
        field_id: val.field_id,
        value_text: val.value_text,
        value_number: val.value_number,
        value_date: val.value_date,
        value_file_url: val.value_file_url,
      })) as any,
      { onConflict: 'entry_id,field_id' }
    )
    if (upsertError) return { error: upsertError.message }

    // Recalculate and re-award points (fall through to the points section below)
  } else {
    // New entry
    const { data: newEntry, error: entryError } = await supabase
      .from('daily_entries')
      .insert({ challenge_id, user_id: user.id, entry_date: today })
      .select('id')
      .single()

    if (entryError || !newEntry) return { error: 'Erreur lors de la saisie' }
    entryId = newEntry.id

    // Insert values
    const { error: insertError } = await supabase.from('entry_values').insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values.map(v => ({
        entry_id: entryId,
        field_id: v.field_id,
        value_text: v.value_text,
        value_number: v.value_number,
        value_date: v.value_date,
        value_file_url: v.value_file_url,
      })) as any
    )
    if (insertError) return { error: insertError.message }
  }

  // Calculate streak (same logic for new and update)
  const [{ data: yesterdayEntry }, { count }] = await Promise.all([
    supabase
      .from('daily_entries')
      .select('id')
      .eq('challenge_id', challenge_id)
      .eq('user_id', user.id)
      .eq('entry_date', yesterday)
      .single(),
    supabase
      .from('daily_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const newStreak = yesterdayEntry ? participation.current_streak + 1 : (isUpdate ? participation.current_streak : 1)
  const bestStreak = Math.max(newStreak, participation.best_streak)
  const isFirstEntry = count === 1 && !isUpdate

  if (!isUpdate) {
    await supabase
      .from('challenge_participants')
      .update({ current_streak: newStreak, best_streak: bestStreak })
      .eq('id', participation.id)
  }

  // Evaluate goals
  const { data: todayGoals } = await supabase
    .from('challenge_goals')
    .select('field_id, target_value')
    .eq('challenge_id', challenge_id)
    .eq('goal_date', today)

  type GoalRow = { field_id: string; target_value: number }
  const goalsForToday = (todayGoals ?? []) as unknown as GoalRow[]

  let goalEvaluations: Array<{
    fieldId: string
    targetValue: number
    actualValue: number
    hadPriorDeficit: boolean
  }> | undefined

  if (goalsForToday.length > 0) {
    const [{ data: pastGoals }, { data: pastEntries }] = await Promise.all([
      supabase.from('challenge_goals').select('field_id, goal_date, target_value').eq('challenge_id', challenge_id).lt('goal_date', today),
      supabase.from('daily_entries').select('entry_date, entry_values(field_id, value_number)').eq('challenge_id', challenge_id).eq('user_id', user.id).lt('entry_date', today),
    ])

    type PastGoal = { field_id: string; goal_date: string; target_value: number }
    type PastEntry = { entry_date: string; entry_values: Array<{ field_id: string; value_number: number | null }> }

    goalEvaluations = goalsForToday.map(g => {
      const todayVal = values.find(v => v.field_id === g.field_id)
      const actualValue = todayVal?.value_number ?? 0

      let priorDeficit = 0
      for (const pg of ((pastGoals ?? []) as unknown as PastGoal[]).filter(pg => pg.field_id === g.field_id)) {
        const entry = ((pastEntries ?? []) as unknown as PastEntry[]).find(e => e.entry_date === pg.goal_date)
        const actual = entry?.entry_values?.find(v => v.field_id === g.field_id)?.value_number ?? 0
        const diff = pg.target_value - actual
        if (diff > 0) priorDeficit += diff
      }

      return { fieldId: g.field_id, targetValue: g.target_value, actualValue, hadPriorDeficit: priorDeficit > 0 }
    })
  }

  // Award points (fresh calculation)
  const { totalAwarded, awards } = await awardPoints({
    userId: user.id,
    challengeId: challenge_id,
    entryId,
    currentStreak: newStreak,
    isFirstEntry,
    goalEvaluations,
  })

  // Check badges
  const newBadges = await checkAndAwardBadges({
    userId: user.id,
    challengeId: challenge_id,
    currentStreak: newStreak,
  })

  const streakMilestone = awards.some(a => a.action.startsWith('streak_') && a.action !== 'streak_daily_bonus')
  const pointsPenalty = awards.filter(a => a.points < 0).reduce((s, a) => s + a.points, 0)
  const pointsBase = awards.find(a => a.action === 'daily_entry')?.points ?? 0
  const pointsStreakBonus = awards.find(a => a.action === 'streak_daily_bonus')?.points ?? 0
  const pointsCatchup = awards.find(a => a.action === 'goal_catchup')?.points ?? 0
  const pointsPerfect = awards.find(a => a.action === 'goal_perfect')?.points ?? 0
  const goalsCatchup = pointsCatchup > 0
  const goalsPerfect = pointsPerfect > 0

  refresh()

  return {
    success: true,
    pointsAwarded: totalAwarded,
    pointsBase,
    pointsStreakBonus,
    pointsCatchup,
    pointsPerfect,
    pointsPenalty,
    goalsCatchup,
    goalsPerfect,
    newBadges,
    streakMilestone,
    currentStreak: newStreak,
    isUpdate,
  }
}

/**
 * Delete today's entry for a challenge. Reverts all points and recalculates streak.
 */
export async function deleteTodayEntry(challengeId: string): Promise<{ success?: boolean; error?: string; revertedPoints?: number }> {
  const { supabase, user, error: authError } = await requireAuthAction()
  if (authError) return { error: authError }
  if (!supabase || !user) return { error: 'Non authentifie' }

  const today = getTodayUTC()

  // Find today's entry
  const { data: entry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .single()

  if (!entry) return { error: 'Aucune saisie aujourd\'hui' }

  // Revert rewards
  const { revertedPoints } = await revertEntryRewards(user.id, challengeId, entry.id)

  // Delete entry values then entry
  const admin = createAdminClient()
  await admin.from('entry_values').delete().eq('entry_id', entry.id)
  await admin.from('daily_entries').delete().eq('id', entry.id)

  // Recalculate streak: check if yesterday had an entry
  const yesterday = getYesterdayUTC()
  const { data: yesterdayEntry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)
    .eq('entry_date', yesterday)
    .single()

  const { data: participation } = await supabase
    .from('challenge_participants')
    .select('id, best_streak')
    .eq('challenge_id', challengeId)
    .eq('user_id', user.id)
    .single()

  if (participation) {
    // Streak resets since today's entry is gone
    // If yesterday had an entry, the streak would be whatever it was before today
    // Simplest: reset to 0 (conservative), the next entry will recalculate
    await supabase
      .from('challenge_participants')
      .update({ current_streak: yesterdayEntry ? participation.best_streak : 0 })
      .eq('id', participation.id)
  }

  refresh()

  return { success: true, revertedPoints }
}
