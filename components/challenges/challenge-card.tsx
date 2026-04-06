import Link from 'next/link'
import { Calendar, Users, Flame, Trophy, Clock } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
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
  durationDays?: number
}

export function ChallengeCard({ id, title, description, startDate, endDate, status, participantCount, progress, durationDays }: ChallengeCardProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(endDate), new Date()))
  const isActive = status === 'active'
  const isCompleted = status === 'completed'

  return (
    <Link href={`/challenges/${id}`}>
      <div className="group relative rounded-2xl overflow-hidden border border-border bg-bg-secondary transition-all duration-300 hover:border-accent-green/50 hover:shadow-[0_0_30px_rgba(0,255,135,0.1)] hover:-translate-y-1">
        {/* Top gradient banner */}
        <div className={`h-2 w-full ${isActive ? 'bg-gradient-to-r from-accent-green to-accent-green-dark' : isCompleted ? 'bg-gradient-to-r from-accent-orange to-yellow-500' : 'bg-bg-tertiary'}`} />

        <div className="p-5">
          {/* Status + Icon row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isActive && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 animate-pulse-glow">
                  <Flame size={14} className="text-accent-green" />
                  <span className="text-xs font-black uppercase tracking-wider text-accent-green">En cours</span>
                </div>
              )}
              {isCompleted && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-orange/10">
                  <Trophy size={14} className="text-accent-orange" />
                  <span className="text-xs font-black uppercase tracking-wider text-accent-orange">Termine</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-text-muted">
              <Users size={14} />
              <span className="text-sm font-bold">{participantCount}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-white mb-1 group-hover:text-accent-green transition-colors">{title}</h3>
          <p className="text-sm text-text-muted mb-4 line-clamp-2">{description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-text-secondary mb-4">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(parseISO(startDate), 'd MMM', { locale: fr })} — {format(parseISO(endDate), 'd MMM', { locale: fr })}
            </span>
            {isActive && (
              <span className="flex items-center gap-1 text-accent-green font-bold">
                <Clock size={12} />
                {daysLeft}j restants
              </span>
            )}
            {durationDays && (
              <span className="text-text-muted">{durationDays} jours</span>
            )}
          </div>

          {/* Progress */}
          {progress !== undefined && isActive && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Progression</span>
                <span className="text-sm font-black text-accent-green">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-green via-accent-green to-accent-green-dark transition-all duration-700 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
