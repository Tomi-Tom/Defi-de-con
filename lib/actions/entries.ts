'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'
import { submitEntrySchema, type SubmitEntryInput } from '@/lib/validations/entries'
import { getTodayUTC, getYesterdayUTC } from '@/lib/utils/dates'
import { awardPoints } from './points'
import { checkAndAwardBadges } from './badges'

export type EntryResult = {
  success?: boolean
  error?: string
  pointsAwarded?: number
  newBadges?: Array<{ name: string; iconUrl: string }>
  streakMilestone?: boolean
  currentStreak?: number
}

export async function submitEntry(input: SubmitEntryInput): Promise<EntryResult> {
  const parsed = submitEntrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifie' }

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
    // Update existing entry values
    entryId = existingEntry.id
    for (const val of values) {
      await supabase
        .from('entry_values')
        .upsert({
          entry_id: entryId,
          field_id: val.field_id,
          value_text: val.value_text,
          value_number: val.value_number,
          value_date: val.value_date,
          value_file_url: val.value_file_url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any, { onConflict: 'entry_id,field_id' })
    }

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
  await supabase.from('entry_values').insert(
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

  // Calculate streak
  const { data: yesterdayEntry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('challenge_id', challenge_id)
    .eq('user_id', user.id)
    .eq('entry_date', yesterday)
    .single()

  const newStreak = yesterdayEntry ? participation.current_streak + 1 : 1
  const bestStreak = Math.max(newStreak, participation.best_streak)

  await supabase
    .from('challenge_participants')
    .update({ current_streak: newStreak, best_streak: bestStreak })
    .eq('id', participation.id)

  // Check if first entry ever
  const { count } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const isFirstEntry = count === 1

  // Award points
  const { totalAwarded, awards } = await awardPoints({
    userId: user.id,
    challengeId: challenge_id,
    entryId,
    currentStreak: newStreak,
    isFirstEntry,
  })

  // Check badges
  const newBadges = await checkAndAwardBadges({
    userId: user.id,
    challengeId: challenge_id,
    currentStreak: newStreak,
  })

  const streakMilestone = awards.some(a => a.action.startsWith('streak_'))

  refresh()

  return {
    success: true,
    pointsAwarded: totalAwarded,
    newBadges,
    streakMilestone,
    currentStreak: newStreak,
  }
}
