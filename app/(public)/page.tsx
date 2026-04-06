import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: completedCount },
    { count: entryCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('daily_entries').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="animate-fade-in flex flex-col items-center text-center max-w-3xl px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-accent-green">Saison 1 — Ouverte</span>
        </div>

        {/* Title */}
        <h1 className="mb-6">
          <span className="block text-7xl md:text-8xl font-black tracking-tighter leading-none">
            <span className="text-accent-green">DEFI</span>
          </span>
          <span className="block text-5xl md:text-6xl font-black tracking-tight leading-none mt-1">
            <span className="text-white">DE </span>
            <span className="text-accent-orange">CON</span>
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-md mx-auto mb-4 leading-relaxed">
          Releve des defis. Suis tes progres.<br />
          <span className="text-white font-bold">Deviens inarretable.</span>
        </p>

        <p className="text-xs text-text-muted mb-8">Gratuit. Sans pub. 100% motivation.</p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div>
            <div className="text-2xl font-black text-accent-orange">{userCount ?? 0}</div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">Athletes</div>
          </div>
          <div className="w-px bg-border" />
          <div>
            <div className="text-2xl font-black text-accent-orange">{completedCount ?? 0}</div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">Defis completes</div>
          </div>
          <div className="w-px bg-border" />
          <div>
            <div className="text-2xl font-black text-accent-orange">{entryCount ?? 0}</div>
            <div className="text-[10px] uppercase tracking-widest text-text-muted">Saisies</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/signup">
            <Button size="lg" className="px-8 shadow-[0_0_30px_rgba(0,255,135,0.2)]">
              Rejoindre le combat
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="px-8">
              Se connecter
            </Button>
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="animate-slide-up stagger-1 bg-bg-secondary/80 backdrop-blur rounded-2xl border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-green" />
            <h3 className="text-sm font-black text-white mb-1">Defis sur mesure</h3>
            <p className="text-xs text-text-muted leading-relaxed">L'admin cree des defis avec les champs qu'il veut. Chaque defi est unique.</p>
          </div>
          <div className="animate-slide-up stagger-2 bg-bg-secondary/80 backdrop-blur rounded-2xl border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-orange" />
            <h3 className="text-sm font-black text-white mb-1">Gamification</h3>
            <p className="text-xs text-text-muted leading-relaxed">Points, badges, classements. Chaque jour compte. Chaque effort est recompense.</p>
          </div>
          <div className="animate-slide-up stagger-3 bg-bg-secondary/80 backdrop-blur rounded-2xl border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-400" />
            <h3 className="text-sm font-black text-white mb-1">Suivi quotidien</h3>
            <p className="text-xs text-text-muted leading-relaxed">30 secondes pour rentrer tes donnees. Graphiques, journal, progression automatique.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
