'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createChallenge } from '@/lib/actions/challenges'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'
import { Flame, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface FieldDef {
  label: string
  type: string
  required: boolean
}

const fieldTypes = [
  { value: 'number', label: 'Nombre' },
  { value: 'duration', label: 'Duree (hh:mm:ss)' },
  { value: 'text', label: 'Texte' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Oui/Non' },
]

export default function NewChallengePage() {
  const [fields, setFields] = useState<FieldDef[]>([
    { label: '', type: 'number', required: true },
  ])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addField = () => {
    setFields([...fields, { label: '', type: 'number', required: true }])
  }

  const removeField = (index: number) => {
    if (fields.length <= 1) return
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, key: keyof FieldDef, value: unknown) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], [key]: value as string | boolean }
    setFields(updated)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const title = (form.get('title') as string ?? '').trim()
    const description = (form.get('description') as string ?? '').trim()
    const start_date = form.get('start_date') as string ?? ''
    const duration_days = Number(form.get('duration_days')) || 0

    // Client validation
    if (!title || title.length < 2) {
      setError('Le titre doit faire au moins 2 caracteres')
      return
    }
    if (!start_date) {
      setError('Choisis une date de debut')
      return
    }
    if (duration_days < 1 || duration_days > 365) {
      setError('La duree doit etre entre 1 et 365 jours')
      return
    }

    const validFields = fields.filter(f => f.label.trim().length > 0)
    if (validFields.length === 0) {
      setError('Ajoute au moins un champ avec un label')
      return
    }

    startTransition(async () => {
      try {
        const result = await createChallenge({
          title,
          description,
          start_date,
          duration_days,
          fields: validFields,
        })

        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else if (result.challengeId) {
          toast.success('Defi cree avec succes !')
          router.push(`/admin`)
        }
      } catch (err) {
        console.error('Challenge creation error:', err)
        setError('Erreur inattendue lors de la creation')
        toast.error('Erreur inattendue')
      }
    })
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-text-muted hover:text-white transition-colors">
        <ArrowLeft size={14} /> Retour
      </Link>

      <div className="text-center py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20 mb-4">
          <Flame size={14} className="text-accent-green" />
          <span className="text-xs font-black uppercase tracking-wider text-accent-green">Nouveau defi</span>
        </div>
        <h2 className="text-3xl font-black">Creer un defi</h2>
        <p className="text-text-muted text-sm mt-1">Definis les regles, les champs a tracker, et lance le defi.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

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
            <Input name="duration_days" type="number" label="Duree (jours)" placeholder="30" required min={1} max={365} />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-2xl border border-border p-6 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Champs a tracker chaque jour</h3>
          <p className="text-xs text-text-muted">Definis ce que les participants devront saisir quotidiennement.</p>

          {fields.map((field, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-bg-tertiary rounded-xl border border-border">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Ex: Pompes, Kilometres, Notes..."
                  value={field.label}
                  onChange={e => updateField(i, 'label', e.target.value)}
                />
                <Select
                  value={field.type}
                  onChange={e => updateField(i, 'type', e.target.value)}
                >
                  {fieldTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
              <label className="flex items-center gap-1 mt-2.5">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={e => updateField(i, 'required', e.target.checked)}
                  className="accent-accent-green"
                />
                <span className="text-xs text-text-muted">Requis</span>
              </label>
              {fields.length > 1 && (
                <button type="button" onClick={() => removeField(i)} className="text-text-muted hover:text-error mt-2.5 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <Button type="button" variant="secondary" size="sm" onClick={addField}>
            <Plus size={14} className="mr-1" /> Ajouter un champ
          </Button>
        </div>

        <Button type="submit" size="lg" className="w-full shadow-[0_0_20px_rgba(0,255,135,0.2)]" disabled={isPending}>
          {isPending ? 'Creation en cours...' : 'Creer le defi'}
        </Button>
      </form>
    </div>
  )
}
