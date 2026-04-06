import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChallengeTabs } from '@/components/challenges/challenge-tabs'
import { ChallengeDashboardTab } from '@/components/challenges/challenge-dashboard-tab'
import { ChallengeJournal } from '@/components/challenges/challenge-journal'
import { joinChallenge, leaveChallenge } from '@/lib/actions/participants'
import { differenceInDays, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Clock, Flame, Trophy, Crown } from 'lucide-react'
import Link from 'next/link'

export default async function ChallengeDetailPage(props: PageProps<'/challenges/[id]'>) {
  const { id } = await props.params
  const { supabase, user } = await requireAuth()

  type ChallengeWithFields = {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    duration_days: number
    status: string
    challenge_fields: Array<{ id: string; label: string; type: string; required: boolean; order: number }>
  }

  const { data: challengeRaw } = await supabase
    .from('challenges')
    .select('*, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challengeRaw) notFound()
  const challenge = challengeRaw as unknown as ChallengeWithFields

  // Parallel fetches
  const [participantsRaw, myEntriesRaw, goalsRaw] = await Promise.all([
    supabase
      .from('challenge_participants')
      .select('user_id, current_streak, points_earned, profiles(username, avatar_url)')
      .eq('challenge_id', id)
      .order('points_earned', { ascending: false }),
    supabase
      .from('daily_entries')
      .select('id, entry_date, entry_values(field_id, value_text, value_number, value_date, value_file_url)')
      .eq('challenge_id', id)
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false }),
    supabase
      .from('challenge_goals')
      .select('field_id, goal_date, target_value')
      .eq('challenge_id', id)
      .order('goal_date'),
  ])

  const participants = (participantsRaw.data ?? []) as unknown as Array<{
    user_id: string
    current_streak: number
    points_earned: number
    profiles: { username: string; avatar_url: string | null } | null
  }>

  type JournalEntry = {
    id: string
    entry_date: string
    entry_values: Array<{
      field_id: string; value_text: string | null; value_number: number | null
      value_date: string | null; value_file_url: string | null
    }>
  }
  const myEntries = (myEntriesRaw.data ?? []) as unknown as JournalEntry[]

  type GoalValue = { field_id: string; goal_date: string; target_value: number }
  const goals = (goalsRaw.data ?? []) as unknown as GoalValue[]

  const isParticipant = participants.some(p => p.user_id === user.id)
  const elapsed = differenceInDays(new Date(), parseISO(challenge.start_date)) + 1
  const progress = Math.min(100, Math.round((elapsed / challenge.duration_days) * 100))
  const isActive = challenge.status === 'active'
  const daysLeft = Math.max(0, differenceInDays(parseISO(challenge.end_date), new Date()))

  const leaderboardEntries = participants.map(p => ({
    userId: p.user_id,
    username: p.profiles?.username ?? 'Inconnu',
    avatarUrl: p.profiles?.avatar_url ?? null,
    points: p.points_earned,
    streak: p.current_streak,
  }))

  // My rank
  const myRank = participants.findIndex(p => p.user_id === user.id) + 1
  const myPoints = participants.find(p => p.user_id === user.id)?.points_earned ?? 0

  const fields = challenge.challenge_fields as Array<{ id: string; label: string; type: string; required: boolean; order: number }>

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bg-secondary via-bg-secondary to-bg-tertiary border border-border p-8">
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isActive ? 'bg-gradient-to-r from-accent-green to-accent-green-dark' : 'bg-gradient-to-r from-accent-orange to-yellow-500'}`} />
        {isActive && <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 rounded-full blur-3xl" />}

        <div className="relative">
          <div className="mb-4">
            {isActive ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
                <Flame size={16} className="text-accent-green" />
                <span className="text-sm font-black uppercase tracking-wider text-accent-green">Defi en cours</span>
              </div>
            ) : challenge.status === 'completed' ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-orange/10 border border-accent-orange/20">
                <Trophy size={16} className="text-accent-orange" />
                <span className="text-sm font-black uppercase tracking-wider text-accent-orange">Termine</span>
              </div>
            ) : null}
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">{challenge.title}</h1>
          <p className="text-text-secondary text-lg max-w-2xl">{challenge.description}</p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                <Users size={18} className="text-accent-green" />
              </div>
              <div>
                <div className="text-xl font-black text-white">{participants.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Participants</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                <Clock size={18} className="text-accent-orange" />
              </div>
              <div>
                <div className="text-xl font-black text-white">{challenge.duration_days}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Jours</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <Calendar size={18} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-xl font-black text-white">
                  {format(parseISO(challenge.start_date), 'd MMM', { locale: fr })} — {format(parseISO(challenge.end_date), 'd MMM', { locale: fr })}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Periode</div>
              </div>
            </div>
            {isParticipant && myRank > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Crown size={18} className="text-purple-400" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">#{myRank}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{myPoints} pts</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress section */}
      {isActive && (
        <div className="bg-bg-secondary rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-black uppercase tracking-widest text-text-muted">Progression du defi</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-accent-green">{Math.round(progress)}%</span>
              {daysLeft > 0 && (
                <span className="text-sm text-text-muted">— {daysLeft}j restants</span>
              )}
            </div>
          </div>
          <div className="h-4 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green-dark transition-all duration-700 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {isActive && !isParticipant && (
          <form action={async () => {
            'use server'
            await joinChallenge(id)
          }}>
            <Button type="submit" size="lg" className="shadow-[0_0_20px_rgba(0,255,135,0.3)] hover:shadow-[0_0_30px_rgba(0,255,135,0.5)]">
              Rejoindre le defi
            </Button>
          </form>
        )}
        {isParticipant && isActive && (
          <>
            <Link href={`/challenges/${id}/entry`}>
              <Button size="lg" className="shadow-[0_0_20px_rgba(0,255,135,0.3)] hover:shadow-[0_0_30px_rgba(0,255,135,0.5)]">
                Saisir aujourd&apos;hui
              </Button>
            </Link>
            <form action={async () => {
              'use server'
              await leaveChallenge(id)
            }}>
              <Button variant="ghost" size="lg" type="submit">Quitter</Button>
            </form>
          </>
        )}
      </div>

      {/* Tabbed content */}
      <ChallengeTabs
        tabs={[
          {
            id: 'dashboard',
            label: 'Dashboard',
            content: (
              <ChallengeDashboardTab
                fields={fields}
                leaderboardEntries={leaderboardEntries}
              />
            ),
          },
          ...(isParticipant ? [{
            id: 'journal',
            label: 'Mon journal',
            content: (
              <ChallengeJournal
                entries={myEntries}
                fields={fields}
                goals={goals}
              />
            ),
          }] : []),
          {
            id: 'participants',
            label: `Participants (${participants.length})`,
            content: (
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <Link
                    key={p.user_id}
                    href={`/profile/${p.user_id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border hover:border-accent-green/30 transition-all"
                  >
                    <span className={`w-6 text-center text-sm font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                      #{i + 1}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-accent-green/10 flex items-center justify-center text-xs font-bold text-accent-green">
                      {(p.profiles?.username ?? '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-white">{p.profiles?.username ?? 'Inconnu'}</span>
                      {p.user_id === user.id && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold">Toi</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-accent-green">{p.points_earned} pts</span>
                    <span className="text-xs text-accent-orange font-bold">{p.current_streak}j</span>
                  </Link>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
