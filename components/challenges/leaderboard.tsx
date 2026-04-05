import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
          <Trophy size={16} />
          Classement
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-2 rounded-lg ${i < 3 ? 'bg-bg-tertiary' : ''}`}
            >
              <span className={`w-6 text-center text-sm font-black
                ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                {i + 1}
              </span>
              <div className="w-7 h-7 rounded-full bg-accent-green/20 flex items-center justify-center text-xs font-bold text-accent-green">
                {entry.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="flex-1 text-sm font-semibold text-white">{entry.username}</span>
              <span className="text-sm font-bold text-accent-green">{entry.points} pts</span>
              <span className="text-xs text-accent-orange">{entry.streak}j</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
