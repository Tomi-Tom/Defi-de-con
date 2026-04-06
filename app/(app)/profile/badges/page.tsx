import { requireAuth } from '@/lib/supabase/require-auth'
import { StatCard } from '@/components/ui/stat-card'
import { Award, Lock, Check, Flame, Trophy, Star, Zap, HelpCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  streak: { label: 'Streaks', icon: Flame, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
  completion: { label: 'Defis completes', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  points: { label: 'Points', icon: Star, color: 'text-accent-green', bg: 'bg-accent-green/10' },
  custom: { label: 'Speciaux', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
}

type Badge = { id: string; name: string; description: string; icon_url: string; condition_type: string; condition_value: number }
type UserBadge = { badge_id: string; earned_at: string; challenge_id: string | null }

function getBadgeRarity(badge: Badge): 'common' | 'rare' | 'epic' | 'legendary' {
  if (badge.condition_type === 'streak' && badge.condition_value >= 90) return 'legendary'
  if (badge.condition_type === 'streak' && badge.condition_value >= 21) return 'epic'
  if (badge.condition_type === 'streak' && badge.condition_value >= 7) return 'rare'
  if (badge.condition_type === 'points' && badge.condition_value >= 10000) return 'legendary'
  if (badge.condition_type === 'points' && badge.condition_value >= 2000) return 'epic'
  if (badge.condition_type === 'points' && badge.condition_value >= 500) return 'rare'
  if (badge.condition_type === 'completion' && badge.condition_value >= 25) return 'legendary'
  if (badge.condition_type === 'completion' && badge.condition_value >= 7) return 'epic'
  if (badge.condition_type === 'completion' && badge.condition_value >= 3) return 'rare'
  if (badge.condition_value >= 100) return 'legendary'
  if (badge.condition_value >= 50) return 'epic'
  if (badge.condition_value >= 10) return 'rare'
  return 'common'
}

const rarityConfig = {
  common: { label: 'Commun', border: 'border-text-muted/30', earnedBorder: 'border-accent-green/20', glow: '', textColor: 'text-text-muted' },
  rare: { label: 'Rare', border: 'border-blue-400/30', earnedBorder: 'border-blue-400/40', glow: 'hover:shadow-[0_0_15px_rgba(96,165,250,0.15)]', textColor: 'text-blue-400' },
  epic: { label: 'Epique', border: 'border-purple-400/30', earnedBorder: 'border-purple-400/40', glow: 'hover:shadow-[0_0_15px_rgba(192,132,252,0.15)]', textColor: 'text-purple-400' },
  legendary: { label: 'Legendaire', border: 'border-yellow-400/30', earnedBorder: 'border-yellow-400/40', glow: 'hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]', textColor: 'text-yellow-400' },
}

function getUnlockHint(badge: Badge): string {
  switch (badge.condition_type) {
    case 'streak':
      return `Maintiens un streak de ${badge.condition_value} jours consecutifs sur un defi.`
    case 'completion':
      return `Complete ${badge.condition_value} defi${badge.condition_value > 1 ? 's' : ''}.`
    case 'points':
      return `Accumule ${badge.condition_value.toLocaleString('fr-FR')} points au total.`
    case 'custom':
      // Known badges
      if (badge.name.includes('entree')) return `Effectue ${badge.condition_value} saisies au total.`
      if (badge.name === 'Challenger' || badge.name === 'Explorer') return `Participe a ${badge.condition_value} defis.`
      if (badge.name === 'Collectionneur' || badge.name === 'Badge Hunter' || badge.name === 'Completionniste') return `Debloque ${badge.condition_value} badges differents.`
      if (badge.name === 'Leader' || badge.name === 'Elite') return `Termine premier dans un defi.`
      if (badge.name === 'Matinal' || badge.name === 'Leve-tot') return `Fais une saisie tot le matin.`
      if (badge.name === 'Noctambule') return `Fais une saisie tard le soir.`
      if (badge.name === 'Early Adopter' || badge.name === 'OG') return `Fais partie des premiers inscrits.`
      return `Conditions speciales — attribue par l'admin ou evenement unique.`
    default:
      return `Continue a participer aux defis !`
  }
}

export default async function BadgesPage() {
  const { supabase, user } = await requireAuth()

  const [allBadgesRes, userBadgesRes, participationsRes, entriesCountRes, profileRes, allUserBadgesCountRes] = await Promise.all([
    supabase.from('badges').select('id, name, description, icon_url, condition_type, condition_value').order('condition_value'),
    supabase.from('user_badges').select('badge_id, earned_at, challenge_id').eq('user_id', user.id),
    supabase.from('challenge_participants').select('best_streak, challenges(status)').eq('user_id', user.id),
    supabase.from('daily_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('profiles').select('points_total').eq('id', user.id).single(),
    supabase.from('user_badges').select('user_id'),
  ])

  const allBadges = (allBadgesRes.data ?? []) as unknown as Badge[]
  const userBadges = (userBadgesRes.data ?? []) as unknown as UserBadge[]
  const participations = (participationsRes.data ?? []) as unknown as Array<{ best_streak: number; challenges: { status: string } | null }>
  const totalEntries = entriesCountRes.count ?? 0
  const totalPoints = (profileRes.data as unknown as { points_total: number } | null)?.points_total ?? 0

  const earnedIds = new Set(userBadges.map(ub => ub.badge_id))
  const earnedCount = allBadges.filter(b => earnedIds.has(b.id)).length

  // Social comparison
  const allUserBadges = (allUserBadgesCountRes.data ?? []) as unknown as Array<{ user_id: string }>
  const badgeCountByUser = new Map<string, number>()
  for (const ub of allUserBadges) {
    badgeCountByUser.set(ub.user_id, (badgeCountByUser.get(ub.user_id) ?? 0) + 1)
  }
  const maxBadges = Math.max(...Array.from(badgeCountByUser.values()), 0)
  const badgesToTop = Math.max(0, maxBadges - earnedCount)

  const bestStreakEver = participations.reduce((max, p) => Math.max(max, p.best_streak), 0)
  const completedChallenges = participations.filter(p => p.challenges?.status === 'completed').length
  const joinedChallenges = participations.length

  function getProgress(badge: Badge): number | null {
    switch (badge.condition_type) {
      case 'streak':
        return Math.min(100, Math.round((bestStreakEver / badge.condition_value) * 100))
      case 'completion':
        if (badge.condition_value >= 100) return null
        return Math.min(100, Math.round((completedChallenges / badge.condition_value) * 100))
      case 'points':
        return Math.min(100, Math.round((totalPoints / badge.condition_value) * 100))
      case 'custom': {
        // Entry milestones
        const entryNames = ['10 entrees', '25 entrees', '50 entrees', '200 entrees', '500 entrees', '1000 entrees', 'Passione']
        if (entryNames.includes(badge.name))
          return Math.min(100, Math.round((totalEntries / badge.condition_value) * 100))
        // Participation milestones
        const partNames = ['Challenger', 'Explorer', 'Veterinaire', 'Multi-defi', 'Hyperactif']
        if (partNames.includes(badge.name))
          return Math.min(100, Math.round((joinedChallenges / badge.condition_value) * 100))
        // Badge collection milestones
        const collectNames = ['Collectionneur', 'Badge Hunter', 'Completionniste']
        if (collectNames.includes(badge.name))
          return Math.min(100, Math.round((earnedCount / badge.condition_value) * 100))
        return null
      }
      default:
        return null
    }
  }

  // Group by category
  const categories = ['streak', 'completion', 'points', 'custom']

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-4">
          <Award size={16} className="text-yellow-400" />
          <span className="text-sm font-black uppercase tracking-wider text-yellow-400">Collection</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">MES <span className="text-accent-green">BADGES</span></h1>
        <p className="text-text-muted mt-2">
          <span className="text-accent-green font-bold">{earnedCount}</span> / {allBadges.length} debloques
        </p>
        <div className="max-w-sm mx-auto mt-4">
          <div className="h-3 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green-dark transition-all duration-700"
              style={{ width: `${allBadges.length > 0 ? Math.round((earnedCount / allBadges.length) * 100) : 0}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1">{allBadges.length > 0 ? Math.round((earnedCount / allBadges.length) * 100) : 0}%</p>
        </div>

        {maxBadges > 0 && badgesToTop > 0 && (
          <p className="text-xs text-text-muted mt-2">
            Les meilleurs ont <span className="text-accent-green font-bold">{maxBadges}</span> badges — encore <span className="text-accent-orange font-bold">{badgesToTop}</span> pour les rejoindre !
          </p>
        )}
      </div>

      {/* Category stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map(cat => {
          const config = categoryConfig[cat]
          const total = allBadges.filter(b => b.condition_type === cat).length
          const earned = allBadges.filter(b => b.condition_type === cat && earnedIds.has(b.id)).length
          return (
            <StatCard
              key={cat}
              label={config.label}
              value={`${earned} / ${total}`}
              icon={config.icon}
              color={config.color}
              bg={config.bg}
            />
          )
        })}
      </div>

      {/* Badges by category */}
      {categories.map(cat => {
        const config = categoryConfig[cat]
        const catBadges = allBadges.filter(b => b.condition_type === cat)
        if (catBadges.length === 0) return null

        return (
          <div key={cat}>
            <h2 className={`text-sm font-black uppercase tracking-widest ${config.color} flex items-center gap-2 mb-4`}>
              <config.icon size={14} />
              {config.label} ({catBadges.filter(b => earnedIds.has(b.id)).length}/{catBadges.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {catBadges.map(badge => {
                const isEarned = earnedIds.has(badge.id)
                const ub = userBadges.find(u => u.badge_id === badge.id)
                const progress = !isEarned ? getProgress(badge) : null
                const rarity = getBadgeRarity(badge)
                const rc = rarityConfig[rarity]

                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl border p-3 text-center transition-all
                      ${isEarned
                        ? `bg-bg-secondary ${rc.earnedBorder} ${rc.glow}`
                        : `bg-bg-secondary ${rc.border} opacity-60 hover:opacity-80`}`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-1.5 relative ${!isEarned ? 'grayscale' : ''}`}>
                      <img src={badge.icon_url} alt={badge.name} className="w-full h-full" />
                      {isEarned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-green flex items-center justify-center">
                          <Check size={10} className="text-black" />
                        </div>
                      )}
                    </div>
                    <h3 className={`text-xs font-black ${isEarned ? 'text-white' : 'text-text-secondary'}`}>{badge.name}</h3>

                    <span className={`text-[8px] font-black uppercase ${rc.textColor}`}>{rc.label}</span>

                    <p className="text-[9px] text-text-muted mt-0.5 line-clamp-2">{badge.description}</p>

                    {isEarned && ub && (
                      <p className="text-[9px] text-accent-green mt-1 font-bold">
                        {format(parseISO(ub.earned_at), 'd MMM yyyy', { locale: fr })}
                      </p>
                    )}

                    {!isEarned && progress !== null && progress > 0 && (
                      <div className="mt-1.5">
                        <div className="h-1 rounded-full bg-bg-tertiary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progress >= 80 ? 'bg-accent-green' : progress >= 50 ? 'bg-yellow-400' : 'bg-accent-orange'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-text-muted mt-0.5 font-bold">{progress}%</p>
                      </div>
                    )}

                    {!isEarned && (progress === null || progress === 0) && (
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Lock size={8} className="text-text-muted" />
                        <p className="text-[9px] text-text-muted">Verrouille</p>
                      </div>
                    )}

                    {!isEarned && (
                      <details className="mt-1.5">
                        <summary className="text-[9px] text-text-muted cursor-pointer hover:text-white flex items-center gap-1">
                          <HelpCircle size={10} /> Comment debloquer ?
                        </summary>
                        <p className="text-[9px] text-text-muted mt-1 pl-3.5">
                          {getUnlockHint(badge)}
                        </p>
                      </details>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
