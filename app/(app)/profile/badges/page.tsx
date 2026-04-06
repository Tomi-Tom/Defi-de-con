import { requireAuth } from '@/lib/supabase/require-auth'
import { Award, Lock, Check } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function BadgesPage() {
  const { supabase, user } = await requireAuth()

  type Badge = { id: string; name: string; description: string; icon_url: string; condition_type: string; condition_value: number }
  type UserBadge = { badge_id: string; earned_at: string; challenge_id: string | null }

  const [allBadgesRes, userBadgesRes, participationsRes, entriesCountRes] = await Promise.all([
    supabase.from('badges').select('*').order('name'),
    supabase.from('user_badges').select('badge_id, earned_at, challenge_id').eq('user_id', user.id),
    supabase.from('challenge_participants').select('best_streak, challenges(status)').eq('user_id', user.id),
    supabase.from('daily_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const allBadges = (allBadgesRes.data ?? []) as unknown as Badge[]
  const userBadges = (userBadgesRes.data ?? []) as unknown as UserBadge[]
  const participations = (participationsRes.data ?? []) as unknown as Array<{ best_streak: number; challenges: { status: string } | null }>
  const totalEntries = entriesCountRes.count ?? 0

  const earnedIds = new Set(userBadges.map(ub => ub.badge_id))
  const earnedBadges = allBadges.filter(b => earnedIds.has(b.id))
  const unearnedBadges = allBadges.filter(b => !earnedIds.has(b.id))

  // Stats for progression
  const bestStreakEver = participations.reduce((max, p) => Math.max(max, p.best_streak), 0)
  const completedChallenges = participations.filter(p => p.challenges?.status === 'completed').length
  const joinedChallenges = participations.length

  function getProgress(badge: Badge): number | null {
    switch (badge.condition_type) {
      case 'streak':
        return Math.min(100, Math.round((bestStreakEver / badge.condition_value) * 100))
      case 'completion':
        if (badge.condition_value >= 100) return null // "100% completion" - can't easily track
        return Math.min(100, Math.round((completedChallenges / badge.condition_value) * 100))
      case 'points':
        return null // would need points total
      case 'custom':
        // Try to compute for known badges
        if (badge.name === 'Challenger' || badge.name === 'Explorer')
          return Math.min(100, Math.round((joinedChallenges / badge.condition_value) * 100))
        if (badge.name === 'Passione')
          return Math.min(100, Math.round((totalEntries / badge.condition_value) * 100))
        if (badge.name === 'Centurion')
          return Math.min(100, Math.round((bestStreakEver / badge.condition_value) * 100)) // rough approx
        if (badge.name === 'Diamant')
          return Math.min(100, Math.round((bestStreakEver / badge.condition_value) * 100))
        return null
      default:
        return null
    }
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-4">
          <Award size={16} className="text-yellow-400" />
          <span className="text-sm font-black uppercase tracking-wider text-yellow-400">Collection</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">MES <span className="text-accent-green">BADGES</span></h1>
        <p className="text-text-muted mt-2">
          <span className="text-accent-green font-bold">{earnedBadges.length}</span> / {allBadges.length} debloques
        </p>
        {/* Overall progress bar */}
        <div className="max-w-xs mx-auto mt-4">
          <div className="h-2.5 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green-dark transition-all duration-700"
              style={{ width: `${allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-accent-green flex items-center gap-2 mb-4">
            <Check size={14} />
            Debloques ({earnedBadges.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {earnedBadges.map(badge => {
              const ub = userBadges.find(u => u.badge_id === badge.id)
              return (
                <div key={badge.id} className="bg-bg-secondary rounded-xl border border-accent-green/20 p-4 text-center hover:border-accent-green/40 transition-all hover:shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                  <div className="w-14 h-14 mx-auto mb-2 relative">
                    <img src={badge.icon_url} alt={badge.name} className="w-full h-full" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white">{badge.name}</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">{badge.description}</p>
                  {ub && (
                    <p className="text-[10px] text-accent-green mt-1 font-bold">
                      {format(parseISO(ub.earned_at), 'd MMM yyyy', { locale: fr })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Unearned badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
            <Lock size={14} />
            A debloquer ({unearnedBadges.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {unearnedBadges.map(badge => {
              const progress = getProgress(badge)
              return (
                <div key={badge.id} className="bg-bg-secondary rounded-xl border border-border p-4 text-center">
                  <div className="w-14 h-14 mx-auto mb-2 opacity-30 grayscale">
                    <img src={badge.icon_url} alt={badge.name} className="w-full h-full" />
                  </div>
                  <h3 className="text-sm font-bold text-text-secondary">{badge.name}</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">{badge.description}</p>
                  {progress !== null && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progress >= 80 ? 'bg-accent-green' : progress >= 50 ? 'bg-yellow-400' : 'bg-accent-orange'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-text-muted mt-1 font-bold">{progress}%</p>
                    </div>
                  )}
                  {progress === null && (
                    <p className="text-[10px] text-text-muted mt-2">
                      {badge.condition_type === 'custom' ? 'Attribue manuellement' : `${badge.condition_type}: ${badge.condition_value}`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
