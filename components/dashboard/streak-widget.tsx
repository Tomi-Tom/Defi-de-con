import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <Card variant={streak > 0 ? 'accent' : 'default'}>
      <CardContent className="p-4">
        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${streak > 0 ? 'text-black/60' : 'text-text-muted'}`}>
          Streak actuel
        </div>
        <div className={`flex items-center gap-2 ${streak > 0 ? 'text-black' : 'text-white'}`}>
          <Flame size={28} />
          <span className="text-4xl font-black">{streak}</span>
          <span className="text-lg font-semibold">jours</span>
        </div>
      </CardContent>
    </Card>
  )
}
