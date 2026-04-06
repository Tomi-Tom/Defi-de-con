import { Trophy, Crown, Medal, Award } from 'lucide-react'

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) return null

  const podiumColors = [
    { bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', text: 'text-yellow-400', icon: Crown },
    { bg: 'bg-gray-300/10', border: 'border-gray-300/20', text: 'text-gray-300', icon: Medal },
    { bg: 'bg-amber-600/10', border: 'border-amber-600/20', text: 'text-amber-600', icon: Award },
  ]

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border overflow-hidden">
      <div className="p-5 pb-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
          <Trophy size={16} className="text-accent-orange" />
          Classement
        </h3>
      </div>
      <div className="px-3 pb-3">
        {entries.map((entry, i) => {
          const podium = i < 3 ? podiumColors[i] : null
          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-colors hover:bg-bg-tertiary
                ${podium ? `${podium.bg} border ${podium.border}` : ''}`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${podium ? podium.bg : 'bg-bg-tertiary'}`}>
                {podium ? (
                  <podium.icon size={16} className={podium.text} />
                ) : (
                  <span className="text-xs font-black text-text-muted">{i + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                ${podium ? `${podium.bg} ${podium.text}` : 'bg-accent-green/10 text-accent-green'}`}>
                {entry.username.slice(0, 2).toUpperCase()}
              </div>

              {/* Name */}
              <span className="flex-1 text-sm font-bold text-white">{entry.username}</span>

              {/* Streak */}
              <div className="flex items-center gap-1 text-accent-orange">
                <span className="text-xs font-bold">{entry.streak}j</span>
              </div>

              {/* Points */}
              <div className={`text-sm font-black ${podium ? podium.text : 'text-accent-green'}`}>
                {entry.points} pts
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
