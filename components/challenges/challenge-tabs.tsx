'use client'

import { useState } from 'react'
import { LayoutDashboard, BookOpen, Users, Target } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  content: React.ReactNode
}

export function ChallengeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-bg-secondary rounded-xl border border-border p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex-1 justify-center
              ${active === tab.id
                ? 'bg-accent-green/10 text-accent-green shadow-sm'
                : 'text-text-muted hover:text-white hover:bg-bg-tertiary'
              }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
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
