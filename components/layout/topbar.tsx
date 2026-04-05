import { Flame, Star } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface TopbarProps {
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Topbar({ username, avatarUrl, points, streak }: TopbarProps) {
  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-accent-orange">
          <Flame size={18} />
          <span className="text-sm font-bold">{streak}j</span>
        </div>
        <div className="flex items-center gap-2 text-accent-green">
          <Star size={18} />
          <AnimatedCounter value={points} className="text-sm font-bold" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-secondary">{username}</span>
        <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-xs font-bold text-black">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full rounded-full object-cover" />
          ) : (
            username.slice(0, 2).toUpperCase()
          )}
        </div>
      </div>
    </header>
  )
}
