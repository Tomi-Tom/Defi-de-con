'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical } from 'lucide-react'

interface Field {
  name: string
  label: string
  type: string
  required: boolean
  order: number
  config: Record<string, unknown> | null
}

interface ChallengeFieldsBuilderProps {
  initialFields?: Field[]
  onChange: (fields: Field[]) => void
}

const fieldTypes = [
  { value: 'number', label: 'Nombre' },
  { value: 'text', label: 'Texte' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Oui/Non' },
  { value: 'file', label: 'Fichier' },
  { value: 'image', label: 'Image' },
]

export function ChallengeFieldsBuilder({ initialFields = [], onChange }: ChallengeFieldsBuilderProps) {
  const [fields, setFields] = useState<Field[]>(
    initialFields.length > 0 ? initialFields : [{ name: '', label: '', type: 'number', required: true, order: 0, config: null }]
  )

  const update = (newFields: Field[]) => {
    setFields(newFields)
    onChange(newFields)
  }

  const addField = () => {
    update([...fields, { name: '', label: '', type: 'number', required: true, order: fields.length, config: null }])
  }

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }))
    update(newFields)
  }

  const updateField = (index: number, key: keyof Field, value: unknown) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [key]: value }
    // Auto-generate name from label
    if (key === 'label') {
      newFields[index].name = String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
    }
    update(newFields)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-text-secondary">Champs du defi</label>
      {fields.map((field, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-bg-tertiary rounded-[10px] border border-border">
          <GripVertical size={16} className="text-text-muted mt-2.5 cursor-grab" />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input
              placeholder="Label (ex: Pompes)"
              value={field.label}
              onChange={e => updateField(i, 'label', e.target.value)}
            />
            <select
              value={field.type}
              onChange={e => updateField(i, 'type', e.target.value)}
              className="rounded-[10px] border border-border bg-bg-secondary px-3 py-2.5 text-white text-sm focus:border-accent-green focus:outline-none"
            >
              {fieldTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
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
          <button onClick={() => removeField(i)} className="text-text-muted hover:text-error mt-2.5">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addField}>
        <Plus size={14} className="mr-1" /> Ajouter un champ
      </Button>
    </div>
  )
}
