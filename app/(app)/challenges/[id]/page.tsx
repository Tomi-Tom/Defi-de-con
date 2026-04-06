import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound } from 'next/navigation'
import { Leaderboard } from '@/components/challenges/leaderboard'
import { Button } from '@/components/ui/button'
import { joinChallenge, leaveChallenge } from '@/lib/actions/participants'
import { differenceInDays, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Clock, Flame, Trophy } from 'lucide-react'
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

  const { data: participantsRaw } = await supabase
    .from('challenge_participants')
    .select('user_id, current_streak, points_earned, profiles(username, avatar_url)')
    .eq('challenge_id', id)
    .order('points_earned', { ascending: false })

  const participants = (participantsRaw ?? []) as unknown as Array<{
    user_id: string
    current_streak: number
    points_earned: number
    profiles: { username: string; avatar_url: string | null } | null
  }>

  const isParticipant = participants.some(p => p.user_id === user.id)
  const elapsed = differenceInDays(new Date(), parseISO(challenge.start_date)) + 1
  const progress = Math.min(100, Math.round((elapsed / challenge.duration_days) * 100))

  const leaderboardEntries = participants.map(p => ({
    userId: p.user_id,
    username: p.profiles?.username ?? 'Inconnu',
    avatarUrl: p.profiles?.avatar_url ?? null,
    points: p.points_earned,
    streak: p.current_streak,
  }))

  const isActive = challenge.status === 'active'
  const daysLeft = Math.max(0, differenceInDays(parseISO(challenge.end_date), new Date()))

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bg-secondary via-bg-secondary to-bg-tertiary border border-border p-8">
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isActive ? 'bg-gradient-to-r from-accent-green to-accent-green-dark' : 'bg-gradient-to-r from-accent-orange to-yellow-500'}`} />

        {/* Decorative glow */}
        {isActive && <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 rounded-full blur-3xl" />}

        <div className="relative">
          {/* Status badge */}
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

          {/* Title */}
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
            <Link href={`/challenges/${id}/history`}>
              <Button variant="secondary" size="lg">Mon journal</Button>
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

      {/* Challenge fields as tags */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-4">Donnees a tracker chaque jour</h3>
        <div className="flex flex-wrap gap-2">
          {challenge.challenge_fields
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-tertiary border border-border">
                <span className="text-sm font-bold text-white">{f.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold uppercase">{f.type}</span>
                {f.required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange font-bold">requis</span>}
              </div>
            ))}
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard entries={leaderboardEntries} />
    </div>
  )
}
