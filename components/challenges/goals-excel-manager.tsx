'use client'

import { useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { importGoals, type GoalRow } from '@/lib/actions/goals'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { addDays, format } from 'date-fns'

interface Field {
  id: string
  name: string
  label: string
  type: string
}

interface GoalsExcelManagerProps {
  challengeId: string
  challengeTitle: string
  startDate: string
  durationDays: number
  fields: Field[]
}

export function GoalsExcelManager({ challengeId, challengeTitle, startDate, durationDays, fields }: GoalsExcelManagerProps) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Only numeric fields have goals
  const numericFields = fields.filter(f => f.type === 'number')

  const handleExport = () => {
    // Generate dates array
    const dates: string[] = []
    const start = new Date(startDate)
    for (let i = 0; i < durationDays; i++) {
      dates.push(format(addDays(start, i), 'yyyy-MM-dd'))
    }

    // Build worksheet data
    const header = ['Date', ...numericFields.map(f => f.label)]
    const rows = dates.map(date => {
      const row: (string | number | null)[] = [date]
      numericFields.forEach(() => row.push(null)) // empty cells for admin to fill
      return row
    })

    const wsData = [header, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Column widths
    ws['!cols'] = [
      { wch: 12 }, // Date column
      ...numericFields.map(() => ({ wch: 15 })),
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Objectifs')

    // Download
    const filename = `objectifs-${challengeTitle.toLowerCase().replace(/\s+/g, '-')}.xlsx`
    XLSX.writeFile(wb, filename)

    toast.success('Excel exporte !', {
      description: `${durationDays} jours x ${numericFields.length} champs`,
      style: { background: '#0a1a0a', border: '1px solid #00ff87' },
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      if (!data) return

      const wb = XLSX.read(data, { type: 'binary' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })

      if (rows.length < 2) {
        toast.error('Fichier vide ou invalide')
        return
      }

      // Parse header to match field names
      const headerRow = rows[0]
      const fieldMap: Map<number, string> = new Map()

      for (let col = 1; col < headerRow.length; col++) {
        const headerLabel = String(headerRow[col] ?? '').trim()
        const matchedField = numericFields.find(f =>
          f.label.toLowerCase() === headerLabel.toLowerCase() ||
          f.name.toLowerCase() === headerLabel.toLowerCase()
        )
        if (matchedField) {
          fieldMap.set(col, matchedField.id)
        }
      }

      if (fieldMap.size === 0) {
        toast.error('Aucun champ numerique reconnu dans les colonnes')
        return
      }

      // Parse data rows
      const goals: GoalRow[] = []
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        const dateCell = row[0]
        if (!dateCell) continue

        // Parse date
        let dateStr: string
        if (typeof dateCell === 'number') {
          // Excel serial date
          const d = XLSX.SSF.parse_date_code(dateCell)
          dateStr = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
        } else {
          dateStr = String(dateCell).trim()
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue

        for (const [col, fieldId] of fieldMap) {
          const value = row[col]
          if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
            goals.push({
              field_id: fieldId,
              goal_date: dateStr,
              target_value: Number(value),
            })
          }
        }
      }

      if (goals.length === 0) {
        toast.error('Aucun objectif trouve dans le fichier', {
          description: 'Remplis des nombres dans les colonnes des champs',
        })
        return
      }

      // Import
      startTransition(async () => {
        const result = await importGoals(challengeId, goals)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(`${result.count} objectifs importes !`, {
            description: 'Les objectifs sont maintenant actifs',
            style: { background: '#0a1a0a', border: '1px solid #00ff87' },
          })
        }
      })
    }

    reader.readAsBinaryString(file)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (numericFields.length === 0) {
    return (
      <div className="text-sm text-text-muted p-4 bg-bg-tertiary rounded-xl border border-border">
        <FileSpreadsheet size={16} className="inline mr-2" />
        Aucun champ numerique — les objectifs Excel ne sont disponibles que pour les champs de type nombre.
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary rounded-2xl border border-border p-5">
      <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-4">
        <FileSpreadsheet size={14} />
        Objectifs Excel
      </h3>

      <p className="text-sm text-text-secondary mb-4">
        Exporte un template Excel, remplis les objectifs par jour pour chaque champ numerique, puis reimporte-le.
        Les cellules vides = pas d'objectif (libre). Les cellules avec un nombre = objectif a atteindre.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} className="mr-2" />
          Exporter le template
        </Button>

        <label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Upload size={16} className="mr-2" />
            {isPending ? 'Import en cours...' : 'Importer les objectifs'}
          </Button>
        </label>
      </div>

      <div className="mt-3 text-xs text-text-muted">
        Champs reconnus : {numericFields.map(f => f.label).join(', ')}
      </div>
    </div>
  )
}
