import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; positive: boolean; label?: string }
  className?: string
  badge?: React.ReactNode
}

export function StatsCard({
  title, value, subtitle, icon: Icon, iconColor = 'text-[#6c44fc]',
  iconBg = 'bg-[#6c44fc]/15 border border-[#6c44fc]/20', trend, className, badge
}: StatsCardProps) {
  return (
    <div className={cn(
      'group relative rounded-xl border border-white/8 bg-[#141414] p-6 hover:border-white/15 transition-all duration-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {badge}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-[#999999]">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-[#666666]">{subtitle}</p>}
      </div>

      {trend && (
        <div className={cn(
          'mt-3 flex items-center gap-1 text-xs font-medium',
          trend.positive ? 'text-[#95ffdd]' : 'text-red-400'
        )}>
          {trend.positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend.positive ? '+' : '-'}{Math.abs(trend.value)}%
          {trend.label && <span className="text-[#666666] font-normal ml-1">{trend.label}</span>}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#6c44fc]/4 to-transparent" />
    </div>
  )
}
