import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[#6c44fc]/30 bg-[#6c44fc]/10 text-[#6c44fc]',
        secondary: 'border-white/10 bg-white/8 text-white/70',
        destructive: 'border-transparent bg-red-500/15 text-red-400',
        success: 'border-[#95ffdd]/20 bg-[#95ffdd]/10 text-[#95ffdd]',
        warning: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
        outline: 'text-white/70 border-white/15',
        arcium: 'border-[#6c44fc]/30 bg-[#6c44fc]/10 text-[#6c44fc]',
        solana: 'border-[#5de2da]/25 bg-[#5de2da]/10 text-[#5de2da]',
        pending: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
        active: 'border-[#95ffdd]/20 bg-[#95ffdd]/10 text-[#95ffdd]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
