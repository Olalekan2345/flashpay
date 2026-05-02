'use client'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c44fc] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-[#6c44fc] text-white hover:bg-[#7c54ff] active:scale-[0.98] shadow-[0_0_16px_rgba(108,68,252,0.3)] hover:shadow-[0_0_24px_rgba(108,68,252,0.45)]',
        destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-sm',
        outline: 'border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20',
        secondary: 'bg-[#1a1a1a] text-white hover:bg-[#242424] border border-white/8',
        ghost: 'text-[#999999] hover:bg-white/5 hover:text-white',
        link: 'text-[#6c44fc] underline-offset-4 hover:underline',
        success: 'bg-[#95ffdd]/20 text-[#95ffdd] border border-[#95ffdd]/25 hover:bg-[#95ffdd]/30',
        premium: 'bg-gradient-to-r from-[#6c44fc] to-[#5de2da] text-white hover:opacity-90 shadow-[0_0_24px_rgba(108,68,252,0.35)] active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base',
        xl: 'h-14 rounded-xl px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
