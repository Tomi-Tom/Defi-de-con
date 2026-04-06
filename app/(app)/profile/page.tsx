import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfile } from '@/lib/actions/profile'
import { logout } from '@/lib/actions/auth'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, badgesRes, challengesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_badges').select('badges(name, icon_url), earned_at').eq('user_id', user.id).order('earned_at', { ascending: false }),
    supabase.from('challenge_participants').select('challenges(id, title, status)').eq('user_id', user.id),
  ])

  const profile = profileRes.data!
  const badges = badgesRes.data ?? []
  const challenges = challengesRes.data ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-black">Mon profil</h2>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Stats</h3></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-accent-green">{profile.points_total}</div>
              <div className="text-xs text-text-muted">Points</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{badges.length}</div>
              <div className="text-xs text-text-muted">Badges</div>
            </div>
            <div>
              <div className="text-2xl font-black text-accent-orange">{challenges.length}</div>
              <div className="text-xs text-text-muted">Defis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Badges</h3></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {badges.map((b, i) => (
              <BadgeDisplay
                key={i}
                name={(b.badges as unknown as { name: string; icon_url: string }).name}
                iconUrl={(b.badges as unknown as { name: string; icon_url: string }).icon_url}
              />
            ))}
            {badges.length === 0 && <p className="text-text-muted text-sm">Aucun badge</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Parametres</h3></CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
              'use server'
              await updateProfile(formData)
            }} className="space-y-4">
            <Input name="username" label="Nom d'utilisateur" defaultValue={profile.username} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-text-secondary">Mode de saisie</label>
              <select
                name="entry_mode"
                defaultValue={profile.entry_mode}
                className="rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5 text-white focus:border-accent-green focus:outline-none"
              >
                <option value="quick">Rapide (tous les champs)</option>
                <option value="wizard">Wizard (un champ a la fois)</option>
              </select>
            </div>
            <Button type="submit">Sauvegarder</Button>
          </form>
        </CardContent>
      </Card>

      <form action={logout}>
        <Button variant="danger" type="submit" className="w-full">Se deconnecter</Button>
      </form>
    </div>
  )
}
