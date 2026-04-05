import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'

interface ActiveChallenge {
  id: string
  title: string
  progress: number // 0-100
  hasEntryToday: boolean
}

export function ActiveChallengesWidget({ challenges }: { challenges: ActiveChallenge[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Defis en cours</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {challenges.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={c.progress} label={c.title} />
            </div>
            {!c.hasEntryToday && (
              <Link href={`/challenges/${c.id}/entry`}>
                <Button size="sm">Saisir</Button>
              </Link>
            )}
          </div>
        ))}
        {challenges.length === 0 && (
          <p className="text-text-muted text-sm">Aucun defi en cours</p>
        )}
      </CardContent>
    </Card>
  )
}
