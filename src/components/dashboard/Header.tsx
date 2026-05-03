'use client'
import { Bell, ChevronDown } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { AppNotification } from '@/app/api/notifications/route'

interface HeaderProps {
  title: string
  subtitle?: string
  userName?: string
  userInitials?: string
}

export function Header({ title, subtitle, userName: userNameProp, userInitials: userInitialsProp }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState(userNameProp ?? 'Admin')
  const [userInitials, setUserInitials] = useState(userInitialsProp ?? 'AD')

  useEffect(() => {
    if (!userNameProp) {
      fetch('/api/me')
        .then(r => r.json())
        .then(d => {
          if (d.name) setUserName(d.name)
          if (d.initials) setUserInitials(d.initials)
        })
        .catch(() => {})
    }
  }, [userNameProp])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnread(data.notifications?.length ?? 0)
    } catch {
      // silently fail — notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30s so new events appear without a page reload
    const id = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  const handleOpen = () => {
    setNotifOpen(v => !v)
    if (!notifOpen) setUnread(0)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/8 bg-[#0e0e0e]/90 backdrop-blur-sm px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-[#666666]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <ConnectWalletButton variant="compact" />
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleOpen}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#999999] hover:text-white hover:bg-white/8 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#6c44fc] animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#141414] shadow-2xl z-20">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {notifications.length > 0 && (
                  <span className="rounded-full bg-[#6c44fc]/15 border border-[#6c44fc]/20 px-2 py-0.5 text-xs text-[#6c44fc] font-medium">
                    {notifications.length}
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/8">
                {loading && notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[#666666]">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-[#333333] mb-2" />
                    <p className="text-sm text-[#666666]">No notifications yet</p>
                    <p className="text-xs text-[#444444] mt-0.5">Events will appear here as they happen</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-white/4 transition-colors cursor-pointer" onClick={() => setNotifOpen(false)}>
                      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.dot}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">{n.title}</p>
                        <p className="text-xs text-[#999999] mt-0.5 leading-relaxed">{n.msg}</p>
                        <p className="text-xs text-[#555555] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="border-t border-white/8 px-4 py-2">
                  <button
                    onClick={fetchNotifications}
                    className="text-xs text-[#6c44fc] hover:text-[#7c54ff] transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              )}
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
