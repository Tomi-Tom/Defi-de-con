import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface FieldValue {
  label: string
  type: string
  value: string | number | null
}

interface LastEntryProps {
  challengeId: string
  challengeTitle: string
  entryDate: string
  fields: FieldValue[]
}

export function LastEntryWidget({ challengeId, challengeTitle, entryDate, fields }: LastEntryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Clock size={14} />
            Derniere activite
          </h3>
          <Link href={`/challenges/${challengeId}/history`}>
            <Button variant="ghost" size="sm">
              Voir le journal <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <Link href={`/challenges/${challengeId}`} className="text-white font-bold hover:text-accent-green transition-colors">
            {challengeTitle}
          </Link>
          <p className="text-xs text-text-muted mt-0.5">
            {format(parseISO(entryDate), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {fields.map((f, i) => (
            <div key={i} className="bg-bg-tertiary rounded-lg p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{f.label}</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {f.value !== null ? String(f.value) : '—'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
