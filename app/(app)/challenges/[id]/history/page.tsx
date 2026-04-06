import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar } from 'lucide-react'

export default async function HistoryPage(props: PageProps<'/challenges/[id]/history'>) {
  const { id } = await props.params
  const { supabase, user } = await requireAuth()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('title, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challenge) notFound()

  const { data: entries } = await supabase
    .from('daily_entries')
    .select('id, entry_date, entry_values(field_id, value_text, value_number, value_date, value_file_url)')
    .eq('challenge_id', id)
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  const fields = challenge.challenge_fields as unknown as Array<{ id: string; label: string; type: string; order: number }>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">{challenge.title}</h2>
      <p className="text-text-muted text-sm">Mon historique — {(entries ?? []).length} saisies</p>

      {(entries ?? []).length === 0 && (
        <EmptyState
          icon={<Calendar size={48} />}
          title="Aucune saisie pour le moment"
          description="Commence par remplir ta premiere journee !"
        />
      )}

      <div className="space-y-3">
        {(entries ?? []).map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="text-sm font-bold text-accent-green mb-2">
                {format(parseISO(entry.entry_date), 'EEEE d MMMM yyyy', { locale: fr })}
              </div>
              <div className="grid gap-1">
                {fields.sort((a, b) => a.order - b.order).map(f => {
                  const val = (entry.entry_values as unknown as Array<{
                    field_id: string; value_text: string | null; value_number: number | null;
                    value_date: string | null; value_file_url: string | null
                  }>).find(v => v.field_id === f.id)
                  const display = val?.value_number ?? val?.value_text ?? val?.value_date ?? '—'
                  return (
                    <div key={f.id} className="flex justify-between text-sm">
                      <span className="text-text-muted">{f.label}</span>
                      <span className="text-white font-semibold">{String(display)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
