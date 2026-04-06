import { requireAdmin } from '@/lib/supabase/require-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MessageSquareQuote, Flame, Trophy, TrendingUp, Check, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { createQuote, deleteQuote } from '@/lib/actions/admin-quotes'

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

      {/* Create form */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
            <Plus size={14} />
            Nouvelle citation
          </h3>
          <form action={async (fd: FormData) => { await createQuote(fd) }} className="space-y-3">
            <Textarea
              name="text"
              label="Texte *"
              placeholder="Entre le texte de la citation..."
              rows={3}
              required
            />
            <Input
              name="author"
              label="Auteur (optionnel)"
              placeholder="Ex: Marcus Aurelius"
            />
            <Select name="context" label="Contexte *" required>
              <option value="daily">Quotidiennes</option>
              <option value="entry_submitted">Apres saisie</option>
              <option value="streak_lost">Streak perdu</option>
              <option value="streak_milestone">Milestone streak</option>
              <option value="rank_up">Montee en rang</option>
            </Select>
            <Button type="submit" size="sm">
              <Plus size={14} className="mr-2" />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

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
                  <form action={async () => {
                    'use server'
                    await deleteQuote(q.id)
                  }}>
                    <Button variant="ghost" size="sm" type="submit" className="text-error hover:text-error flex-shrink-0">
                      <Trash2 size={14} />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
