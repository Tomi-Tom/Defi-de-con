import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { Target, Check, BookOpen } from 'lucide-react'

interface ActiveChallenge {
  id: string
  title: string
  progress: number
  hasEntryToday: boolean
}

export function ActiveChallengesWidget({ challenges }: { challenges: ActiveChallenge[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
          <Target size={14} />
          Defis en cours
        </h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {challenges.map((c) => (
          <div key={c.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary transition-colors border-l-2 ${c.hasEntryToday ? 'border-accent-green' : 'border-accent-orange'}`}>
            <div className="flex-1">
              <ProgressBar value={c.progress} label={c.title} />
            </div>
            <div className="flex items-center gap-1.5">
              {c.hasEntryToday ? (
                <div className="flex items-center gap-1 text-accent-green text-xs font-semibold">
                  <Check size={14} />
                  <span className="hidden sm:inline">Fait</span>
                </div>
              ) : (
                <Link href={`/challenges/${c.id}/entry`}>
                  <Button size="sm">Saisir</Button>
                </Link>
              )}
              <Link href={`/challenges/${c.id}/history`} title="Journal">
                <Button variant="ghost" size="sm">
                  <BookOpen size={14} />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="text-center py-6">
            <Target size={32} className="text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">Aucun defi en cours</p>
            <Link href="/challenges" className="text-accent-green text-sm font-semibold hover:underline mt-1 inline-block">
              Decouvrir les defis
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
