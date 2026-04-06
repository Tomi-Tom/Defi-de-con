import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Transition overdue active challenges to completed
  const { data: overdue } = await admin
    .from('challenges')
    .select('id')
    .eq('status', 'active')
    .lt('end_date', today)

  if (overdue && overdue.length > 0) {
    const overdueIds = overdue.map(c => c.id)

    await admin
      .from('challenges')
      .update({ status: 'completed' })
      .in('id', overdueIds)

    // Award Podium badges for completed challenges
    const { data: podiumBadge } = await admin
      .from('badges')
      .select('id')
      .eq('name', 'Podium')
      .single()

    if (podiumBadge) {
      for (const challengeId of overdueIds) {
        const { data: top3 } = await admin
          .from('challenge_participants')
          .select('user_id')
          .eq('challenge_id', challengeId)
          .order('points_earned', { ascending: false })
          .limit(3)

        if (top3) {
          for (const participant of top3) {
            // Check if badge already awarded (can't use upsert with functional unique constraint)
            const { data: existing } = await admin
              .from('user_badges')
              .select('id')
              .eq('user_id', participant.user_id)
              .eq('badge_id', podiumBadge.id)
              .eq('challenge_id', challengeId)
              .limit(1)

            if (!existing || existing.length === 0) {
              await admin.from('user_badges').insert({
                user_id: participant.user_id,
                badge_id: podiumBadge.id,
                challenge_id: challengeId,
              })
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ transitioned: overdue?.length ?? 0 })
}
