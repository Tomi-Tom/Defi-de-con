import { requireAdmin } from '@/lib/supabase/require-auth'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { Button } from '@/components/ui/button'
import { Users, Shield, ShieldOff, Trophy, Flame, Star } from 'lucide-react'
import Link from 'next/link'
import { toggleAdminRole } from '@/lib/actions/admin-badges'
import { UserAvatar } from '@/components/ui/user-avatar'

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin()

  type UserProfile = {
    id: string
    username: string
    avatar_url: string | null
    is_admin: boolean
    points_total: number
    entry_mode: string
    created_at: string
  }

  type ParticipationInfo = {
    user_id: string
    current_streak: number
    best_streak: number
    challenge_id: string
  }

  type UserBadgeInfo = {
    user_id: string
    badges: { name: string; icon_url: string } | null
  }

  const [profilesRes, participationsRes, badgesRes, entriesCountRes] = await Promise.all([
    supabase.from('profiles').select('id, username, avatar_url, is_admin, points_total, entry_mode, created_at').order('points_total', { ascending: false }),
    supabase.from('challenge_participants').select('user_id, current_streak, best_streak, challenge_id'),
    supabase.from('user_badges').select('user_id, badges(name, icon_url)'),
    supabase.from('daily_entries').select('user_id'),
  ])

  const profiles = (profilesRes.data ?? []) as unknown as UserProfile[]
  const participations = (participationsRes.data ?? []) as unknown as ParticipationInfo[]
  const userBadges = (badgesRes.data ?? []) as unknown as UserBadgeInfo[]
  const entries = (entriesCountRes.data ?? []) as unknown as Array<{ user_id: string }>

  // Aggregate per user
  const userStats = new Map<string, { challenges: number; bestStreak: number; badgeCount: number; entryCount: number }>()
  for (const p of participations) {
    const existing = userStats.get(p.user_id) ?? { challenges: 0, bestStreak: 0, badgeCount: 0, entryCount: 0 }
    existing.challenges++
    existing.bestStreak = Math.max(existing.bestStreak, p.best_streak)
    userStats.set(p.user_id, existing)
  }
  for (const b of userBadges) {
    const existing = userStats.get(b.user_id) ?? { challenges: 0, bestStreak: 0, badgeCount: 0, entryCount: 0 }
    existing.badgeCount++
    userStats.set(b.user_id, existing)
  }
  for (const e of entries) {
    const existing = userStats.get(e.user_id) ?? { challenges: 0, bestStreak: 0, badgeCount: 0, entryCount: 0 }
    existing.entryCount++
    userStats.set(e.user_id, existing)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Users size={24} className="text-accent-green" />
          Admin — Utilisateurs ({profiles.length})
        </h2>
      </div>

      <div className="space-y-3">
        {profiles.map((p) => {
          const stats = userStats.get(p.id) ?? { challenges: 0, bestStreak: 0, badgeCount: 0, entryCount: 0 }
          return (
            <Card key={p.id} className={p.is_admin ? 'border-accent-orange/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <UserAvatar username={p.username} avatarUrl={p.avatar_url} size="sm" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${p.id}`} className="font-bold text-white hover:text-accent-green transition-colors truncate">
                        {p.username}
                      </Link>
                      {p.is_admin && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange uppercase">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">
                      Inscrit le {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-accent-green" title="Points">
                      <Star size={12} />
                      <span className="font-bold">{p.points_total}</span>
                    </div>
                    <div className="flex items-center gap-1 text-accent-orange" title="Meilleur streak">
                      <Flame size={12} />
                      <span className="font-bold">{stats.bestStreak}j</span>
                    </div>
                    <div className="flex items-center gap-1 text-text-muted" title="Defis">
                      <Trophy size={12} />
                      <span className="font-bold">{stats.challenges}</span>
                    </div>
                    <div className="text-text-muted" title="Entrees">
                      <span className="font-bold">{stats.entryCount} saisies</span>
                    </div>
                    <div className="text-text-muted" title="Badges">
                      <span className="font-bold">{stats.badgeCount} badges</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${p.id}`}>
                      <Button variant="secondary" size="sm">Profil</Button>
                    </Link>
                    <form action={async () => {
                      'use server'
                      await toggleAdminRole(p.id)
                    }}>
                      <Button variant="ghost" size="sm" type="submit" title={p.is_admin ? 'Retirer admin' : 'Rendre admin'}>
                        {p.is_admin ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Mobile stats */}
                <div className="md:hidden flex flex-wrap gap-3 mt-3 text-xs">
                  <span className="flex items-center gap-1 text-accent-green"><Star size={10} /> {p.points_total} pts</span>
                  <span className="flex items-center gap-1 text-accent-orange"><Flame size={10} /> {stats.bestStreak}j streak</span>
                  <span className="flex items-center gap-1 text-text-muted"><Trophy size={10} /> {stats.challenges} defis</span>
                  <span className="text-text-muted">{stats.entryCount} saisies</span>
                  <span className="text-text-muted">{stats.badgeCount} badges</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
