'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-white/70">{label}</label>}
        <div className="relative">
          <select
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#141414] px-3 py-2 pr-8 text-sm text-white transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[#6c44fc]/60 focus:border-[#6c44fc]/50',
              'disabled:cursor-not-allowed disabled:opacity-40',
              error && 'border-red-500/60',
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && <option value="" style={{ background: '#141414' }}>{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: '#141414' }}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
