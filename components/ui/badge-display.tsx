interface BadgeDisplayProps {
  name: string
  iconUrl: string
  earned?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }

export function BadgeDisplay({ name, iconUrl, earned = true, size = 'md', animate = false }: BadgeDisplayProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${!earned ? 'opacity-30 grayscale' : 'transition-transform duration-200 hover:scale-110'}`}>
      <div className={`${sizes[size]} relative ${animate ? 'animate-badge-unlock' : ''}`}>
        <img src={iconUrl} alt={name} className="w-full h-full" />
        {earned && animate && (
          <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(0,255,135,0.5)] animate-pulse" />
        )}
      </div>
      <span className="text-xs text-text-muted font-semibold">{name}</span>
    </div>
  )
}
