'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createChallenge } from '@/lib/actions/challenges'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ChallengeFieldsBuilder } from '@/components/challenges/challenge-fields-builder'
import { toast } from 'sonner'

export default function NewChallengePage() {
  const [fields, setFields] = useState<Array<{
    name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    // Validate fields client-side
    const validFields = fields.filter(f => f.label.trim() !== '' && f.name.trim() !== '')
    if (validFields.length === 0) {
      toast.error('Ajoute au moins un champ avec un label')
      return
    }

    startTransition(async () => {
      const result = await createChallenge({
        title: form.get('title') as string,
        description: (form.get('description') as string) || '',
        start_date: form.get('start_date') as string,
        duration_days: Number(form.get('duration_days')),
        fields: validFields,
      })

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.challengeId) {
        toast.success('Defi cree !')
        router.push(`/challenges/${result.challengeId}`)
      }
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Nouveau defi</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" label="Titre" placeholder="Ex: 30 jours de pompes" required />
        <Textarea
          name="description"
          label="Description"
          rows={3}
          placeholder="Decris le defi..."
        />
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
