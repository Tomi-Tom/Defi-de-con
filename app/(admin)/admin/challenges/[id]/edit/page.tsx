import { requireAdmin } from '@/lib/supabase/require-auth'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { GoalsExcelManager } from '@/components/challenges/goals-excel-manager'
import { getGoalsForChallenge } from '@/lib/actions/goals'
import { createAdjustment, deleteAdjustment } from '@/lib/actions/adjustments'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Settings, Target, Clock, Activity, Scale, Plus, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'

export default async function EditChallengePage(props: PageProps<'/admin/challenges/[id]/edit'>) {
  const { id } = await props.params
  const { supabase } = await requireAdmin()

  type ChallengeWithFields = {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    duration_days: number
    status: string
    challenge_fields: Array<{ id: string; name: string; label: string; type: string; required: boolean; order: number }>
  }

  const { data: challengeRaw } = await supabase
    .from('challenges')
    .select('*, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challengeRaw) notFound()
  const challenge = challengeRaw as unknown as ChallengeWithFields

  const goals = await getGoalsForChallenge(id)

  // Fetch participants and adjustments
  type Participant = { user_id: string; profiles: { username: string } | null }
  type Adjustment = { id: string; user_id: string; field_id: string; adjustment: number; reason: string; created_at: string; profiles: { username: string } | null }

  const [participantsRes, adjustmentsRes] = await Promise.all([
    supabase.from('challenge_participants').select('user_id, profiles(username)').eq('challenge_id', id),
    supabase.from('participant_adjustments').select('id, user_id, field_id, adjustment, reason, created_at, profiles(username)').eq('challenge_id', id).order('created_at', { ascending: false }),
  ])

  const participants = (participantsRes.data ?? []) as unknown as Participant[]
  const adjustments = (adjustmentsRes.data ?? []) as unknown as Adjustment[]

  const { data: recentEntriesRaw } = await supabase
    .from('daily_entries')
    .select('entry_date, submitted_at, profiles(username, avatar_url)')
    .eq('challenge_id', id)
    .order('submitted_at', { ascending: false })
    .limit(10)

  const { count: totalEntryCount } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', id)

  type RecentEntry = { entry_date: string; submitted_at: string; profiles: { username: string; avatar_url: string | null } | null }
  const recentEntries = (recentEntriesRaw ?? []) as unknown as RecentEntry[]

  // Group goals by field
  const numericFields = challenge.challenge_fields.filter(f => f.type === 'number')
  const goalsByField = new Map<string, Map<string, number>>()
  for (const g of goals) {
    if (!goalsByField.has(g.field_id)) goalsByField.set(g.field_id, new Map())
    goalsByField.get(g.field_id)!.set(g.goal_date, g.target_value)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black flex items-center gap-2">
        <Settings size={24} className="text-accent-orange" />
        {challenge.title}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border">
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Statut</div>
          <div className="font-bold text-white mt-1">{challenge.status}</div>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border">
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Duree</div>
          <div className="font-bold text-white mt-1">{challenge.duration_days} jours</div>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border">
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Debut</div>
          <div className="font-bold text-white mt-1">{format(parseISO(challenge.start_date), 'd MMM yyyy', { locale: fr })}</div>
        </div>
        <div className="bg-bg-tertiary rounded-xl p-3 border border-border">
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Champs</div>
          <div className="font-bold text-white mt-1">{challenge.challenge_fields.length}</div>
        </div>
      </div>

      {/* Goals Excel Manager */}
      <GoalsExcelManager
        challengeId={id}
        challengeTitle={challenge.title}
        startDate={challenge.start_date}
        durationDays={challenge.duration_days}
        fields={challenge.challenge_fields.map(f => ({
          id: f.id,
          name: f.name,
          label: f.label,
          type: f.type,
        }))}
      />

      {/* Adjustments — bonus/malus */}
      {numericFields.length > 0 && participants.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Scale size={14} />
              Bonus / Handicap sur les objectifs
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-muted mb-4">
              Positif = avance (reduit les objectifs du participant). Negatif = handicap (augmente les objectifs).
            </p>
            <form action={async (fd: FormData) => {
              'use server'
              fd.append('challenge_id', id)
              await createAdjustment(fd)
            }} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
              <Select name="user_id" required>
                <option value="">Participant</option>
                {participants.map(p => (
                  <option key={p.user_id} value={p.user_id}>{p.profiles?.username ?? 'Inconnu'}</option>
                ))}
              </Select>
              <Select name="field_id" required>
                <option value="">Champ</option>
                {numericFields.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </Select>
              <Input name="adjustment" type="number" placeholder="Ex: 20 ou -10" required />
              <Input name="reason" placeholder="Raison (optionnel)" />
              <Button type="submit" size="sm" className="h-full">
                <Plus size={14} className="mr-1" /> Appliquer
              </Button>
            </form>

            {adjustments.length > 0 && (
              <div className="space-y-2">
                {adjustments.map(a => {
                  const fieldLabel = challenge.challenge_fields.find(f => f.id === a.field_id)?.label ?? '?'
                  const isBonus = a.adjustment > 0
                  return (
                    <div key={a.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${isBonus ? 'bg-accent-green/5 border-accent-green/20' : 'bg-accent-orange/5 border-accent-orange/20'}`}>
                      <div className={`text-sm font-black ${isBonus ? 'text-accent-green' : 'text-accent-orange'}`}>
                        {isBonus ? '+' : ''}{a.adjustment}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-white">{a.profiles?.username ?? 'Inconnu'}</span>
                        <span className="text-text-muted text-sm"> — {fieldLabel}</span>
                        {a.reason && <span className="text-text-muted text-xs ml-2">({a.reason})</span>}
                      </div>
                      <span className="text-[10px] text-text-muted">{format(parseISO(a.created_at), 'd MMM', { locale: fr })}</span>
                      <form action={async () => {
                        'use server'
                        await deleteAdjustment(a.id)
                      }}>
                        <button type="submit" className="text-text-muted hover:text-error transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            )}
            {adjustments.length === 0 && (
              <p className="text-xs text-text-muted text-center py-2">Aucun ajustement pour le moment.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Participant activity feed */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
            <Clock size={14} />
            Activite recente
            {totalEntryCount != null && (
              <span className="text-xs text-text-muted ml-auto font-normal normal-case tracking-normal">
                <Activity size={10} className="inline mr-1" />
                {totalEntryCount} saisies au total
              </span>
            )}
          </h3>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <p className="text-sm text-text-muted">Aucune activite</p>
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry, i) => {
                const username = entry.profiles?.username ?? 'Inconnu'
                const relativeTime = formatDistanceToNow(new Date(entry.submitted_at), { addSuffix: true, locale: fr })
                return (
                  <div key={i} className="flex items-center gap-3">
                    <UserAvatar username={username} avatarUrl={entry.profiles?.avatar_url ?? null} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        <span className="font-bold">{username}</span>
                        {' '}a saisi le{' '}
                        <span className="text-text-secondary">{format(parseISO(entry.entry_date), 'd MMM', { locale: fr })}</span>
                      </p>
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">{relativeTime}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current goals preview */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Target size={14} />
              Objectifs importes ({goals.length} valeurs)
            </h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-text-muted font-bold text-xs uppercase">Date</th>
                    {numericFields.map(f => (
                      <th key={f.id} className="text-right py-2 px-2 text-text-muted font-bold text-xs uppercase">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Show first 10 days with goals */}
                  {Array.from(new Set(goals.map(g => g.goal_date))).slice(0, 10).map(date => (
                    <tr key={date} className="border-b border-border/50 hover:bg-bg-tertiary">
                      <td className="py-1.5 px-2 text-text-secondary">{format(parseISO(date), 'd MMM', { locale: fr })}</td>
                      {numericFields.map(f => {
                        const val = goalsByField.get(f.id)?.get(date)
                        return (
                          <td key={f.id} className="py-1.5 px-2 text-right font-bold text-white">
                            {val !== undefined ? val : <span className="text-text-muted">—</span>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {goals.length > 10 * numericFields.length && (
                <p className="text-xs text-text-muted mt-2 text-center">... et plus</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
