interface UserAvatarProps {
  username: string
  avatarUrl: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'w-7 h-7 text-[9px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 text-3xl',
}

export function UserAvatar({ username, avatarUrl, size = 'md', className = '' }: UserAvatarProps) {
  const initials = (username ?? '??').slice(0, 2).toUpperCase()

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-accent-green/20 flex items-center justify-center font-black text-accent-green overflow-hidden flex-shrink-0 ${className}`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}
