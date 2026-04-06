'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Trophy, Award, Shield, User } from 'lucide-react'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/challenges', label: 'Defis', icon: Trophy },
  { href: '/profile/badges', label: 'Badges', icon: Award },
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

      <nav className="flex-1 px-3 flex flex-col">
        {/* Main navigation */}
        <div className="flex-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 py-2.5 rounded-[10px] mb-1 text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-accent-green/10 text-accent-green border-l-2 border-accent-green pl-4 pr-3'
                    : 'text-text-muted hover:text-white hover:bg-bg-tertiary px-3 border-l-2 border-transparent'
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            )
          })}

          {/* Admin separator + link */}
          {isAdmin && (
            <>
              <div className="my-3 mx-2 border-t border-border" />
              <Link
                href="/admin"
                className={`flex items-center gap-3 py-2.5 rounded-[10px] mb-1 text-sm font-semibold transition-all duration-200
                  ${pathname.startsWith('/admin')
                    ? 'bg-accent-orange/10 text-accent-orange border-l-2 border-accent-orange pl-4 pr-3'
                    : 'text-text-muted hover:text-white hover:bg-bg-tertiary px-3 border-l-2 border-transparent'
                  }`}
              >
                <Shield size={20} />
                Admin
              </Link>
            </>
          )}
        </div>

        {/* Profile at bottom with separator */}
        <div className="border-t border-border my-3 mx-2" />
        <Link
          href="/profile"
          className={`flex items-center gap-3 py-2.5 rounded-[10px] mb-3 text-sm font-semibold transition-all duration-200
            ${pathname === '/profile'
              ? 'bg-accent-green/10 text-accent-green border-l-2 border-accent-green pl-4 pr-3'
              : 'text-text-muted hover:text-white hover:bg-bg-tertiary px-3 border-l-2 border-transparent'
            }`}
        >
          <User size={20} />
          Mon profil
        </Link>
      </nav>
    </aside>
  )
}
