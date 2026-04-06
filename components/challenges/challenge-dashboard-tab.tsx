'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Leaderboard } from '@/components/challenges/leaderboard'
import { Target } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
  goals?: Array<{ field_id: string; goal_date: string; target_value: number }>
  challengeStartDate?: string
  durationDays?: number
}

export function ChallengeDashboardTab({ fields, leaderboardEntries, goals, challengeStartDate, durationDays }: ChallengeDashboardTabProps) {
  const numericFields = fields.filter(f => f.type === 'number')
  const goalsByField = new Map<string, Array<{ date: string; target: number }>>()
  for (const g of (goals ?? [])) {
    if (!goalsByField.has(g.field_id)) goalsByField.set(g.field_id, [])
    goalsByField.get(g.field_id)!.push({ date: g.goal_date, target: g.target_value })
  }

  const hasGoals = (goals ?? []).length > 0

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

      {/* Goals section */}
      {hasGoals && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Objectifs</h3>
            <span className="text-xs text-text-muted font-medium">
              {goals!.length} objectif{goals!.length > 1 ? 's' : ''} defini{goals!.length > 1 ? 's' : ''}{durationDays ? ` sur ${durationDays} jours` : ''}
            </span>
          </div>
          {numericFields
            .filter(f => goalsByField.has(f.id))
            .map(field => {
              const fieldGoals = goalsByField.get(field.id)!.sort((a, b) => a.date.localeCompare(b.date))
              return (
                <div key={field.id} className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border p-5">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-text-muted mb-3">{field.label} — Objectifs</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={fieldGoals}>
                      <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 9 }} tickFormatter={(v: string) => v.slice(5)} />
                      <YAxis tick={{ fill: '#666', fontSize: 9 }} width={35} />
                      <Tooltip contentStyle={{ background: '#141414', border: '1px solid #222', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                      <Bar dataKey="target" fill="#ff6b00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            })}
        </div>
      )}

      {/* Leaderboard */}
      <Leaderboard entries={leaderboardEntries} />
    </div>
  )
}
