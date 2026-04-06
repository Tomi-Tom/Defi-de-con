import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export default async function EditChallengePage(props: PageProps<'/admin/challenges/[id]/edit'>) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*, challenge_fields(*)')
    .eq('id', id)
    .single()

  if (!challenge) notFound()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Modifier: {challenge.title}</h2>
      <Card>
        <CardContent className="p-4">
          <p className="text-text-muted text-sm">
            Edition du defi en cours de developpement. Utilisez la page de creation pour l&apos;instant.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
