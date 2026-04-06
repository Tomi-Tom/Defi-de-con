import { createClient } from '@/lib/supabase/server'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import { Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default async function ChallengesPage(props: PageProps<'/challenges'>) {
  const searchParams = await props.searchParams
  const tab = (searchParams?.tab as string) ?? 'active'
  const supabase = await createClient()

  type ChallengeWithCount = {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    status: string
    challenge_participants: Array<{ count: number }>
  }

  const { data: challengesRaw } = await supabase
    .from('challenges')
    .select('*, challenge_participants(count)')
    .eq('status', (tab === 'upcoming' ? 'draft' : tab) as 'draft' | 'active' | 'completed')
    .order('start_date', { ascending: false })

  const challenges = (challengesRaw ?? []) as unknown as ChallengeWithCount[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">Defis</h2>

      <div className="flex gap-2">
        {['active', 'completed'].map((t) => (
          <a
            key={t}
            href={`/challenges?tab=${t}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors
              ${tab === t ? 'bg-accent-green text-black' : 'bg-bg-secondary text-text-muted hover:text-white'}`}
          >
            {t === 'active' ? 'En cours' : 'Termines'}
          </a>
        ))}
      </div>

      {challenges.length > 0 ? (
        <div className="grid gap-4">
          {challenges.map((c) => (
            <ChallengeCard
              key={c.id}
              id={c.id}
              title={c.title}
              description={c.description}
              startDate={c.start_date}
              endDate={c.end_date}
              status={c.status}
              participantCount={c.challenge_participants[0]?.count ?? 0}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Trophy size={48} />}
          title="Aucun defi"
          description={tab === 'active' ? 'Aucun defi en cours pour le moment' : 'Aucun defi termine'}
        />
      )}
    </div>
  )
}
