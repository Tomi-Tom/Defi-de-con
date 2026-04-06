import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <Card variant={streak > 0 ? 'accent' : 'default'}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${streak > 0 ? 'bg-black/20' : 'bg-accent-orange/10'}`}>
            <Flame size={20} className={streak > 0 ? 'text-black' : 'text-accent-orange'} />
          </div>
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${streak > 0 ? 'text-black/60' : 'text-text-muted'}`}>
              Streak actuel
            </div>
            <div className={`text-2xl font-black ${streak > 0 ? 'text-black' : 'text-white'}`}>
              {streak} <span className="text-sm font-semibold">jours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
