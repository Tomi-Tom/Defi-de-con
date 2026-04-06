import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    title: 'Defis sur mesure',
    description: "L'admin cree des defis avec les champs qu'il veut",
  },
  {
    title: 'Gamification',
    description: 'Points, badges, classements. Chaque jour compte.',
  },
  {
    title: 'Suivi quotidien',
    description: "Rentre tes donnees en 30 secondes, on s'occupe du reste.",
  },
]

export default function LandingPage() {
  return (
    <div className="animate-fade-in flex flex-col items-center text-center max-w-2xl w-full">
      <div className="relative mb-4">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-accent-green/10 blur-3xl" />
        </div>
        <h1 className="text-6xl font-black tracking-tight">
          <span className="text-accent-green">DEFI</span>DECON
        </h1>
      </div>
      <p className="text-xl text-text-muted mb-8 max-w-md">
        Releve des defis. Suis tes progres. Deviens inarretable.
      </p>
      <div className="flex gap-4 mb-4">
        <Link href="/signup">
          <Button size="lg">Commencer</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">Se connecter</Button>
        </Link>
      </div>
      <p className="text-sm text-text-muted mb-12">Gratuit. Sans pub. 100% motivation.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {features.map((f, i) => (
          <Card key={f.title} className={`animate-slide-up stagger-${i + 1} text-left`}>
            <CardContent className="p-5">
              <h3 className="text-white font-bold mb-1">{f.title}</h3>
              <p className="text-text-muted text-sm">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
