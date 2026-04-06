import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound, redirect } from 'next/navigation'
import { DailyEntryForm } from '@/components/challenges/daily-entry-form'
import { getTodayUTC, getYesterdayUTC } from '@/lib/utils/dates'
import { Flame } from 'lucide-react'
import { DeleteEntryButton } from '@/components/challenges/delete-entry-button'
import { addDays, format, parseISO, isBefore } from 'date-fns'

type ChallengeWithFields = {
  title: string
  start_date: string
  duration_days: number
  challenge_fields: Array<{
    id: string; name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>
}

export default async function EntryPage(props: PageProps<'/challenges/[id]/entry'>) {
  const { id } = await props.params
  const { supabase, user } = await requireAuth()

  const today = getTodayUTC()
  const yesterday = getYesterdayUTC()

  const challengeQuery = await supabase
    .from('challenges')
    .select('title, start_date, duration_days, challenge_fields(*)')
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(challengeQuery as any).data) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const challenge = (challengeQuery as any).data as ChallengeWithFields

  const [participationRes, existingEntryRes, quotesRes, goalsRes, pastEntriesRes, yesterdayEntryRes, todaySubmittersRes] = await Promise.all([
    supabase.from('challenge_participants').select('id').eq('challenge_id', id).eq('user_id', user.id).single(),
    supabase.from('daily_entries').select('id').eq('challenge_id', id).eq('user_id', user.id).eq('entry_date', today).single(),
    supabase.from('motivational_quotes').select('id, text, author, context'),
    supabase.from('challenge_goals').select('field_id, goal_date, target_value').eq('challenge_id', id).order('goal_date'),
    supabase
      .from('daily_entries')
      .select('entry_date, entry_values(field_id, value_number)')
      .eq('challenge_id', id)
      .eq('user_id', user.id)
      .lt('entry_date', today)
      .order('entry_date'),
    supabase.from('daily_entries').select('id').eq('challenge_id', id).eq('user_id', user.id).eq('entry_date', yesterday).single(),
    supabase.from('daily_entries').select('user_id, profiles(username)').eq('challenge_id', id).eq('entry_date', today),
  ])

  if (!participationRes.data) redirect(`/challenges/${id}`)

  const fields = challenge.challenge_fields.sort((a, b) => a.order - b.order)

  type EntryValue = {
    field_id: string; value_text: string | null; value_number: number | null;
    value_date: string | null; value_file_url: string | null
  }

  let existingValues: EntryValue[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingEntry = (existingEntryRes as any).data as { id: string } | null

  if (existingEntry) {
    const { data: values } = await supabase
      .from('entry_values')
      .select('field_id, value_text, value_number, value_date, value_file_url')
      .eq('entry_id', existingEntry.id)
    existingValues = (values ?? []) as typeof existingValues
  }

  // Fetch yesterday's entry values for quick-fill
  let yesterdayValues: EntryValue[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yesterdayEntry = (yesterdayEntryRes as any).data as { id: string } | null
  if (yesterdayEntry) {
    const { data: yValues } = await supabase
      .from('entry_values')
      .select('field_id, value_text, value_number, value_date, value_file_url')
      .eq('entry_id', yesterdayEntry.id)
    yesterdayValues = (yValues ?? []) as typeof yesterdayValues
  }

  // Today's submitters
  type Submitter = { user_id: string; profiles: { username: string } | null }
  const todaySubmitters = (todaySubmittersRes.data ?? []) as unknown as Submitter[]

  // Compute goals and carry-over per numeric field
  type GoalRow = { field_id: string; goal_date: string; target_value: number }
  type PastEntry = { entry_date: string; entry_values: Array<{ field_id: string; value_number: number | null }> }

  const allGoals = (goalsRes.data ?? []) as unknown as GoalRow[]
  const pastEntries = (pastEntriesRes.data ?? []) as unknown as PastEntry[]

  const numericFields = fields.filter(f => f.type === 'number')

  const goalInfos = numericFields.map(field => {
    const fieldGoals = allGoals.filter(g => g.field_id === field.id)
    if (fieldGoals.length === 0) return { fieldId: field.id, todayTarget: null, carryOver: 0 }

    // Today's goal
    const todayGoal = fieldGoals.find(g => g.goal_date === today)
    const todayTarget = todayGoal?.target_value ?? null

    // Calculate carry-over: sum of (target - actual) for past days where target > actual
    let carryOver = 0
    for (const goal of fieldGoals) {
      if (goal.goal_date >= today) continue // only past days
      const entry = pastEntries.find(e => e.entry_date === goal.goal_date)
      const actual = entry?.entry_values?.find(v => v.field_id === field.id)?.value_number ?? 0
      const deficit = goal.target_value - actual
      if (deficit > 0) carryOver += deficit
    }

    return { fieldId: field.id, todayTarget, carryOver: Math.round(carryOver * 100) / 100 }
  })

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 mb-4">
          <Flame size={14} className="text-accent-green" />
          <span className="text-xs font-black uppercase tracking-wider text-accent-green">
            {existingValues.length > 0 ? 'Modifier' : 'Saisie du jour'}
          </span>
        </div>
        <h2 className="text-3xl font-black tracking-tight">{challenge.title}</h2>
        <p className="text-text-muted text-sm mt-2">
          {existingValues.length > 0 ? 'Modifie ta saisie du jour' : 'Remplis tes donnees et valide. 30 secondes top chrono.'}
        </p>
      </div>

      <div className="text-center text-sm text-text-muted">
        {todaySubmitters.length > 0 ? (
          <span><span className="text-accent-green font-bold">{todaySubmitters.length}</span> participant{todaySubmitters.length > 1 ? 's' : ''} ont deja saisi aujourd'hui</span>
        ) : (
          <span>Sois le premier a saisir aujourd'hui !</span>
        )}
      </div>

      <DailyEntryForm
        challengeId={id}
        fields={fields}
        existingValues={existingValues}
        yesterdayValues={yesterdayValues}
        quotes={quotesRes.data ?? []}
        goals={goalInfos}
      />

      {existingValues.length > 0 && (
        <div className="flex justify-center pt-2 pb-4">
          <DeleteEntryButton challengeId={id} />
        </div>
      )}
    </div>
  )
}
