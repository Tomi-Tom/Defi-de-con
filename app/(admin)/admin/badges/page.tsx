import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBadge, deleteBadge, awardBadgeToUser, revokeBadgeFromUser } from '@/lib/actions/admin-badges'
import { Award, Plus, Trash2, Gift, Users } from 'lucide-react'

export default async function AdminBadgesPage() {
  const supabase = await createClient()

  const [badgesRes, usersRes, awardedRes] = await Promise.all([
    supabase.from('badges').select('*').order('name'),
    supabase.from('profiles').select('id, username').order('username'),
    supabase.from('user_badges').select('id, user_id, badge_id, challenge_id, earned_at, profiles(username), badges(name, icon_url)').order('earned_at', { ascending: false }).limit(50),
  ])

  type Badge = { id: string; name: string; description: string; icon_url: string; condition_type: string; condition_value: number }
  type User = { id: string; username: string }
  type AwardedBadge = {
    id: string; user_id: string; badge_id: string; challenge_id: string | null; earned_at: string
    profiles: { username: string } | null
    badges: { name: string; icon_url: string } | null
  }

  const badges = (badgesRes.data ?? []) as unknown as Badge[]
  const users = (usersRes.data ?? []) as unknown as User[]
  const awarded = (awardedRes.data ?? []) as unknown as AwardedBadge[]

  const iconOptions = [
    '/badges/default.svg', '/badges/first-step.svg', '/badges/fire.svg', '/badges/lightning.svg',
    '/badges/trophy.svg', '/badges/star.svg', '/badges/medal.svg', '/badges/podium.svg',
    '/badges/flag.svg', '/badges/rocket.svg', '/badges/target.svg', '/badges/shield.svg',
    '/badges/heart.svg', '/badges/crown.svg', '/badges/diamond.svg', '/badges/bolt.svg',
    '/badges/sunrise.svg', '/badges/muscle.svg', '/badges/check-circle.svg',
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Award size={24} className="text-accent-orange" />
        Admin — Badges
      </h2>

      {/* Create badge form */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Plus size={14} />
            Creer un badge
          </h3>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            'use server'
            await createBadge(formData)
          }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input name="name" label="Nom" placeholder="Ex: Warrior" required />
            <Input name="description" label="Description" placeholder="Decris le badge..." />
            <Select name="icon_url" label="Icone">
              {iconOptions.map(url => (
                <option key={url} value={url}>{url.split('/').pop()?.replace('.svg', '')}</option>
              ))}
            </Select>
            <Select name="condition_type" label="Type de condition">
              <option value="streak">Streak</option>
              <option value="completion">Completion</option>
              <option value="points">Points</option>
              <option value="custom">Custom (attribue manuellement)</option>
            </Select>
            <Input name="condition_value" type="number" label="Valeur de condition" placeholder="0" />
            <div className="flex items-end">
              <Button type="submit" className="w-full">Creer le badge</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Badge list */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">
            Tous les badges ({badges.length})
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {badges.map(b => (
              <div key={b.id} className="relative group bg-bg-tertiary rounded-xl p-4 flex flex-col items-center text-center border border-border hover:border-accent-green/30 transition-all">
                <BadgeDisplay name={b.name} iconUrl={b.icon_url} size="lg" />
                <p className="text-[10px] text-text-muted mt-1">{b.description}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold mt-1">
                  {b.condition_type}: {b.condition_value}
                </span>
                <form action={async () => {
                  'use server'
                  await deleteBadge(b.id)
                }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="submit" className="p-1 rounded bg-error/20 text-error hover:bg-error/30">
                    <Trash2 size={12} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Award badge to user */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Gift size={14} />
            Attribuer un badge
          </h3>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            'use server'
            await awardBadgeToUser(formData)
          }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select name="user_id" label="Utilisateur" required>
              <option value="">-- Choisir --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </Select>
            <Select name="badge_id" label="Badge" required>
              <option value="">-- Choisir --</option>
              {badges.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Attribuer</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recently awarded */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Users size={14} />
            Badges attribues recemment
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {awarded.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors">
                {a.badges && (
                  <BadgeDisplay name={a.badges.name} iconUrl={a.badges.icon_url} size="sm" />
                )}
                <div className="flex-1">
                  <span className="text-sm font-bold text-white">{a.profiles?.username ?? 'Inconnu'}</span>
                  <span className="text-text-muted text-sm"> a obtenu </span>
                  <span className="text-sm font-bold text-accent-green">{a.badges?.name ?? '?'}</span>
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(a.earned_at).toLocaleDateString('fr-FR')}
                </span>
                <form action={async () => {
                  'use server'
                  await revokeBadgeFromUser(a.id)
                }}>
                  <button type="submit" className="p-1 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors" title="Revoquer">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))}
            {awarded.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">Aucun badge attribue</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
