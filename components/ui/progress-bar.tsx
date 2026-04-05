interface ProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({ value, label, showPercentage = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-sm font-bold text-white">{label}</span>}
          {showPercentage && <span className="text-sm font-bold text-accent-green">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green-dark transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
