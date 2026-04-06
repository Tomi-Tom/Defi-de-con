import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { publishChallenge, deleteChallenge } from '@/lib/actions/challenges'
import Link from 'next/link'
import { Plus } from 'lucide-react'

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
