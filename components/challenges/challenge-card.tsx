import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Calendar, Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: string
  participantCount: number
  progress?: number
}

export function ChallengeCard({ id, title, description, startDate, endDate, status, participantCount, progress }: ChallengeCardProps) {
  const statusColors = {
    active: 'text-accent-green bg-accent-green/10',
    draft: 'text-text-muted bg-bg-tertiary',
    completed: 'text-accent-orange bg-accent-orange/10',
  }

  return (
    <Link href={`/challenges/${id}`}>
      <Card className="hover:border-accent-green/30 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white">{title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[status as keyof typeof statusColors] ?? statusColors.draft}`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-text-muted mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(parseISO(startDate), 'd MMM', { locale: fr })} - {format(parseISO(endDate), 'd MMM yyyy', { locale: fr })}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {participantCount}
            </span>
          </div>
          {progress !== undefined && <ProgressBar value={progress} />}
        </CardContent>
      </Card>
    </Link>
  )
}
