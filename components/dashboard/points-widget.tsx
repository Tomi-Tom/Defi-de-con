import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export function PointsWidget({ points, todayPoints }: { points: number; todayPoints: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Points</div>
        <AnimatedCounter value={points} className="text-3xl font-black text-white" />
        {todayPoints > 0 && (
          <div className="text-sm font-semibold text-accent-green mt-1">+{todayPoints} aujourd'hui</div>
        )}
      </CardContent>
    </Card>
  )
}
