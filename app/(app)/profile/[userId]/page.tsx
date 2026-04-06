import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'

export default async function PublicProfilePage(props: PageProps<'/profile/[userId]'>) {
  const { userId } = await props.params
  const supabase = await createClient()

  const [profileRes, badgesRes, challengesRes] = await Promise.all([
    supabase.from('profiles').select('username, avatar_url, points_total').eq('id', userId).single(),
    supabase.from('user_badges').select('badges(name, icon_url)').eq('user_id', userId),
    supabase.from('challenge_participants').select('challenges(title, status)').eq('user_id', userId),
  ])

  if (!profileRes.data) notFound()
  const profile = profileRes.data

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center text-xl font-black text-black">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-black">{profile.username}</h2>
          <p className="text-accent-green font-bold">{profile.points_total} points</p>
        </div>
      </div>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Badges</h3></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {(badgesRes.data ?? []).map((b, i) => (
              <BadgeDisplay
                key={i}
                name={(b.badges as unknown as { name: string; icon_url: string }).name}
                iconUrl={(b.badges as unknown as { name: string; icon_url: string }).icon_url}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
