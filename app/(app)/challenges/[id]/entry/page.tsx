import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound, redirect } from 'next/navigation'
import { DailyEntryForm } from '@/components/challenges/daily-entry-form'
import { getTodayUTC } from '@/lib/utils/dates'

type ChallengeWithFields = {
  title: string
  challenge_fields: Array<{
    id: string; name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>
}

export default async function EntryPage(props: PageProps<'/challenges/[id]/entry'>) {
  const { id } = await props.params
  const { supabase, user } = await requireAuth()

  const today = getTodayUTC()

  // Fetch challenge separately to avoid Promise.all type inference issue with joins
  const challengeQuery = await supabase
    .from('challenges')
    .select('title, challenge_fields(*)')
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(challengeQuery as any).data) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const challenge = (challengeQuery as any).data as ChallengeWithFields

  const [participationRes, existingEntryRes, quotesRes] = await Promise.all([
    supabase.from('challenge_participants').select('id').eq('challenge_id', id).eq('user_id', user.id).single(),
    supabase.from('daily_entries').select('id').eq('challenge_id', id).eq('user_id', user.id).eq('entry_date', today).single(),
    supabase.from('motivational_quotes').select('*'),
  ])

  if (!participationRes.data) redirect(`/challenges/${id}`)

  const fields = challenge.challenge_fields.sort((a, b) => a.order - b.order)

  let existingValues: Array<{
    field_id: string; value_text: string | null; value_number: number | null;
    value_date: string | null; value_file_url: string | null
  }> = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingEntry = (existingEntryRes as any).data as { id: string } | null

  if (existingEntry) {
    const { data: values } = await supabase
      .from('entry_values')
      .select('field_id, value_text, value_number, value_date, value_file_url')
      .eq('entry_id', existingEntry.id)

    existingValues = (values ?? []) as typeof existingValues
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-black">{challenge.title}</h2>
      <p className="text-text-muted text-sm">
        {existingValues.length > 0 ? 'Modifier la saisie du jour' : 'Saisie du jour'}
      </p>

      <DailyEntryForm
        challengeId={id}
        fields={fields}
        existingValues={existingValues}
        quotes={quotesRes.data ?? []}
      />
    </div>
  )
}
