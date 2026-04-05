import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl">
      <h1 className="text-6xl font-black tracking-tight mb-4">
        <span className="text-accent-green">DEFI</span>DECON
      </h1>
      <p className="text-xl text-text-muted mb-8 max-w-md">
        Releve des defis. Suis tes progres. Deviens inarretable.
      </p>
      <div className="flex gap-4">
        <Link href="/signup">
          <Button size="lg">Commencer</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">Se connecter</Button>
        </Link>
      </div>
    </div>
  )
}
