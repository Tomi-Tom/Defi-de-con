import { requireAuth } from '@/lib/supabase/require-auth'
import { selectDailyQuote } from '@/lib/utils/quotes'
import { StreakWidget } from '@/components/dashboard/streak-widget'
import { PointsWidget } from '@/components/dashboard/points-widget'
import { RankWidget } from '@/components/dashboard/rank-widget'
import { ActiveChallengesWidget } from '@/components/dashboard/active-challenges-widget'
import { RecentBadgesWidget } from '@/components/dashboard/recent-badges-widget'
import { DailyQuoteWidget } from '@/components/dashboard/daily-quote-widget'
import { differenceInDays, parseISO } from 'date-fns'

export default async function DashboardPage() {
  const { supabase, user } = await requireAuth()

  // Parallel data fetching
  const [profileRes, participationsRes, rankRes, badgesRes, quotesRes, todayPointsRes] = await Promise.all([
    supabase.from('profiles').select('points_total').eq('id', user.id).single(),
    supabase
      .from('challenge_participants')
      .select('challenge_id, current_streak, challenges(id, title, start_date, duration_days)')
      .eq('user_id', user.id)
      .eq('challenges.status', 'active'),
    supabase.from('profiles').select('id').order('points_total', { ascending: false }),
    supabase
      .from('user_badges')
      .select('badges(name, icon_url)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5),
    supabase.from('motivational_quotes').select('*').eq('context', 'daily'),
    supabase
      .from('points_log')
      .select('points')
      .eq('user_id', user.id)
      .gte('created_at', new Date().toISOString().slice(0, 10)),
  ])

  const profile = profileRes.data as unknown as { points_total: number } | null
  const participations = (participationsRes.data ?? []) as unknown as Array<{
    challenge_id: string
    current_streak: number
    challenges: { id: string; title: string; start_date: string; duration_days: number } | null
  }>
  const rankList = (rankRes.data ?? []) as unknown as Array<{ id: string }>
  const badges = (badgesRes.data ?? []) as unknown as Array<{
    badges: { name: string; icon_url: string } | null
  }>
  const quotes = quotesRes.data ?? []
  const todayPointsData = (todayPointsRes.data ?? []) as unknown as Array<{ points: number }>

  const rank = rankList.findIndex(p => p.id === user.id) + 1
  const todayPoints = todayPointsData.reduce((sum, p) => sum + p.points, 0)

  // Best current streak across participations
  const bestStreak = participations.reduce((max, p) => Math.max(max, p.current_streak), 0)

  // Check today's entries
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayEntries } = await supabase
    .from('daily_entries')
    .select('challenge_id')
    .eq('user_id', user.id)
    .eq('entry_date', today)

  const todayEntryIds = new Set(((todayEntries ?? []) as unknown as Array<{ challenge_id: string }>).map(e => e.challenge_id))

  const activeChallenges = participations
    .filter(p => p.challenges)
    .map(p => {
      const c = p.challenges as { id: string; title: string; start_date: string; duration_days: number }
      const elapsed = differenceInDays(new Date(), parseISO(c.start_date)) + 1
      const progress = Math.min(100, Math.round((elapsed / c.duration_days) * 100))
      return {
        id: c.id,
        title: c.title,
        progress,
        hasEntryToday: todayEntryIds.has(c.id),
      }
    })

  const dailyQuote = selectDailyQuote(quotes, user.id)

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">Dashboard</h2>

      <div className="animate-slide-up stagger-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakWidget streak={bestStreak} />
        <PointsWidget points={profile?.points_total ?? 0} todayPoints={todayPoints} />
        <RankWidget rank={rank || 1} total={rankList.length} />
      </div>

      <div className="animate-slide-up stagger-2">
        <ActiveChallengesWidget challenges={activeChallenges} />
      </div>

      <div className="animate-slide-up stagger-3 grid grid-cols-1 md:grid-cols-2 gap-4">
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
