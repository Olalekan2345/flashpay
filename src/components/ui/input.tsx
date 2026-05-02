import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, prefix, suffix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/70">{label}</label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center text-[#999999]">
              {prefix}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white placeholder:text-[#666666] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[#6c44fc]/60 focus:border-[#6c44fc]/50',
              'disabled:cursor-not-allowed disabled:opacity-40',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              prefix && 'pl-9',
              suffix && 'pr-9',
              error && 'border-red-500/60 focus:ring-red-500/40',
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center text-[#999999]">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
