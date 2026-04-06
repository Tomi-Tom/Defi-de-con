'use server'

import { requireAuthAction } from '@/lib/supabase/require-auth'
import { refresh } from 'next/cache'
import { submitEntrySchema, type SubmitEntryInput } from '@/lib/validations/entries'
import { getTodayUTC, getYesterdayUTC } from '@/lib/utils/dates'
import { awardPoints } from './points'
import { checkAndAwardBadges } from './badges'

export type EntryResult = {
  success?: boolean
  error?: string
  pointsAwarded?: number
  pointsPenalty?: number
  goalsCatchup?: boolean
  goalsPerfect?: boolean
  newBadges?: Array<{ name: string; iconUrl: string }>
  streakMilestone?: boolean
  currentStreak?: number
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

  // Check if already submitted today (upsert mode)
  const { data: existingEntry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .single()

  let entryId: string

  if (existingEntry) {
    // Update existing entry values (batch upsert)
    entryId = existingEntry.id
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

    refresh()
    return { success: true, currentStreak: participation.current_streak }
  }

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

  // Calculate streak and check first entry in parallel
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

  const newStreak = yesterdayEntry ? participation.current_streak + 1 : 1
  const bestStreak = Math.max(newStreak, participation.best_streak)
  const isFirstEntry = count === 1

  const { error: updateError } = await supabase
    .from('challenge_participants')
    .update({ current_streak: newStreak, best_streak: bestStreak })
    .eq('id', participation.id)
  if (updateError) return { error: updateError.message }

  // Evaluate goals for this entry
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
    // Fetch past deficit for each field
    const { data: pastGoals } = await supabase
      .from('challenge_goals')
      .select('field_id, goal_date, target_value')
      .eq('challenge_id', challenge_id)
      .lt('goal_date', today)

    const { data: pastEntries } = await supabase
      .from('daily_entries')
      .select('entry_date, entry_values(field_id, value_number)')
      .eq('challenge_id', challenge_id)
      .eq('user_id', user.id)
      .lt('entry_date', today)

    type PastGoal = { field_id: string; goal_date: string; target_value: number }
    type PastEntry = { entry_date: string; entry_values: Array<{ field_id: string; value_number: number | null }> }
    const allPastGoals = (pastGoals ?? []) as unknown as PastGoal[]
    const allPastEntries = (pastEntries ?? []) as unknown as PastEntry[]

    goalEvaluations = goalsForToday.map(g => {
      // Find actual value submitted today
      const todayVal = values.find(v => v.field_id === g.field_id)
      const actualValue = todayVal?.value_number ?? 0

      // Check if there was prior deficit on this field
      let priorDeficit = 0
      for (const pg of allPastGoals.filter(pg => pg.field_id === g.field_id)) {
        const entry = allPastEntries.find(e => e.entry_date === pg.goal_date)
        const actual = entry?.entry_values?.find(v => v.field_id === g.field_id)?.value_number ?? 0
        const diff = pg.target_value - actual
        if (diff > 0) priorDeficit += diff
      }

      return {
        fieldId: g.field_id,
        targetValue: g.target_value,
        actualValue,
        hadPriorDeficit: priorDeficit > 0,
      }
    })
  }

  // Award points
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

  const streakMilestone = awards.some(a => a.action.startsWith('streak_'))
  const pointsPenalty = awards.filter(a => a.points < 0).reduce((s, a) => s + a.points, 0)
  const goalsCatchup = awards.some(a => a.action === 'goal_catchup')
  const goalsPerfect = awards.some(a => a.action === 'goal_perfect')

  refresh()

  return {
    success: true,
    pointsAwarded: totalAwarded,
    pointsPenalty,
    goalsCatchup,
    goalsPerfect,
    newBadges,
    streakMilestone,
    currentStreak: newStreak,
  }
}
