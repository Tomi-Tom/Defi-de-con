import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-accent-green to-accent-green-dark text-black font-black hover:shadow-[0_0_20px_rgba(0,255,135,0.3)] uppercase tracking-wide',
  secondary: 'bg-transparent border-2 border-accent-orange text-accent-orange font-black hover:bg-accent-orange/10 uppercase tracking-wide',
  danger: 'bg-gradient-to-r from-error to-red-600 text-white font-black uppercase tracking-wide',
  ghost: 'text-text-muted hover:text-white hover:bg-white/5 font-semibold',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200
          hover:scale-[1.02] active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
