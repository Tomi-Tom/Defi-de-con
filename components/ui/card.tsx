import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent'
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const base = 'rounded-[12px] border transition-all duration-200'
  const variants = {
    default: 'bg-bg-secondary border-border hover:border-border/60 hover:shadow-lg hover:shadow-black/20',
    accent: 'bg-gradient-to-br from-accent-green to-accent-green-dark border-transparent',
  }

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pb-2 ${className}`} {...props}>{children}</div>
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-2 ${className}`} {...props}>{children}</div>
}
