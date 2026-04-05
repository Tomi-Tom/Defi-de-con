import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BadgeDisplay } from '@/components/ui/badge-display'

interface RecentBadge {
  name: string
  iconUrl: string
}

export function RecentBadgesWidget({ badges }: { badges: RecentBadge[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Badges recents</h3>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          {badges.map((b) => (
            <BadgeDisplay key={b.name} name={b.name} iconUrl={b.iconUrl} size="md" />
          ))}
          {badges.length === 0 && (
            <p className="text-text-muted text-sm">Aucun badge pour le moment</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
