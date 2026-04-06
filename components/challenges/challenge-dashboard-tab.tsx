import { Card, CardContent } from '@/components/ui/card'
import { Leaderboard } from '@/components/challenges/leaderboard'
import { Target } from 'lucide-react'

interface FieldDef {
  id: string
  label: string
  type: string
  required: boolean
  order: number
}

interface LeaderboardEntry {
  userId: string
  username: string
  avatarUrl: string | null
  points: number
  streak: number
}

interface ChallengeDashboardTabProps {
  fields: FieldDef[]
  leaderboardEntries: LeaderboardEntry[]
}

export function ChallengeDashboardTab({ fields, leaderboardEntries }: ChallengeDashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Challenge fields as tags */}
      <div className="bg-bg-secondary rounded-2xl border border-border p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
          <Target size={14} />
          Donnees a tracker chaque jour
        </h3>
        <div className="flex flex-wrap gap-2">
          {fields
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-tertiary border border-border">
                <span className="text-sm font-bold text-white">{f.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green font-bold uppercase">{f.type}</span>
                {f.required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange font-bold">requis</span>}
              </div>
            ))}
        </div>
      </div>

      {/* Leaderboard */}
      <Leaderboard entries={leaderboardEntries} />
    </div>
  )
}
