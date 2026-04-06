import { requireAuth } from '@/lib/supabase/require-auth'
import { notFound } from 'next/navigation'
import { Leaderboard } from '@/components/challenges/leaderboard'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { joinChallenge, leaveChallenge } from '@/lib/actions/participants'
import { differenceInDays, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, Users, Clock } from 'lucide-react'
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">{challenge.title}</h2>
        <p className="text-text-muted">{challenge.description}</p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-text-muted">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {format(parseISO(challenge.start_date), 'd MMM', { locale: fr })} - {format(parseISO(challenge.end_date), 'd MMM yyyy', { locale: fr })}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {challenge.duration_days} jours
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} />
          {participants.length} participants
        </span>
      </div>

      {challenge.status === 'active' && <ProgressBar value={progress} label="Progression" />}

      <div className="flex gap-3">
        {challenge.status === 'active' && !isParticipant && (
          <form action={async () => {
            'use server'
            await joinChallenge(id)
          }}>
            <Button type="submit">Rejoindre le defi</Button>
          </form>
        )}
        {isParticipant && challenge.status === 'active' && (
          <>
            <Link href={`/challenges/${id}/entry`}>
              <Button>Saisir aujourd'hui</Button>
            </Link>
            <Link href={`/challenges/${id}/history`}>
              <Button variant="secondary">Mon historique</Button>
            </Link>
            <form action={async () => {
              'use server'
              await leaveChallenge(id)
            }}>
              <Button variant="ghost" type="submit">Quitter</Button>
            </form>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Champs du defi</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {challenge.challenge_fields
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-white font-semibold">{f.label}</span>
                  <span className="text-text-muted">({f.type})</span>
                  {f.required && <span className="text-accent-orange text-xs">requis</span>}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Leaderboard entries={leaderboardEntries} />
    </div>
  )
}
