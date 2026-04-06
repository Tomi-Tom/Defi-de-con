import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Calendar, Zap } from 'lucide-react'

interface StatsGridProps {
  completedChallenges: number
  totalEntries: number
  bestStreakEver: number
}

export function StatsGridWidget({ completedChallenges, totalEntries, bestStreakEver }: StatsGridProps) {
  const stats = [
    {
      label: 'Defis termines',
      value: completedChallenges,
      icon: Trophy,
      color: 'text-accent-orange',
      bgColor: 'bg-accent-orange/10',
    },
    {
      label: 'Entrees totales',
      value: totalEntries,
      icon: Calendar,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/10',
    },
    {
      label: 'Meilleur streak',
      value: bestStreakEver,
      suffix: 'j',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ]

  return (
    <>
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bgColor} flex items-center justify-center`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{s.label}</div>
                <div className="text-2xl font-black text-white">
                  {s.value}{'suffix' in s ? s.suffix : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
