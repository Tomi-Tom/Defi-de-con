'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTodayEntry } from '@/lib/actions/entries'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteEntryButton({ challengeId }: { challengeId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('Supprimer la saisie du jour ? Les points seront annules.')) return

    startTransition(async () => {
      try {
        const result = await deleteTodayEntry(challengeId)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success('Saisie supprimee', {
            description: result.revertedPoints ? `${result.revertedPoints} points annules` : undefined,
            style: { background: '#1a0a0a', border: '1px solid #ef4444' },
          })
          router.refresh()
        }
      } catch {
        toast.error('Erreur lors de la suppression')
      }
    })
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="gap-1.5"
    >
      <Trash2 size={14} />
      {isPending ? 'Suppression...' : 'Supprimer la saisie'}
    </Button>
  )
}
