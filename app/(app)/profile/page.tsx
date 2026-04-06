import { requireAuth } from '@/lib/supabase/require-auth'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { updateProfile } from '@/lib/actions/profile'
import { logout } from '@/lib/actions/auth'
import { Star, Award, Trophy, Calendar, Flame, Crown, ArrowRight, Settings } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function ProfilePage() {
  const { supabase, user } = await requireAuth()

  const [profileRes, badgesRes, challengesRes, entriesCountRes, rankRes, participationsRes] = await Promise.all([
    supabase.from('profiles').select('username, avatar_url, points_total, entry_mode, is_admin, created_at').eq('id', user.id).single(),
    supabase.from('user_badges').select('badges(name, icon_url), earned_at').eq('user_id', user.id).order('earned_at', { ascending: false }),
    supabase.from('challenge_participants').select('challenges(id, title, status)').eq('user_id', user.id),
    supabase.from('daily_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('profiles').select('id').order('points_total', { ascending: false }),
    supabase.from('challenge_participants').select('best_streak').eq('user_id', user.id),
  ])

  const profile = profileRes.data! as unknown as { username: string; avatar_url: string | null; points_total: number; entry_mode: string; is_admin: boolean; created_at: string }
  const badges = (badgesRes.data ?? []) as unknown as Array<{ badges: { name: string; icon_url: string } | null; earned_at: string }>
  const challenges = (challengesRes.data ?? []) as unknown as Array<{ challenges: { id: string; title: string; status: string } | null }>
  const totalEntries = entriesCountRes.count ?? 0
  const rankList = (rankRes.data ?? []) as unknown as Array<{ id: string }>
  const rank = rankList.findIndex(p => p.id === user.id) + 1
  const bestStreakEver = ((participationsRes.data ?? []) as unknown as Array<{ best_streak: number }>).reduce((max, p) => Math.max(max, p.best_streak), 0)

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bg-secondary via-bg-secondary to-bg-tertiary border border-border p-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-green to-accent-green-dark" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-green/5 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-accent-green/20 flex items-center justify-center text-3xl font-black text-accent-green flex-shrink-0">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white">{profile.username}</h1>
              {profile.is_admin && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange uppercase">Admin</span>
              )}
            </div>
            <p className="text-text-muted text-sm">
              Membre depuis {format(parseISO(profile.created_at), 'MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Points', value: profile.points_total, icon: Star, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Badges', value: badges.length, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Defis', value: challenges.length, icon: Trophy, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
          { label: 'Entrees', value: totalEntries, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Best streak', value: `${bestStreakEver}j`, icon: Flame, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
          { label: 'Rang', value: `#${rank}`, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map(s => (
          <div key={s.label} className="bg-bg-secondary rounded-xl border border-border p-3 text-center">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mx-auto mb-1.5`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="text-lg font-black text-white">{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges preview */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Award size={14} />
            Badges ({badges.length})
          </h3>
          <Link href="/profile/badges" className="flex items-center gap-1 text-sm font-bold text-accent-green hover:underline">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 flex-wrap">
          {badges.slice(0, 6).map((b, i) => (
            b.badges && <BadgeDisplay key={i} name={b.badges.name} iconUrl={b.badges.icon_url} size="md" />
          ))}
          {badges.length === 0 && <p className="text-text-muted text-sm">Aucun badge obtenu. Participe a des defis pour en debloquer !</p>}
        </div>
      </div>

      {/* Challenge history */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
          <Trophy size={14} />
          Historique des defis
        </h3>
        <div className="space-y-2">
          {challenges.filter(c => c.challenges).map((c, i) => {
            const ch = c.challenges!
            const isActive = ch.status === 'active'
            const isCompleted = ch.status === 'completed'
            return (
              <Link key={i} href={`/challenges/${ch.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-tertiary transition-colors">
                <span className="text-sm font-bold text-white">{ch.title}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase
                  ${isActive ? 'bg-accent-green/10 text-accent-green' : isCompleted ? 'bg-accent-orange/10 text-accent-orange' : 'bg-bg-tertiary text-text-muted'}`}>
                  {isActive ? 'En cours' : isCompleted ? 'Termine' : ch.status}
                </span>
              </Link>
            )
          })}
          {challenges.length === 0 && <p className="text-text-muted text-sm">Aucun defi rejoint pour le moment.</p>}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
          <Settings size={14} />
          Parametres
        </h3>
        <form action={async (formData: FormData) => {
          'use server'
          await updateProfile(formData)
        }} className="space-y-4">
          <Input name="username" label="Nom d'utilisateur" defaultValue={profile.username} />
          <Select name="entry_mode" label="Mode de saisie" defaultValue={profile.entry_mode}>
            <option value="quick">Rapide (tous les champs)</option>
            <option value="wizard">Wizard (un champ a la fois)</option>
          </Select>
          <Button type="submit">Sauvegarder</Button>
        </form>
      </div>

      <form action={logout}>
        <Button variant="danger" type="submit" className="w-full">Se deconnecter</Button>
      </form>
    </div>
  )
}
