'use client'

import { useState, useTransition } from 'react'
import { createChallenge } from '@/lib/actions/challenges'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChallengeFieldsBuilder } from '@/components/challenges/challenge-fields-builder'
import { toast } from 'sonner'

export default function NewChallengePage() {
  const [fields, setFields] = useState<Array<{
    name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>>([])
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createChallenge({
        title: form.get('title'),
        description: form.get('description'),
        start_date: form.get('start_date'),
        duration_days: Number(form.get('duration_days')),
        fields,
      })

      if (result?.error) {
        toast.error(result.error)
      }
      // On success, the Server Action redirects
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Nouveau defi</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="Titre" placeholder="Ex: 30 jours de pompes" required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-text-secondary">Description</label>
          <textarea
            name="description"
            rows={3}
            className="rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5 text-white placeholder:text-text-muted focus:border-accent-green focus:outline-none resize-none"
            placeholder="Decris le defi..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input name="start_date" type="date" label="Date de debut" required />
          <Input name="duration_days" type="number" label="Duree (jours)" placeholder="30" required />
        </div>

        <ChallengeFieldsBuilder onChange={setFields} />

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? 'Creation...' : 'Creer le defi'}
        </Button>
      </form>
    </div>
  )
}
