'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, {})

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="text-accent-green">DEFI</span>DECON
      </h1>
      <p className="text-text-muted text-sm mb-4">Connecte-toi pour continuer</p>

      {state.error && (
        <div className="bg-error/10 border border-error/20 rounded-[10px] px-4 py-2 text-sm text-error">
          {state.error}
        </div>
      )}

      <Input name="email" type="email" label="Email" placeholder="ton@email.com" required />
      <Input name="password" type="password" label="Mot de passe" placeholder="••••••" required />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Connexion...' : 'Se connecter'}
      </Button>

      <p className="text-text-muted text-sm text-center">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-accent-green font-semibold hover:underline">
          Creer un compte
        </Link>
      </p>
    </form>
  )
}
