'use client'

import { useActionState, useRef } from 'react'
import { signup, type AuthState } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signup, {})
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4 w-full max-w-sm" key={JSON.stringify(state.values)}>
      <h1 className="text-3xl font-black tracking-tight">
        <span className="text-accent-green">DEFI</span>DECON
      </h1>
      <p className="text-text-muted text-sm mb-4">Cree ton compte et rejoins le defi</p>

      {state.error && (
        <div className="bg-error/10 border border-error/20 rounded-[10px] px-4 py-2 text-sm text-error">
          {state.error}
        </div>
      )}

      <Input
        name="username"
        label="Nom d'utilisateur"
        placeholder="john_doe"
        required
        defaultValue={state.values?.username ?? ''}
        error={state.fieldErrors?.username}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="ton@email.com"
        required
        defaultValue={state.values?.email ?? ''}
        error={state.fieldErrors?.email}
      />
      <Input
        name="password"
        type="password"
        label="Mot de passe"
        placeholder="Min. 6 caracteres"
        required
        defaultValue={state.values?.password ?? ''}
        error={state.fieldErrors?.password}
      />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? 'Creation...' : 'Creer mon compte'}
      </Button>

      <p className="text-text-muted text-sm text-center">
        Deja un compte ?{' '}
        <Link href="/login" className="text-accent-green font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
