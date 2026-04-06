import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound, redirect } from 'next/navigation'
import { DailyEntryForm } from '@/components/challenges/daily-entry-form'
import { getTodayUTC } from '@/lib/utils/dates'
import { Flame } from 'lucide-react'

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
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      {/* Hero section */}
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

      <DailyEntryForm
        challengeId={id}
        fields={fields}
        existingValues={existingValues}
        quotes={quotesRes.data ?? []}
      />
    </div>
  )
}
