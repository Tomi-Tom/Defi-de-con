import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'

export default async function AdminBadgesPage() {
  const supabase = await createClient()
  const { data: badges } = await supabase.from('badges').select('*').order('name')

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Admin — Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(badges ?? []).map(b => (
          <Card key={b.id}>
            <CardContent className="p-4 flex flex-col items-center">
              <BadgeDisplay name={b.name} iconUrl={b.icon_url} size="lg" />
              <p className="text-xs text-text-muted mt-2 text-center">{b.description}</p>
              <p className="text-xs text-accent-green mt-1">{b.condition_type}: {b.condition_value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
