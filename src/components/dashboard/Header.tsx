'use client'
import { Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton'

interface HeaderProps {
  title: string
  subtitle?: string
  userName?: string
  userInitials?: string
}

export function Header({ title, subtitle, userName = 'Admin', userInitials = 'AD' }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/8 bg-[#0e0e0e]/90 backdrop-blur-sm px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-[#666666]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <ConnectWalletButton variant="compact" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#999999] hover:text-white hover:bg-white/8 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#6c44fc]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#141414] shadow-2xl z-20">
              <div className="border-b border-white/8 px-4 py-3">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              <div className="divide-y divide-white/8">
                {[
                  { title: 'Payroll ready to run', msg: 'All employees have connected wallets', time: 'Just now', dot: 'bg-[#6c44fc]' },
                  { title: 'Arcium MPC active', msg: 'All salary data encrypted and verified', time: '5m ago', dot: 'bg-[#95ffdd]' },
                  { title: 'Solana Devnet', msg: 'Network operating normally · ~400ms finality', time: '1h ago', dot: 'bg-[#5de2da]' },
                ].map((n, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 hover:bg-white/4 transition-colors cursor-pointer" onClick={() => setNotifOpen(false)}>
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.dot}`} />
                    <div>
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      <p className="text-xs text-[#999999]">{n.msg}</p>
                      <p className="text-xs text-[#666666] mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/8 transition-colors">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white">
            {userInitials}
          </div>
          <span className="hidden sm:block text-sm text-white/80 font-medium">{userName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#666666]" />
        </button>
      </div>
    </header>
  )
}
