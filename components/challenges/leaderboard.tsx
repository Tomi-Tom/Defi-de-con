import { Users } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

interface ParticipantEntry {
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Leaderboard({ entries }: { entries: ParticipantEntry[] }) {
  if (entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.username.localeCompare(b.username))

  return (
    <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
          <Users size={16} className="text-accent-green" />
          Participants ({entries.length})
        </h3>
      </div>
      <div className="px-3 pb-3">
        {sorted.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-colors hover:bg-bg-tertiary"
          >
            <UserAvatar username={entry.username} avatarUrl={entry.avatarUrl} size="md" />
            <span className="flex-1 text-sm font-bold text-white">{entry.username}</span>
            {entry.streak > 0 && (
              <div className="flex items-center gap-1 text-accent-orange">
                <span className="text-xs font-bold">{entry.streak}j</span>
              </div>
            )}
            <div className="text-sm font-black text-accent-green">
              {entry.points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
