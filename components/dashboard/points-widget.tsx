import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface PointsBreakdown {
  entries: number
  streaks: number
  bonuses: number
}

export function PointsWidget({
  points,
  todayPoints,
  breakdown,
}: {
  points: number
  todayPoints: number
  breakdown?: PointsBreakdown
}) {
  const total = breakdown ? breakdown.entries + breakdown.streaks + breakdown.bonuses : 0
  const hasBreakdown = breakdown && total > 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
            <Star size={20} className="text-accent-green" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Points</div>
            <AnimatedCounter value={points} className="text-2xl font-black text-white" />
            {todayPoints > 0 && (
              <div className="text-xs font-semibold text-accent-green">+{todayPoints} aujourd&apos;hui</div>
            )}
            {hasBreakdown && (
              <div className="mt-2">
                <div className="flex rounded-full overflow-hidden h-1.5 w-full gap-px">
                  <div
                    className="bg-accent-green"
                    style={{ width: `${(breakdown.entries / total) * 100}%` }}
                    title={`Saisies: ${breakdown.entries} pts`}
                  />
                  <div
                    className="bg-accent-orange"
                    style={{ width: `${(breakdown.streaks / total) * 100}%` }}
                    title={`Streaks: ${breakdown.streaks} pts`}
                  />
                  <div
                    className="bg-text-secondary"
                    style={{ width: `${(breakdown.bonuses / total) * 100}%` }}
                    title={`Bonus: ${breakdown.bonuses} pts`}
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] text-accent-green">Saisies</span>
                  <span className="text-[9px] text-accent-orange">Streaks</span>
                  <span className="text-[9px] text-text-secondary">Bonus</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
