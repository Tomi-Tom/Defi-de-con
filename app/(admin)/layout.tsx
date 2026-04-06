import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/require-auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import Link from 'next/link'
import { Shield, Trophy, Users, Award, MessageSquareQuote, Settings } from 'lucide-react'

const adminNav = [
  { href: '/admin', label: 'Vue generale', icon: Shield },
  { href: '/admin/challenges/new', label: 'Nouveau defi', icon: Trophy },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/badges', label: 'Badges', icon: Award },
  { href: '/admin/quotes', label: 'Citations', icon: MessageSquareQuote },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url, is_admin, points_total')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar isAdmin={true} />
      <div className="flex-1 flex flex-col">
        <Topbar username={profile.username} avatarUrl={profile.avatar_url} points={profile.points_total} streak={0} />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <div className="max-w-5xl mx-auto">
            {/* Admin sub-nav */}
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-orange/10 border border-accent-orange/20 mr-2 flex-shrink-0">
                <Shield size={14} className="text-accent-orange" />
                <span className="text-xs font-black uppercase tracking-wider text-accent-orange">Admin</span>
              </div>
              {adminNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-white hover:bg-bg-tertiary transition-all flex-shrink-0"
                >
                  <item.icon size={14} />
                  {item.label}
                </Link>
              ))}
            </div>
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
