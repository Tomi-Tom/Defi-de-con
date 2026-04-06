import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function RankWidget({ rank, total }: { rank: number; total: number }) {
  const percentile = total > 0 ? Math.round((1 - rank / total) * 100) : 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
            <TrendingUp size={20} className="text-accent-orange" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Classement</div>
            <div className="text-2xl font-black text-white">#{rank}</div>
            {percentile > 0 && (
              <div className="text-xs font-semibold text-accent-orange">
                Top {100 - percentile}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
