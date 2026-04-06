import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/require-auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

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
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-orange/10 text-accent-orange">ADMIN</span>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
