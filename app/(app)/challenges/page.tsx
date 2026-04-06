import { requireAuth } from '@/lib/supabase/require-auth'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import { Trophy, Flame } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { differenceInDays, parseISO } from 'date-fns'

export default async function ChallengesPage(props: PageProps<'/challenges'>) {
  const searchParams = await props.searchParams
  const tab = (searchParams?.tab as string) ?? 'active'
  const { supabase } = await requireAuth()

  type ChallengeWithCount = {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    duration_days: number
    status: string
    challenge_participants: Array<{ count: number }>
  }

  const { data: challengesRaw } = await supabase
    .from('challenges')
    .select('*, challenge_participants(count)')
    .eq('status', (tab === 'upcoming' ? 'draft' : tab) as 'draft' | 'active' | 'completed')
    .order('start_date', { ascending: false })

  const challenges = (challengesRaw ?? []) as unknown as ChallengeWithCount[]

  // Get counts for tabs
  const [activeCount, completedCount] = await Promise.all([
    supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      {/* Hero header */}
      <div className="text-center py-4">
        <h2 className="text-4xl font-black tracking-tight">
          LES <span className="text-accent-green">DEFIS</span>
        </h2>
        <p className="text-text-muted mt-2">Choisis ton combat. Prouve ta valeur.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {[
          { key: 'active', label: 'En cours', icon: Flame, count: activeCount.count ?? 0 },
          { key: 'completed', label: 'Termines', icon: Trophy, count: completedCount.count ?? 0 },
        ].map((t) => (
          <a
            key={t.key}
            href={`/challenges?tab=${t.key}`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
              ${tab === t.key
                ? 'bg-accent-green text-black shadow-[0_0_20px_rgba(0,255,135,0.3)]'
                : 'bg-bg-secondary text-text-muted hover:text-white hover:bg-bg-tertiary border border-border'}`}
          >
            <t.icon size={16} />
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-black/20 text-black' : 'bg-bg-tertiary text-text-muted'}`}>
              {t.count}
            </span>
          </a>
        ))}
      </div>

      {/* Challenge grid */}
      {challenges.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {challenges.map((c, i) => {
            const elapsed = differenceInDays(new Date(), parseISO(c.start_date)) + 1
            const progress = Math.min(100, Math.round((elapsed / c.duration_days) * 100))
            return (
              <div key={c.id} className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}>
                <ChallengeCard
                  id={c.id}
                  title={c.title}
                  description={c.description}
                  startDate={c.start_date}
                  endDate={c.end_date}
                  status={c.status}
                  participantCount={c.challenge_participants[0]?.count ?? 0}
                  progress={c.status === 'active' ? progress : undefined}
                  durationDays={c.duration_days}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={tab === 'active' ? <Flame size={56} /> : <Trophy size={56} />}
          title={tab === 'active' ? 'Aucun defi en cours' : 'Aucun defi termine'}
          description={tab === 'active' ? 'Les prochains defis arrivent bientot. Reste pret.' : 'Les premiers defis sont en cours, patience.'}
        />
      )}
    </div>
  )
}
