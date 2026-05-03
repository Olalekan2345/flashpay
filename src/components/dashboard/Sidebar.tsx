'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, Calendar, BarChart3,
  Wallet, Settings, LogOut, Zap, Shield, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/treasury', label: 'Treasury', icon: Wallet },
  { href: '/dashboard/employees', label: 'Employees', icon: Users },
  { href: '/dashboard/payroll', label: 'Payroll', icon: CreditCard },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
]

interface SidebarProps {
  companyName?: string
  userInitials?: string
}

export function Sidebar({ companyName = 'FlashPay', userInitials = 'FP' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/8 bg-[#0e0e0e]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/8 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-[0_0_16px_rgba(108,68,252,0.4)]">
          <img src="/logo.png" alt="FlashPay" className="h-8 w-8 object-cover" />
        </div>
        <div>
          <span className="text-sm font-bold text-white">FlashPay</span>
          <span className="ml-1 text-sm font-bold text-[#6c44fc]">Private</span>
        </div>
      </div>

      {/* Company */}
      <div className="mx-3 mt-3 rounded-lg bg-white/5 border border-white/8 px-3 py-2.5">
        <p className="text-xs text-[#666666] font-medium uppercase tracking-wider">Workspace</p>
        <p className="mt-0.5 text-sm font-semibold text-white truncate">{companyName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-[#6c44fc]/15 text-white border border-[#6c44fc]/25'
                  : 'text-[#999999] hover:bg-white/5 hover:text-white border border-transparent'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#6c44fc]' : 'text-[#666666] group-hover:text-[#999999]')} />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#6c44fc]" />}
            </Link>
          )
        })}
      </nav>

      {/* Arcium Status */}
      <div className="mx-3 mb-3 rounded-lg border border-[#6c44fc]/20 bg-[#6c44fc]/8 p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-[#6c44fc] shrink-0" />
          <p className="text-xs font-semibold text-white">Arcium MPC Active</p>
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />
        </div>
        <p className="mt-1 text-xs text-[#666666]">Salaries encrypted &amp; private</p>
      </div>

      {/* Footer */}
      <div className="border-t border-white/8 p-3 space-y-0.5">
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#999999] hover:bg-white/5 hover:text-white transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#999999] hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
