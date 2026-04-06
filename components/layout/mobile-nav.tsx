'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, User, Award } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/challenges', label: 'Defis', icon: Trophy },
  { href: '/profile/badges', label: 'Badges', icon: Award },
  { href: '/profile', label: 'Profil', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border flex justify-around py-2 z-20">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 text-xs font-semibold transition-all duration-200
              ${isActive ? 'text-accent-green' : 'text-text-muted'}`}
          >
            <item.icon size={20} />
            {item.label}
            {isActive ? (
              <span className="w-1 h-1 rounded-full bg-accent-green" />
            ) : (
              <span className="w-1 h-1 rounded-full bg-transparent" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
