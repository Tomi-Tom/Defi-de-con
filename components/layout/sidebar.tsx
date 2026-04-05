'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, User, Shield } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/challenges', label: 'Defis', icon: Trophy },
  { href: '/profile', label: 'Profil', icon: User },
]

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-black tracking-tight">
          <span className="text-accent-green">DEFI</span>DECON
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-sm font-semibold transition-colors
                ${isActive
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-muted hover:text-white hover:bg-bg-tertiary'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-1 text-sm font-semibold transition-colors
              ${pathname.startsWith('/admin')
                ? 'bg-accent-orange/10 text-accent-orange'
                : 'text-text-muted hover:text-white hover:bg-bg-tertiary'
              }`}
          >
            <Shield size={20} />
            Admin
          </Link>
        )}
      </nav>
    </aside>
  )
}
