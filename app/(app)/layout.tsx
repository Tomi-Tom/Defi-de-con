import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/require-auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAuth()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('username, avatar_url, is_admin, points_total')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as unknown as { username: string; avatar_url: string | null; is_admin: boolean; points_total: number } | null

  if (!profile) redirect('/login')

  // Get current streak from active challenge participation
  const { data: participationRaw } = await supabase
    .from('challenge_participants')
    .select('current_streak')
    .eq('user_id', user.id)
    .order('current_streak', { ascending: false })
    .limit(1)
    .single()

  const participation = participationRaw as unknown as { current_streak: number } | null

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar isAdmin={profile.is_admin} />
      <div className="flex-1 flex flex-col">
        <Topbar
          username={profile.username}
          avatarUrl={profile.avatar_url}
          points={profile.points_total}
          streak={participation?.current_streak ?? 0}
        />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
