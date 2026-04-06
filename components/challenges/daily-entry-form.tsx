'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { submitEntry, type EntryResult } from '@/lib/actions/entries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface DailyEntryFormProps {
  challengeId: string
  fields: Field[]
  existingValues?: ExistingValue[]
  quotes: Array<{ text: string; author: string | null; context: string }>
}

export function DailyEntryForm({ challengeId, fields, existingValues = [], quotes }: DailyEntryFormProps) {
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit } = useForm()

  const getExistingValue = (fieldId: string) =>
    existingValues.find(v => v.field_id === fieldId)

  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      const values = fields.map(f => {
        const raw = data[f.name]
        return {
          field_id: f.id,
          value_text: f.type === 'text' || f.type === 'boolean' ? String(raw ?? '') : null,
          value_number: f.type === 'number' ? Number(raw) || null : null,
          value_date: f.type === 'date' ? String(raw ?? '') || null : null,
          value_file_url: null, // File upload handled separately
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

      // Success feedback
      if (result.streakMilestone) {
        fireConfetti('milestone')
        toast.success(`Serie de ${result.currentStreak} jours !`, {
          description: `+${result.pointsAwarded} points`,
          style: { background: '#0a1a0a', border: '1px solid #00ff87' },
        })
      } else {
        fireConfetti('success')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quote = quotes.length > 0
          ? selectContextualQuote(quotes as any, 'entry_submitted')
          : null
        toast.success(quote?.text ?? 'Bien joue !', {
          description: `+${result.pointsAwarded} points`,
          style: { background: '#0a1a0a', border: '1px solid #00ff87' },
        })
      }

      // Badge notifications
      if (result.newBadges && result.newBadges.length > 0) {
        for (const badge of result.newBadges) {
          setTimeout(() => {
            toast.success(`Badge debloque : ${badge.name}`, {
              style: { background: '#1a1a0a', border: '1px solid #FFD700' },
            })
          }, 1500)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields
        .sort((a, b) => (a as unknown as { order: number }).order - (b as unknown as { order: number }).order)
        .map(field => {
          const existing = getExistingValue(field.id)
          return (
            <div key={field.id}>
              {field.type === 'number' && (
                <Input
                  label={field.label}
                  type="number"
                  step="any"
                  defaultValue={existing?.value_number ?? ''}
                  required={field.required}
                  {...register(field.name)}
                />
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
            </div>
          )
        })}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? 'Envoi...' : existingValues.length > 0 ? 'Modifier' : 'Valider'}
      </Button>
    </form>
  )
}
