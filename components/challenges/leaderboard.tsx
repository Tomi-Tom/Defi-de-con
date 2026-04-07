import { Users } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

interface ParticipantEntry {
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Leaderboard({ entries, currentUserId }: { entries: ParticipantEntry[]; currentUserId?: string }) {
  if (entries.length === 0) return null

  const currentUser = currentUserId ? entries.find(e => e.userId === currentUserId) : null
  const others = [...entries]
    .filter(e => e.userId !== currentUserId)
    .sort((a, b) => a.username.localeCompare(b.username))
  const sorted = currentUser ? [currentUser, ...others] : others

  return (
    <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
          <Users size={16} className="text-accent-green" />
          Participants ({entries.length})
        </h3>
      </div>
      <div className="px-3 pb-3">
        {sorted.map((entry) => {
          const isMe = entry.userId === currentUserId
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-colors
                ${isMe
                  ? 'bg-accent-green/10 border border-accent-green/20'
                  : 'hover:bg-bg-tertiary'
                }`}
            >
              <UserAvatar username={entry.username} avatarUrl={entry.avatarUrl} size="md" />
              <span className="flex-1 text-sm font-bold text-white">
                {entry.username}
                {isMe && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold">Toi</span>
                )}
              </span>
              {entry.streak > 0 && (
                <div className="flex items-center gap-1 text-accent-orange">
                  <span className="text-xs font-bold">{entry.streak}j</span>
                </div>
              )}
              <div className="text-sm font-black text-accent-green">
                {entry.points} pts
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
