import { Flame, Star } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { UserAvatar } from '@/components/ui/user-avatar'

interface TopbarProps {
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Topbar({ username, avatarUrl, points, streak }: TopbarProps) {
  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6 sticky top-0 z-10 relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/20 to-transparent" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-orange/10 text-accent-orange">
          <Flame size={14} />
          <span className="text-xs font-black">{streak}j</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 text-accent-green">
          <Star size={14} />
          <AnimatedCounter value={points} className="text-xs font-black" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-secondary">{username}</span>
        <UserAvatar username={username} avatarUrl={avatarUrl} size="md" className="ring-2 ring-accent-green/30" />
      </div>
    </header>
  )
}
