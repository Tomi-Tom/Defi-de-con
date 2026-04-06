import Link from 'next/link'
import { Flame } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/require-auth'
import { selectDailyQuote } from '@/lib/utils/quotes'
import { StreakWidget } from '@/components/dashboard/streak-widget'
import { PointsWidget } from '@/components/dashboard/points-widget'
import { RankWidget } from '@/components/dashboard/rank-widget'
import { StatsGridWidget } from '@/components/dashboard/stats-grid-widget'
import { ActiveChallengesWidget } from '@/components/dashboard/active-challenges-widget'
import { RecentBadgesWidget } from '@/components/dashboard/recent-badges-widget'
import { DailyQuoteWidget } from '@/components/dashboard/daily-quote-widget'
import { LastEntryWidget } from '@/components/dashboard/last-entry-widget'
import { Button } from '@/components/ui/button'
import { differenceInDays, parseISO } from 'date-fns'

export default async function DashboardPage() {
  const { supabase, user } = await requireAuth()

  const [
    profileRes, participationsRes, rankRes, badgesRes, quotesRes,
    todayPointsRes, totalEntriesRes, lastEntryRes, pointsLogRes
  ] = await Promise.all([
    supabase.from('profiles').select('points_total, username').eq('id', user.id).single(),
    supabase
      .from('challenge_participants')
      .select('challenge_id, current_streak, best_streak, challenges(id, title, start_date, duration_days, status)')
      .eq('user_id', user.id),
    supabase.from('profiles').select('id, points_total').order('points_total', { ascending: false }),
    supabase
      .from('user_badges')
      .select('badges(name, icon_url)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5),
    supabase.from('motivational_quotes').select('id, text, author, context').eq('context', 'daily'),
    supabase
      .from('points_log')
      .select('points')
      .eq('user_id', user.id)
      .gte('created_at', new Date().toISOString().slice(0, 10)),
    supabase
      .from('daily_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('daily_entries')
      .select('id, entry_date, challenge_id, challenges(title), entry_values(value_text, value_number, value_date, challenge_fields(label, type))')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('points_log')
      .select('points, action')
      .eq('user_id', user.id),
  ])

  const profile = profileRes.data as unknown as { points_total: number; username: string } | null
  const participations = (participationsRes.data ?? []) as unknown as Array<{
    challenge_id: string
    current_streak: number
    best_streak: number
    challenges: { id: string; title: string; start_date: string; duration_days: number; status: string } | null
  }>
  const rankList = (rankRes.data ?? []) as unknown as Array<{ id: string; points_total: number }>
  const badges = (badgesRes.data ?? []) as unknown as Array<{
    badges: { name: string; icon_url: string } | null
  }>
  const quotes = quotesRes.data ?? []
  const todayPointsData = (todayPointsRes.data ?? []) as unknown as Array<{ points: number }>
  const totalEntries = totalEntriesRes.count ?? 0
  const lastEntryRaw = lastEntryRes.data as unknown as {
    id: string
    entry_date: string
    challenge_id: string
    challenges: { title: string } | null
    entry_values: Array<{
      value_text: string | null
      value_number: number | null
      value_date: string | null
      challenge_fields: { label: string; type: string } | null
    }>
  } | null
  const allPointsLog = (pointsLogRes.data ?? []) as unknown as Array<{ points: number; action: string }>

  const rank = rankList.findIndex(p => p.id === user.id) + 1
  const todayPoints = todayPointsData.reduce((sum, p) => sum + p.points, 0)
  const bestStreak = participations.reduce((max, p) => Math.max(max, p.current_streak), 0)
  const bestStreakEver = participations.reduce((max, p) => Math.max(max, p.best_streak), 0)
  const completedChallenges = participations.filter(p => p.challenges?.status === 'completed').length

  // Points breakdown
  const breakdown = allPointsLog.reduce(
    (acc, row) => {
      if (row.action === 'daily_entry' || row.action === 'first_entry') {
        acc.entries += row.points
      } else if (row.action.startsWith('streak_')) {
        acc.streaks += row.points
      } else {
        acc.bonuses += row.points
      }
      return acc
    },
    { entries: 0, streaks: 0, bonuses: 0 }
  )

  // Points to next rank
  const myPoints = profile?.points_total ?? 0
  const rankAbove = rank >= 2 ? rankList[rank - 2] : null
  const pointsToNext = rankAbove ? Math.max(0, rankAbove.points_total - myPoints) : null

  // Active challenges
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayEntries } = await supabase
    .from('daily_entries')
    .select('challenge_id')
    .eq('user_id', user.id)
    .eq('entry_date', today)

  const todayEntryIds = new Set(((todayEntries ?? []) as unknown as Array<{ challenge_id: string }>).map(e => e.challenge_id))

  const activeChallenges = participations
    .filter(p => p.challenges?.status === 'active')
    .map(p => {
      const c = p.challenges!
      const elapsed = differenceInDays(new Date(), parseISO(c.start_date)) + 1
      const progress = Math.min(100, Math.round((elapsed / c.duration_days) * 100))
      return { id: c.id, title: c.title, progress, hasEntryToday: todayEntryIds.has(c.id) }
    })

  // Sort by urgency: no entry today first, then by progress descending
  const sortedChallenges = [...activeChallenges].sort((a, b) => {
    if (a.hasEntryToday === b.hasEntryToday) return b.progress - a.progress
    return a.hasEntryToday ? 1 : -1 // no entry first
  })

  // Streak at risk: bestStreak > 0 AND there are active challenges without today's entry
  const challengesWithoutEntry = sortedChallenges.filter(c => !c.hasEntryToday)
  const showStreakBanner = bestStreak > 0 && challengesWithoutEntry.length > 0
  const firstChallengeWithoutEntry = challengesWithoutEntry[0]

  // Last entry fields
  const lastEntryFields = lastEntryRaw?.entry_values
    ?.filter(v => v.challenge_fields)
    .map(v => ({
      label: v.challenge_fields!.label,
      type: v.challenge_fields!.type,
      value: v.value_number ?? v.value_text ?? v.value_date,
    })) ?? []

  const dailyQuote = selectDailyQuote(quotes, user.id)

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bg-secondary to-bg-tertiary border border-border p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-widest text-accent-green mb-1">Dashboard</p>
          <h2 className="text-2xl font-black">
            Salut, <span className="text-accent-green">{profile?.username ?? 'champion'}</span>
          </h2>
          <p className="text-text-muted text-sm mt-1">Pret a tout donner aujourd&apos;hui ?</p>
        </div>
      </div>

      {/* Streak at risk banner */}
      {showStreakBanner && (
        <div className="animate-pulse-glow-orange rounded-2xl bg-accent-orange/10 border border-accent-orange/30 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
              <Flame size={20} className="text-accent-orange" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Streak en danger !</p>
              <p className="text-xs text-text-muted">Ton streak de {bestStreak}j est en jeu. Saisis tes donnees avant minuit.</p>
            </div>
          </div>
          <Link href={`/challenges/${firstChallengeWithoutEntry.id}/entry`} className="shrink-0">
            <Button size="sm">Saisir maintenant</Button>
          </Link>
        </div>
      )}

      {/* Main stats row */}
      <div className="animate-slide-up stagger-1 grid grid-cols-2 md:grid-cols-3 gap-3">
        <StreakWidget streak={bestStreak} />
        <PointsWidget points={profile?.points_total ?? 0} todayPoints={todayPoints} breakdown={breakdown} />
        <RankWidget rank={rank || 1} total={rankList.length} pointsToNext={pointsToNext} />
      </div>

      {/* Secondary stats row */}
      <div className="animate-slide-up stagger-2 grid grid-cols-3 gap-3">
        <StatsGridWidget
          completedChallenges={completedChallenges}
          totalEntries={totalEntries}
          bestStreakEver={bestStreakEver}
        />
      </div>

      {/* Active challenges */}
      <div className="animate-slide-up stagger-3">
        <ActiveChallengesWidget challenges={sortedChallenges} />
      </div>

      {/* Last entry */}
      {lastEntryRaw && lastEntryRaw.challenges && (
        <div className="animate-slide-up stagger-4">
          <LastEntryWidget
            challengeId={lastEntryRaw.challenge_id}
            challengeTitle={lastEntryRaw.challenges.title}
            entryDate={lastEntryRaw.entry_date}
            fields={lastEntryFields}
          />
        </div>
      )}

      {/* Badges + Quote */}
      <div className="animate-slide-up stagger-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentBadgesWidget
          badges={badges
            .filter(b => b.badges)
            .map(b => ({
              name: (b.badges as { name: string; icon_url: string }).name,
              iconUrl: (b.badges as { name: string; icon_url: string }).icon_url,
            }))}
        />
        {dailyQuote && <DailyQuoteWidget text={dailyQuote.text} author={dailyQuote.author} />}
      </div>
    </div>
  )
}
