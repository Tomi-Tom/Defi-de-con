'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdminAction } from '@/lib/supabase/require-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { refresh } from 'next/cache'

export type GoalRow = {
  field_id: string
  goal_date: string
  target_value: number
}

export async function importGoals(challengeId: string, goals: GoalRow[]) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const admin = createAdminClient()

  // Delete existing goals for this challenge
  await admin.from('challenge_goals').delete().eq('challenge_id', challengeId)

  // Insert new goals
  if (goals.length > 0) {
    const rows = goals.map(g => ({
      challenge_id: challengeId,
      field_id: g.field_id,
      goal_date: g.goal_date,
      target_value: g.target_value,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await admin.from('challenge_goals').insert(rows as any)
    if (error) return { error: `Erreur import: ${error.message}` }
  }

  refresh()
  return { success: true, count: goals.length }
}

export async function getGoalsForChallenge(challengeId: string) {
  const supabase = await createClient()

  type Goal = { field_id: string; goal_date: string; target_value: number }
  const { data } = await supabase
    .from('challenge_goals')
    .select('field_id, goal_date, target_value')
    .eq('challenge_id', challengeId)
    .order('goal_date')

  return (data ?? []) as unknown as Goal[]
}
