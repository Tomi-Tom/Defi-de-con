import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Flame, Star, Target } from 'lucide-react'

interface WeeklySummaryProps {
  thisWeekEntries: number
  lastWeekEntries: number
  thisWeekPoints: number
  activeChallengesCount: number
}

export function WeeklySummaryWidget({ thisWeekEntries, lastWeekEntries, thisWeekPoints, activeChallengesCount }: WeeklySummaryProps) {
  const trend = thisWeekEntries - lastWeekEntries
  const trendColor = trend > 0 ? 'text-accent-green' : trend < 0 ? 'text-accent-orange' : 'text-text-muted'
  const trendLabel = trend > 0 ? `+${trend}` : `${trend}`

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted mb-4">Resume de la semaine</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-tertiary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={12} className="text-accent-green" />
              <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Saisies</span>
            </div>
            <div className="text-xl font-black text-white">{thisWeekEntries}</div>
            <div className={`text-[10px] font-bold ${trendColor}`}>{trendLabel} vs semaine derniere</div>
          </div>
          <div className="bg-bg-tertiary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Star size={12} className="text-accent-green" />
              <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Points</span>
            </div>
            <div className="text-xl font-black text-white">+{thisWeekPoints}</div>
          </div>
          <div className="bg-bg-tertiary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target size={12} className="text-accent-orange" />
              <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Defis actifs</span>
            </div>
            <div className="text-xl font-black text-white">{activeChallengesCount}</div>
          </div>
          <div className="bg-bg-tertiary/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={12} className="text-accent-orange" />
              <span className="text-[9px] font-black uppercase tracking-wider text-text-muted">Taux</span>
            </div>
            <div className="text-xl font-black text-white">{activeChallengesCount > 0 ? Math.round((thisWeekEntries / (activeChallengesCount * 7)) * 100) : 0}%</div>
            <div className="text-[10px] text-text-muted">completion cette semaine</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
