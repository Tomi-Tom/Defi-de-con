'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createChallenge } from '@/lib/actions/challenges'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ChallengeFieldsBuilder } from '@/components/challenges/challenge-fields-builder'
import { toast } from 'sonner'
import { Flame, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewChallengePage() {
  const [fields, setFields] = useState<Array<{
    name: string; label: string; type: string; required: boolean; order: number; config: Record<string, unknown> | null
  }>>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

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
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-text-muted hover:text-white transition-colors">
        <ArrowLeft size={14} /> Retour
      </Link>

      {/* Hero */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 mb-4">
          <Flame size={14} className="text-accent-green" />
          <span className="text-xs font-black uppercase tracking-wider text-accent-green">Nouveau defi</span>
        </div>
        <h2 className="text-3xl font-black">Creer un defi</h2>
        <p className="text-text-muted text-sm mt-1">Definis les regles, les champs a tracker, et lance le defi.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-bg-secondary rounded-2xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Informations</h3>
          <Input name="title" label="Titre du defi" placeholder="Ex: 30 jours de pompes" required />
          <Textarea
            name="description"
            label="Description"
            rows={3}
            placeholder="Decris le defi, les regles, la motivation..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input name="start_date" type="date" label="Date de debut" required />
            <Input name="duration_days" type="number" label="Duree (jours)" placeholder="30" required />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-2xl border border-border p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted mb-4">Champs a tracker</h3>
          <ChallengeFieldsBuilder onChange={setFields} />
        </div>

        <Button type="submit" size="lg" className="w-full shadow-[0_0_20px_rgba(0,255,135,0.2)]" disabled={isPending}>
          {isPending ? 'Creation en cours...' : 'Creer le defi'}
        </Button>
      </form>
    </div>
  )
}
