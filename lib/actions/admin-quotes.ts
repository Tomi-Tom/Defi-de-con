'use server'

import { requireAdminAction } from '@/lib/supabase/require-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { refresh } from 'next/cache'

export async function createQuote(formData: FormData) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const text = formData.get('text') as string
  const author = (formData.get('author') as string) || null
  const context = formData.get('context') as string

  if (!text || !context) return { error: 'Texte et contexte requis' }

  const admin = createAdminClient()
  const { error } = await admin.from('motivational_quotes').insert({ text, author, context } as any)
  if (error) return { error: error.message }

  refresh()
  return { success: true }
}

export async function deleteQuote(quoteId: string) {
  const { error: authError } = await requireAdminAction()
  if (authError) return { error: authError }

  const admin = createAdminClient()
  const { error } = await admin.from('motivational_quotes').delete().eq('id', quoteId)
  if (error) return { error: error.message }

  refresh()
  return { success: true }
}
