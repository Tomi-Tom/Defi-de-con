'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { fireConfetti } from '@/components/ui/confetti'
import { Star, Flame, Trophy, Target, AlertTriangle, Award, X, Sparkles, TrendingUp } from 'lucide-react'

export function EntryRecapPopup() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [animateTotal, setAnimateTotal] = useState(false)

  const isEntry = searchParams.get('entry') === 'success'
  const points = Number(searchParams.get('points') ?? 0)
  const base = Number(searchParams.get('base') ?? 0)
  const streak = Number(searchParams.get('streak') ?? 0)
  const isMilestone = searchParams.get('milestone') === '1'
  const streakBonus = Number(searchParams.get('streakbonus') ?? 0)
  const penalty = Number(searchParams.get('penalty') ?? 0)
  const catchup = Number(searchParams.get('catchup') ?? 0)
  const perfect = Number(searchParams.get('perfect') ?? 0)
  const isUpdated = searchParams.get('updated') === '1'
  const badges = searchParams.get('badges')?.split(',').filter(Boolean) ?? []
  const quote = searchParams.get('quote')

  const hasBonusOrPenalty = streakBonus > 0 || perfect > 0 || catchup > 0 || penalty < 0

  useEffect(() => {
    if (isEntry) {
      setVisible(true)
      setAnimateTotal(false)
      fireConfetti(isMilestone ? 'milestone' : 'success')
      // Delay total animation for dramatic effect
      const timer = setTimeout(() => setAnimateTotal(true), 400)
      return () => clearTimeout(timer)
    }
  }, [isEntry, isMilestone])

  const close = () => {
    setVisible(false)
    router.replace(window.location.pathname, { scroll: false })
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={close}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Popup */}
      <div
        className="relative animate-scale-in bg-bg-secondary border border-border rounded-3xl p-8 max-w-md w-full text-center overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={close} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-green via-accent-green-dark to-accent-green" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-green/10 rounded-full blur-3xl" />

        {/* Icon */}
        <div className="relative mb-4">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${isMilestone ? 'bg-yellow-400/20' : 'bg-accent-green/20'}`}>
            {isMilestone ? (
              <Trophy size={32} className="text-yellow-400" />
            ) : (
              <Sparkles size={32} className="text-accent-green" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white mb-1">
          {isUpdated ? 'Saisie modifiee !' : isMilestone ? 'Milestone !' : 'Bien joue !'}
        </h2>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-accent-orange mb-4">
            <Flame size={16} />
            <span className="text-sm font-black">{streak} jour{streak > 1 ? 's' : ''} de suite</span>
          </div>
        )}

        {/* Points breakdown */}
        <div className="bg-bg-tertiary/50 rounded-2xl p-4 mb-4">
          <div className="space-y-1.5">
            {/* Base points */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted flex items-center gap-1.5">
                <Star size={14} className="text-accent-green" /> Validation du jour
              </span>
              <span className="text-sm font-bold text-text-secondary">+{base}</span>
            </div>

            {/* Streak daily bonus */}
            {streakBonus > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted flex items-center gap-1.5">
                  <Flame size={14} className="text-accent-orange" /> Bonus streak
                </span>
                <span className="text-sm font-bold text-text-secondary">+{streakBonus}</span>
              </div>
            )}

            {/* Perfect day bonus */}
            {perfect > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" /> Journee parfaite
                </span>
                <span className="text-sm font-bold text-text-secondary">+{perfect}</span>
              </div>
            )}

            {/* Catchup bonus */}
            {catchup > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted flex items-center gap-1.5">
                  <Target size={14} className="text-accent-green" /> Rattrapage
                </span>
                <span className="text-sm font-bold text-text-secondary">+{catchup}</span>
              </div>
            )}

            {/* Penalty */}
            {penalty < 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-red-400" /> Objectif manque
                </span>
                <span className="text-sm font-bold text-red-400">{penalty}</span>
              </div>
            )}
          </div>

          {/* Separator + Total */}
          {hasBonusOrPenalty && (
            <>
              <div className="my-3 border-t border-border/50" />
              <div className={`flex items-center justify-between transition-all duration-500 ${animateTotal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <span className="text-base font-black text-white flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-accent-green" /> Total
                </span>
                <span className={`text-2xl font-black ${points >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
                  {points >= 0 ? '+' : ''}{points}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-2 flex items-center justify-center gap-1">
              <Award size={12} /> Badge{badges.length > 1 ? 's' : ''} debloque{badges.length > 1 ? 's' : ''} !
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {badges.map(b => (
                <span key={b} className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        {quote && (
          <p className="text-sm italic text-text-secondary leading-relaxed mb-4 px-4">
            &laquo; {quote} &raquo;
          </p>
        )}

        {/* CTA */}
        <Button onClick={close} size="lg" className="w-full">
          Continuer
        </Button>
      </div>
    </div>
  )
}
