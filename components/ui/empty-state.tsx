import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center text-text-muted/50 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-black text-white mb-1">{title}</h3>
      <p className="text-text-muted text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}
