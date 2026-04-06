'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { submitEntry, type EntryResult } from '@/lib/actions/entries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DurationInput } from '@/components/ui/duration-input'
import { Target, AlertTriangle, Copy } from 'lucide-react'
import { fireConfetti } from '@/components/ui/confetti'
import { toast } from 'sonner'
import { selectContextualQuote } from '@/lib/utils/quotes'

interface Field {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  config: Record<string, unknown> | null
}

interface ExistingValue {
  field_id: string
  value_text: string | null
  value_number: number | null
  value_date: string | null
  value_file_url: string | null
}

interface GoalInfo {
  fieldId: string
  todayTarget: number | null
  carryOver: number // accumulated deficit from previous days (negative = avance)
  adjustment?: number // admin bonus/malus applied
}

interface DailyEntryFormProps {
  challengeId: string
  fields: Field[]
  existingValues?: ExistingValue[]
  yesterdayValues?: ExistingValue[]
  quotes: Array<{ text: string; author: string | null; context: string }>
  goals?: GoalInfo[]
}

export function DailyEntryForm({ challengeId, fields, existingValues = [], yesterdayValues, quotes, goals = [] }: DailyEntryFormProps) {
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit, setValue } = useForm()
  const [durationValues, setDurationValues] = useState<Record<string, number>>({})
  const router = useRouter()

  const getExistingValue = (fieldId: string) =>
    existingValues.find(v => v.field_id === fieldId)

  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      const values = fields.map(f => {
        const raw = data[f.name]
        return {
          field_id: f.id,
          value_text: f.type === 'text' || f.type === 'boolean' ? String(raw ?? '') : null,
          value_number: (f.type === 'number') ? (Number(raw) || null) : (f.type === 'duration') ? (durationValues[f.id] ?? null) : null,
          value_date: f.type === 'date' ? String(raw ?? '') || null : null,
          value_file_url: null,
        }
      })

      const result: EntryResult = await submitEntry({ challenge_id: challengeId, values })

      if (result.error) {
        toast.error(result.error, {
          description: 'Pas de panique, reessaie !',
          style: { background: '#1a0a0a', border: '1px solid #ef4444' },
        })
        return
      }

      // Get a motivational quote
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quote = quotes.length > 0 ? selectContextualQuote(quotes as any, 'entry_submitted') : null

      // Fire confetti immediately
      fireConfetti(result.streakMilestone ? 'milestone' : 'success')

      // Redirect to challenge page with result in URL params
      const params = new URLSearchParams()
      params.set('entry', 'success')
      params.set('points', String(result.pointsAwarded ?? 0))
      if (result.currentStreak) params.set('streak', String(result.currentStreak))
      if (result.streakMilestone) params.set('milestone', '1')
      if (result.pointsPenalty && result.pointsPenalty < 0) params.set('penalty', String(result.pointsPenalty))
      if (result.goalsCatchup) params.set('catchup', '1')
      if (result.goalsPerfect) params.set('perfect', '1')
      if (result.isUpdate) params.set('updated', '1')
      if (result.newBadges && result.newBadges.length > 0) params.set('badges', result.newBadges.map(b => b.name).join(','))
      if (quote) params.set('quote', quote.text)

      router.push(`/challenges/${challengeId}?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {yesterdayValues && yesterdayValues.length > 0 && existingValues.length === 0 && (
        <button
          type="button"
          onClick={() => {
            for (const yv of yesterdayValues) {
              const field = fields.find(f => f.id === yv.field_id)
              if (field) {
                if (yv.value_number !== null) setValue(field.name, yv.value_number)
                else if (yv.value_text !== null) setValue(field.name, yv.value_text)
                else if (yv.value_date !== null) setValue(field.name, yv.value_date)
              }
            }
          }}
          className="w-full p-3 rounded-xl border border-border bg-bg-tertiary text-sm font-bold text-text-secondary hover:text-white hover:border-accent-green/30 transition-all flex items-center justify-center gap-2"
        >
          <Copy size={14} />
          Reprendre les valeurs d'hier
        </button>
      )}
      {fields
        .sort((a, b) => (a as unknown as { order: number }).order - (b as unknown as { order: number }).order)
        .map(field => {
          const existing = getExistingValue(field.id)
          const goalInfo = goals.find(g => g.fieldId === field.id)
          const effectiveTarget = goalInfo ? (goalInfo.todayTarget ?? 0) + goalInfo.carryOver : null

          return (
            <div key={field.id}>
              {field.type === 'number' && (
                <div>
                  <Input
                    label={field.label}
                    type="number"
                    step="any"
                    defaultValue={existing?.value_number ?? ''}
                    required={field.required}
                    {...register(field.name)}
                  />
                  {goalInfo && (goalInfo.todayTarget !== null || goalInfo.carryOver > 0) && (
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      {goalInfo.todayTarget !== null && (
                        <span className="flex items-center gap-1 text-accent-green">
                          <Target size={12} />
                          Objectif : {goalInfo.todayTarget}
                        </span>
                      )}
                      {goalInfo.carryOver > 0 && (
                        <span className="flex items-center gap-1 text-accent-orange">
                          <AlertTriangle size={12} />
                          Retard : +{goalInfo.carryOver} a rattraper
                        </span>
                      )}
                      {goalInfo.adjustment !== undefined && goalInfo.adjustment !== 0 && (
                        <span className={`flex items-center gap-1 ${goalInfo.adjustment > 0 ? 'text-accent-green' : 'text-accent-orange'}`}>
                          {goalInfo.adjustment > 0 ? 'Bonus' : 'Handicap'} : {goalInfo.adjustment > 0 ? '+' : ''}{goalInfo.adjustment}
                        </span>
                      )}
                      {effectiveTarget !== null && effectiveTarget > 0 && (goalInfo.carryOver > 0 || (goalInfo.adjustment ?? 0) !== 0) && (
                        <span className="font-bold text-white">
                          Total : {effectiveTarget}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              {field.type === 'text' && (
                <Input
                  label={field.label}
                  type="text"
                  defaultValue={existing?.value_text ?? ''}
                  required={field.required}
                  {...register(field.name)}
                />
              )}
              {field.type === 'date' && (
                <Input
                  label={field.label}
                  type="date"
                  defaultValue={existing?.value_date ?? ''}
                  required={field.required}
                  {...register(field.name)}
                />
              )}
              {field.type === 'boolean' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={existing?.value_text === 'true'}
                    className="w-5 h-5 accent-accent-green"
                    {...register(field.name)}
                  />
                  <span className="text-sm font-semibold text-white">{field.label}</span>
                </label>
              )}
              {field.type === 'duration' && (
                <DurationInput
                  label={field.label}
                  defaultValue={existing?.value_number}
                  required={field.required}
                  onChange={(secs) => setDurationValues(prev => ({ ...prev, [field.id]: secs }))}
                />
              )}
            </div>
          )
        })}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? 'Envoi...' : existingValues.length > 0 ? 'Modifier' : 'Valider'}
      </Button>
    </form>
  )
}
