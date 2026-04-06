import { requireAdmin } from '@/lib/supabase/require-auth'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquareQuote, Flame, Trophy, TrendingUp, Check, AlertTriangle } from 'lucide-react'

const contextConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  daily: { label: 'Quotidiennes', icon: MessageSquareQuote, color: 'text-accent-green', bg: 'bg-accent-green/10' },
  entry_submitted: { label: 'Apres saisie', icon: Check, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  streak_lost: { label: 'Streak perdu', icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
  streak_milestone: { label: 'Milestone streak', icon: Flame, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
  rank_up: { label: 'Montee en rang', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
}

export default async function AdminQuotesPage() {
  const { supabase } = await requireAdmin()
  const { data: quotes } = await supabase.from('motivational_quotes').select('id, text, author, context').order('context')

  type Quote = NonNullable<typeof quotes>[number]
  const grouped = (quotes ?? []).reduce((acc, q) => {
    if (!acc[q.context]) acc[q.context] = []
    acc[q.context]!.push(q)
    return acc
  }, {} as Record<string, Quote[]>)

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-black flex items-center gap-2">
          <MessageSquareQuote size={28} className="text-purple-400" />
          Citations
        </h2>
        <p className="text-text-muted text-sm mt-1">{(quotes ?? []).length} citations motivantes en base.</p>
      </div>

      {Object.entries(grouped).map(([context, contextQuotes]) => {
        const config = contextConfig[context] ?? { label: context, icon: MessageSquareQuote, color: 'text-text-muted', bg: 'bg-bg-tertiary' }
        return (
          <div key={context}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                <config.icon size={14} className={config.color} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">{config.label}</h3>
              <span className="text-xs text-text-muted">({(contextQuotes ?? []).length})</span>
            </div>
            <div className="space-y-2">
              {(contextQuotes ?? []).map(q => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-border hover:border-border/60 transition-all">
                  <MessageSquareQuote size={14} className={`${config.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="text-sm text-white italic leading-relaxed">{q.text}</p>
                    {q.author && <p className="text-xs text-text-muted mt-1 font-semibold">— {q.author}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
