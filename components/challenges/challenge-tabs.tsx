'use client'

import { useState } from 'react'
import { LayoutDashboard, BookOpen, Users } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  journal: BookOpen,
  participants: Users,
}

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

export function ChallengeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-bg-secondary/80 backdrop-blur-sm rounded-2xl border border-border p-1 mb-6">
        {tabs.map(tab => {
          const Icon = iconMap[tab.id] ?? LayoutDashboard
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all duration-200 flex-1 justify-center
                ${active === tab.id
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-muted hover:text-white hover:bg-bg-tertiary'
                }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={active === tab.id ? 'animate-fade-in' : 'hidden'}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
