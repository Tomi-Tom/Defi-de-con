'use client'

import { useState, useEffect } from 'react'

interface DurationInputProps {
  label?: string
  error?: string
  defaultValue?: number | null // seconds
  required?: boolean
  onChange?: (seconds: number) => void
  name?: string
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.round(s)).padStart(2, '0')}`
}

export function DurationInput({ label, error, defaultValue, required, onChange, name }: DurationInputProps) {
  const initial = defaultValue ?? 0
  const [hours, setHours] = useState(Math.floor(initial / 3600))
  const [minutes, setMinutes] = useState(Math.floor((initial % 3600) / 60))
  const [seconds, setSeconds] = useState(Math.round(initial % 60))

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  useEffect(() => {
    onChange?.(totalSeconds)
  }, [hours, minutes, seconds, totalSeconds, onChange])

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-text-secondary">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={99}
            value={hours}
            onChange={e => setHours(Math.max(0, Number(e.target.value) || 0))}
            className="w-16 rounded-xl border border-border bg-bg-secondary px-3 py-3 text-sm text-white text-center focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green transition-all duration-200"
            placeholder="00"
          />
          <span className="text-xs text-text-muted font-bold">h</span>
        </div>
        <span className="text-text-muted font-bold">:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={e => setMinutes(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
            className="w-16 rounded-xl border border-border bg-bg-secondary px-3 py-3 text-sm text-white text-center focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green transition-all duration-200"
            placeholder="00"
          />
          <span className="text-xs text-text-muted font-bold">m</span>
        </div>
        <span className="text-text-muted font-bold">:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={e => setSeconds(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
            className="w-16 rounded-xl border border-border bg-bg-secondary px-3 py-3 text-sm text-white text-center focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green transition-all duration-200"
            placeholder="00"
          />
          <span className="text-xs text-text-muted font-bold">s</span>
        </div>
      </div>
      {/* Hidden input to submit the value as seconds */}
      {name && <input type="hidden" name={name} value={totalSeconds} />}
      {totalSeconds > 0 && (
        <p className="text-xs text-text-muted">{formatDuration(totalSeconds)}</p>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
