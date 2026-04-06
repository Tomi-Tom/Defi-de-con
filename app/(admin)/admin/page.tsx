import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { publishChallenge, deleteChallenge } from '@/lib/actions/challenges'
import Link from 'next/link'
import { Plus, Users, Award, MessageSquareQuote } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, title, status, start_date, duration_days, challenge_participants(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Admin — Defis</h2>
        <Link href="/admin/challenges/new">
          <Button><Plus size={16} className="mr-1" /> Nouveau defi</Button>
        </Link>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/admin/users" className="flex items-center gap-2 p-3 rounded-xl bg-bg-tertiary border border-border hover:border-accent-green/30 transition-all">
          <Users size={18} className="text-accent-green" />
          <span className="text-sm font-bold text-white">Utilisateurs</span>
        </Link>
        <Link href="/admin/badges" className="flex items-center gap-2 p-3 rounded-xl bg-bg-tertiary border border-border hover:border-accent-orange/30 transition-all">
          <Award size={18} className="text-accent-orange" />
          <span className="text-sm font-bold text-white">Badges</span>
        </Link>
        <Link href="/admin/quotes" className="flex items-center gap-2 p-3 rounded-xl bg-bg-tertiary border border-border hover:border-yellow-400/30 transition-all">
          <MessageSquareQuote size={18} className="text-yellow-400" />
          <span className="text-sm font-bold text-white">Citations</span>
        </Link>
      </div>

      <div className="space-y-3">
        {(challenges ?? []).map(c => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">{c.title}</h3>
                <p className="text-xs text-text-muted">
                  {c.status} — {(c.challenge_participants as unknown as { count: number }[])[0]?.count ?? 0} participants
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/challenges/${c.id}/edit`}>
                  <Button variant="secondary" size="sm">Modifier</Button>
                </Link>
                {c.status === 'draft' && (
                  <>
                    <form action={async () => {
                      'use server'
                      await publishChallenge(c.id)
                    }}>
                      <Button size="sm" type="submit">Publier</Button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await deleteChallenge(c.id)
                    }}>
                      <Button variant="danger" size="sm" type="submit">Supprimer</Button>
                    </form>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
