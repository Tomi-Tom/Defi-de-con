import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Star, Award, Trophy, Check } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

export default async function PublicProfilePage(props: PageProps<'/profile/[userId]'>) {
  const { userId } = await props.params
  const supabase = await createClient()

  const [profileRes, badgesRes, challengesRes] = await Promise.all([
    supabase.from('profiles').select('username, avatar_url, points_total').eq('id', userId).single(),
    supabase.from('user_badges').select('badge_id, earned_at, badges(name, icon_url, description)').eq('user_id', userId),
    supabase.from('challenge_participants').select('challenges(id, title, status)').eq('user_id', userId),
  ])

  if (!profileRes.data) notFound()
  const profile = profileRes.data as unknown as { username: string; avatar_url: string | null; points_total: number }
  const badges = (badgesRes.data ?? []) as unknown as Array<{ badge_id: string; earned_at: string; badges: { name: string; icon_url: string; description: string } | null }>
  const challenges = (challengesRes.data ?? []) as unknown as Array<{ challenges: { id: string; title: string; status: string } | null }>

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bg-secondary via-bg-secondary to-bg-tertiary border border-border p-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-green to-accent-green-dark" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-green/5 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-6">
          <UserAvatar username={profile.username} avatarUrl={profile.avatar_url} size="xl" className="rounded-2xl" />
          <div>
            <h1 className="text-3xl font-black text-white mb-1">{profile.username}</h1>
            <p className="text-accent-green font-bold text-sm">{profile.points_total} points</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Points', value: profile.points_total, icon: Star, color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Badges', value: badges.length, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Defis', value: challenges.length, icon: Trophy, color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
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

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-bg-secondary rounded-2xl border border-border p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
            <Award size={14} />
            Badges ({badges.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {badges.map((b) => {
              if (!b.badges) return null
              return (
                <div key={b.badge_id} className="bg-bg-tertiary rounded-xl border border-accent-green/20 p-3 text-center hover:border-accent-green/40 transition-all hover:shadow-[0_0_15px_rgba(0,255,135,0.1)]">
                  <div className="w-10 h-10 mx-auto mb-1.5 relative">
                    <img src={b.badges.icon_url} alt={b.badges.name} className="w-full h-full" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-green flex items-center justify-center">
                      <Check size={10} className="text-black" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-white leading-tight">{b.badges.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Challenge history */}
      {challenges.length > 0 && (
        <div className="bg-bg-secondary rounded-2xl border border-border p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
            <Trophy size={14} />
            Defis ({challenges.length})
          </h3>
          <div className="space-y-2">
            {challenges.filter(c => c.challenges).map((c, i) => {
              const ch = c.challenges!
              const isActive = ch.status === 'active'
              const isCompleted = ch.status === 'completed'
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-bg-tertiary">
                  <span className="text-sm font-bold text-white">{ch.title}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase
                    ${isActive ? 'bg-accent-green/10 text-accent-green' : isCompleted ? 'bg-accent-orange/10 text-accent-orange' : 'bg-bg-tertiary text-text-muted'}`}>
                    {isActive ? 'En cours' : isCompleted ? 'Termine' : ch.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
