import { ShieldCheck, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArciumBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function ArciumBadge({ size = 'md', showText = true, className }: ArciumBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }
  const iconSizes = { sm: 'h-3 w-3', md: 'h-3.5 w-3.5', lg: 'h-4 w-4' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[#6c44fc]/30 bg-[#6c44fc]/10 font-medium text-white/70',
        sizeClasses[size],
        className
      )}
    >
      <ShieldCheck className={iconSizes[size]} />
      {showText && 'Protected by Arcium'}
    </span>
  )
}

interface ConfidentialSalaryBadgeProps {
  className?: string
}

export function ConfidentialSalaryBadge({ className }: ConfidentialSalaryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-[#6c44fc]/25 bg-[#6c44fc]/10 px-2.5 py-0.5 text-xs font-semibold text-[#6c44fc]',
        className
      )}
    >
      <Lock className="h-3 w-3" />
      Confidential
    </span>
  )
}

export function ArciumStatusBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c44fc]/20">
        <ShieldCheck className="h-4 w-4 text-[#6c44fc]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">Arcium Confidential Compute Active</p>
        <p className="text-xs text-[#999999] truncate">
          All salary data encrypted via MPC • Zero-knowledge proofs verified • Access-controlled decryption
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />
        <span className="text-xs text-[#95ffdd] font-medium">Operational</span>
      </div>
    </div>
  )
}
