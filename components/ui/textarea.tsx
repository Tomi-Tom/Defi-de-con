import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full rounded-[10px] border border-border bg-bg-secondary px-4 py-2.5
            text-white placeholder:text-text-muted
            focus:border-accent-green focus:outline-none focus:ring-1 focus:ring-accent-green
            resize-none ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
