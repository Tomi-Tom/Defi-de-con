import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function RankWidget({ rank, total }: { rank: number; total: number }) {
  const percentile = total > 0 ? Math.round((1 - rank / total) * 100) : 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Classement</div>
        <div className="text-3xl font-black text-white">#{rank}</div>
        {percentile > 0 && (
          <div className="text-sm font-semibold text-accent-orange flex items-center gap-1 mt-1">
            <TrendingUp size={14} />
            Top {100 - percentile}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
