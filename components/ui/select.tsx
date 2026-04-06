import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5
            text-white focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green
            ${error ? 'border-error' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
