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
    <div className="bg-bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border p-3 text-center group hover:border-border/60 transition-all">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
        <Icon size={16} className={color} />
      </div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted mt-0.5">{label}</div>
    </div>
  )
}
