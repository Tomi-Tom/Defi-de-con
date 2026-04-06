'use client'

import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Calendar, Check, TrendingUp, TrendingDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDuration } from '@/components/ui/duration-input'

interface FieldDef {
  id: string
  label: string
  type: string
  order: number
}

interface EntryValue {
  field_id: string
  value_text: string | null
  value_number: number | null
  value_date: string | null
  value_file_url: string | null
}

interface JournalEntry {
  id: string
  entry_date: string
  entry_values: EntryValue[]
}

interface GoalValue {
  field_id: string
  goal_date: string
  target_value: number
}

interface ChallengeJournalProps {
  entries: JournalEntry[]
  fields: FieldDef[]
  goals?: GoalValue[]
}

export function ChallengeJournal({ entries, fields, goals = [] }: ChallengeJournalProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order)
  const numericFieldIds = new Set(fields.filter(f => f.type === 'number').map(f => f.id))
  const numericFields = fields.filter(f => f.type === 'number').sort((a, b) => a.order - b.order)

  const chartData = entries.map(e => {
    const point: Record<string, unknown> = { date: e.entry_date }
    for (const f of numericFields) {
      const val = e.entry_values.find(v => v.field_id === f.id)
      point[f.label] = val?.value_number ?? null
    }
    return point
  }).reverse()

  const getGoal = (fieldId: string, date: string) =>
    goals.find(g => g.field_id === fieldId && g.goal_date === date)

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={48} />}
        title="Aucune saisie pour le moment"
        description="Commence par remplir ta premiere journee pour voir ton journal ici."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border text-center">
          <div className="text-2xl font-black text-accent-green">{entries.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Saisies</div>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border text-center">
          <div className="text-2xl font-black text-white">{sortedFields.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Champs</div>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border text-center">
          <div className="text-2xl font-black text-accent-orange">
            {computeCurrentStreak(entries)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Streak</div>
        </div>
      </div>

      {/* Evolution charts */}
      {numericFields.length > 0 && chartData.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Evolution</h3>
          {numericFields.map(f => (
            <div key={f.id} className="bg-bg-secondary rounded-xl border border-border p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">{f.label}</div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#666', fontSize: 10 }}
                    tickFormatter={(v: string) => {
                      try { return format(parseISO(v), 'dd/MM') } catch { return v }
                    }}
                    axisLine={{ stroke: '#222' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#666', fontSize: 10 }}
                    axisLine={{ stroke: '#222' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#888' }}
                    itemStyle={{ color: '#00ff87' }}
                    labelFormatter={(v) => {
                      const s = String(v)
                      try { return format(parseISO(s), 'd MMM yyyy', { locale: fr }) } catch { return s }
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={f.label}
                    stroke="#00ff87"
                    strokeWidth={2}
                    dot={{ fill: '#00ff87', r: 3, strokeWidth: 0 }}
                    activeDot={{ fill: '#00ff87', r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border" />

        <div className="space-y-3">
          {entries.map((entry, idx) => {
            const isToday = entry.entry_date === new Date().toISOString().slice(0, 10)
            const isFirst = idx === 0

            return (
              <div key={entry.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 mt-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${isToday
                      ? 'bg-accent-green/20 border-accent-green text-accent-green animate-pulse-glow'
                      : isFirst
                        ? 'bg-accent-green/10 border-accent-green/50 text-accent-green'
                        : 'bg-bg-tertiary border-border text-text-muted'}`}>
                    <Check size={16} />
                  </div>
                </div>

                {/* Entry card */}
                <div className={`flex-1 rounded-xl border p-4 transition-all duration-200 hover:border-accent-green/20
                  ${isToday ? 'bg-bg-secondary border-accent-green/30' : 'bg-bg-secondary border-border'}`}>

                  {/* Date header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`text-sm font-black ${isToday ? 'text-accent-green' : 'text-white'}`}>
                        {isToday ? "Aujourd'hui" : format(parseISO(entry.entry_date), 'EEEE d MMMM', { locale: fr })}
                      </span>
                      {!isToday && (
                        <span className="text-xs text-text-muted ml-2">
                          {format(parseISO(entry.entry_date), 'yyyy', { locale: fr })}
                        </span>
                      )}
                    </div>
                    {isToday && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green uppercase tracking-wider">
                        Jour {entries.length - idx}
                      </span>
                    )}
                    {!isToday && (
                      <span className="text-[10px] font-bold text-text-muted">
                        Jour {entries.length - idx}
                      </span>
                    )}
                  </div>

                  {/* Field values grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sortedFields.map(f => {
                      const val = entry.entry_values.find(v => v.field_id === f.id)
                      const displayValue = val?.value_number ?? val?.value_text ?? val?.value_date ?? null
                      const goal = getGoal(f.id, entry.entry_date)
                      const hasGoal = goal && numericFieldIds.has(f.id)
                      const metGoal = hasGoal && val?.value_number != null && (val.value_number as number) >= goal!.target_value

                      return (
                        <div key={f.id} className={`rounded-lg p-2.5 border
                          ${hasGoal
                            ? metGoal
                              ? 'bg-accent-green/5 border-accent-green/20'
                              : 'bg-accent-orange/5 border-accent-orange/20'
                            : 'bg-bg-tertiary border-border'}`}>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">{f.label}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-white">
                              {displayValue !== null
                                ? (f.type === 'duration' && typeof displayValue === 'number' ? formatDuration(displayValue) : String(displayValue))
                                : '—'}
                            </span>
                            {hasGoal && (
                              <>
                                <span className="text-[10px] text-text-muted">/ {goal.target_value}</span>
                                {metGoal ? (
                                  <TrendingUp size={12} className="text-accent-green" />
                                ) : (
                                  <TrendingDown size={12} className="text-accent-orange" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function computeCurrentStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0
  const sorted = [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].entry_date)
    const curr = new Date(sorted[i].entry_date)
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) streak++
    else break
  }
  return streak
}
