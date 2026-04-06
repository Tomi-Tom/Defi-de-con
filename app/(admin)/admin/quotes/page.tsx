import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export default async function AdminQuotesPage() {
  const supabase = await createClient()
  const { data: quotes } = await supabase.from('motivational_quotes').select('*').order('context')

  type Quote = NonNullable<typeof quotes>[number]
  const grouped = (quotes ?? []).reduce((acc, q) => {
    if (!acc[q.context]) acc[q.context] = []
    acc[q.context]!.push(q)
    return acc
  }, {} as Record<string, Quote[]>)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Admin — Citations</h2>
      {Object.entries(grouped).map(([context, contextQuotes]) => (
        <div key={context}>
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-3">{context}</h3>
          <div className="space-y-2">
            {(contextQuotes ?? []).map(q => (
              <Card key={q.id}>
                <CardContent className="p-3">
                  <p className="text-sm text-white italic">&quot;{q.text}&quot;</p>
                  {q.author && <p className="text-xs text-text-muted mt-1">— {q.author}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
