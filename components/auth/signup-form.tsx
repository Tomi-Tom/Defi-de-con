'use client'

import { useActionState, useState } from 'react'
import { signup, type AuthState } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong'

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 'none'
  if (password.length < 8) return 'weak'
  const hasNumber = /\d/.test(password)
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  if (hasSpecial && hasNumber && hasLetter) return 'strong'
  if (hasNumber && hasLetter) return 'medium'
  return 'weak'
}

const strengthConfig: Record<PasswordStrength, { bars: number; color: string; label: string }> = {
  none: { bars: 0, color: '', label: '' },
  weak: { bars: 1, color: 'bg-red-500', label: 'Faible' },
  medium: { bars: 2, color: 'bg-accent-orange', label: 'Moyen' },
  strong: { bars: 3, color: 'bg-accent-green', label: 'Fort' },
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signup, {})
  const [password, setPassword] = useState(state.values?.password ?? '')

  const strength = getPasswordStrength(password)
  const config = strengthConfig[strength]

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm" key={JSON.stringify(state.values)}>
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
      <div className="flex flex-col gap-1">
        <Input
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Min. 6 caracteres"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={state.fieldErrors?.password}
        />
        {strength !== 'none' && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 w-8 rounded-full transition-colors duration-200 ${
                    level <= config.bars ? config.color : 'bg-bg-tertiary'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${
              strength === 'weak' ? 'text-red-500' :
              strength === 'medium' ? 'text-accent-orange' :
              'text-accent-green'
            }`}>{config.label}</span>
          </div>
        )}
      </div>

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
