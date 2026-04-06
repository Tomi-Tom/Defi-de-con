import { type ElementType } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: ElementType
  color: string
  bg: string
}

export function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-3 text-center">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
        <Icon size={16} className={color} />
      </div>
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</div>
    </div>
  )
}
