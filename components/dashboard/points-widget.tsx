import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export function PointsWidget({ points, todayPoints }: { points: number; todayPoints: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
            <Star size={20} className="text-accent-green" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Points</div>
            <AnimatedCounter value={points} className="text-2xl font-black text-white" />
            {todayPoints > 0 && (
              <div className="text-xs font-semibold text-accent-green">+{todayPoints} aujourd'hui</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
