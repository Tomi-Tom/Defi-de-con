import { requireAdmin } from '@/lib/supabase/require-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { publishChallenge, deleteChallenge } from '@/lib/actions/challenges'
import Link from 'next/link'
import { Plus, Users, Award, MessageSquareQuote, Trophy, Flame, Calendar, TrendingUp, Eye, Settings } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function AdminPage() {
  const { supabase } = await requireAdmin()

  const [challengesRes, usersCount, badgesCount, quotesCount, entriesCount] = await Promise.all([
    supabase
      .from('challenges')
      .select('id, title, status, start_date, end_date, duration_days, challenge_participants(count)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('badges').select('*', { count: 'exact', head: true }),
    supabase.from('motivational_quotes').select('*', { count: 'exact', head: true }),
    supabase.from('daily_entries').select('*', { count: 'exact', head: true }),
  ])

  const challenges = challengesRes.data ?? []
  const activeChallenges = challenges.filter(c => c.status === 'active')
  const draftChallenges = challenges.filter(c => c.status === 'draft')
  const completedChallenges = challenges.filter(c => c.status === 'completed')

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black">Panel Admin</h2>
          <p className="text-text-muted text-sm mt-1">Gere les defis, utilisateurs, badges et citations.</p>
        </div>
        <Link href="/admin/challenges/new">
          <Button size="lg" className="shadow-[0_0_20px_rgba(0,255,135,0.2)]">
            <Plus size={18} className="mr-2" /> Nouveau defi
          </Button>
        </Link>
      </div>

      {/* Overview stats */}
      <div className="animate-slide-up stagger-1 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Utilisateurs', value: usersCount.count ?? 0, icon: Users, color: 'text-accent-green', bg: 'bg-accent-green/10', href: '/admin/users' },
          { label: 'Badges', value: badgesCount.count ?? 0, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-400/10', href: '/admin/badges' },
          { label: 'Citations', value: quotesCount.count ?? 0, icon: MessageSquareQuote, color: 'text-purple-400', bg: 'bg-purple-400/10', href: '/admin/quotes' },
          { label: 'Saisies totales', value: entriesCount.count ?? 0, icon: Calendar, color: 'text-accent-orange', bg: 'bg-accent-orange/10', href: '#' },
        ].map(s => (
          <Link key={s.label} href={s.href}>
            <div className="bg-bg-secondary rounded-xl border border-border p-4 hover:border-accent-green/20 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{s.label}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Active challenges */}
      {activeChallenges.length > 0 && (
        <div className="animate-slide-up stagger-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-accent-green flex items-center gap-2 mb-3">
            <Flame size={14} />
            Defis en cours ({activeChallenges.length})
          </h3>
          <div className="space-y-2">
            {activeChallenges.map(c => (
              <ChallengeRow key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      )}

      {/* Draft challenges */}
      {draftChallenges.length > 0 && (
        <div className="animate-slide-up stagger-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-3">
            <Settings size={14} />
            Brouillons ({draftChallenges.length})
          </h3>
          <div className="space-y-2">
            {draftChallenges.map(c => (
              <DraftRow key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      )}

      {/* Completed challenges */}
      {completedChallenges.length > 0 && (
        <div className="animate-slide-up stagger-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-accent-orange flex items-center gap-2 mb-3">
            <Trophy size={14} />
            Termines ({completedChallenges.length})
          </h3>
          <div className="space-y-2">
            {completedChallenges.map(c => (
              <ChallengeRow key={c.id} challenge={c} />
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <div className="text-center py-16">
          <Trophy size={48} className="text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Aucun defi</h3>
          <p className="text-text-muted text-sm mb-4">Cree ton premier defi pour commencer.</p>
          <Link href="/admin/challenges/new">
            <Button>Creer un defi</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function ChallengeRow({ challenge: c }: { challenge: any }) {
  const participantCount = (c.challenge_participants as unknown as { count: number }[])?.[0]?.count ?? 0
  const isActive = c.status === 'active'

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border hover:border-accent-green/20 transition-all">
      <div className={`w-2 h-10 rounded-full flex-shrink-0 ${isActive ? 'bg-accent-green' : 'bg-accent-orange'}`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white truncate">{c.title}</h4>
        <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
          <span>{format(parseISO(c.start_date), 'd MMM', { locale: fr })} — {format(parseISO(c.end_date), 'd MMM yyyy', { locale: fr })}</span>
          <span className="flex items-center gap-1"><Users size={10} /> {participantCount}</span>
          <span>{c.duration_days}j</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/challenges/${c.id}`}>
          <Button variant="ghost" size="sm"><Eye size={14} /></Button>
        </Link>
        <Link href={`/admin/challenges/${c.id}/edit`}>
          <Button variant="secondary" size="sm">Gerer</Button>
        </Link>
      </div>
    </div>
  )
}

function DraftRow({ challenge: c }: { challenge: any }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border border-dashed hover:border-accent-green/20 transition-all">
      <div className="w-2 h-10 rounded-full flex-shrink-0 bg-text-muted" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-text-secondary truncate">{c.title}</h4>
        <div className="text-xs text-text-muted mt-0.5">
          {c.duration_days} jours — Debut prevu: {format(parseISO(c.start_date), 'd MMM yyyy', { locale: fr })}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/admin/challenges/${c.id}/edit`}>
          <Button variant="secondary" size="sm">Modifier</Button>
        </Link>
        <form action={async () => {
          'use server'
          await publishChallenge(c.id)
        }}>
          <Button size="sm" type="submit">Publier</Button>
        </form>
        <form action={async () => {
          'use server'
          await deleteChallenge(c.id)
        }}>
          <Button variant="danger" size="sm" type="submit">Suppr.</Button>
        </form>
      </div>
    </div>
  )
}
