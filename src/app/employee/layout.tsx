import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Zap, LayoutDashboard, CreditCard, FileText, Wallet, LogOut, Shield } from 'lucide-react'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'employee') {
    redirect('/login')
  }

  const initials = session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Employee sidebar */}
      <aside className="flex h-screen w-60 flex-col border-r border-white/8 bg-[#0e0e0e]">
        <div className="flex h-16 items-center gap-3 border-b border-white/8 px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6c44fc] shadow-[0_0_12px_rgba(108,68,252,0.4)]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">FlashPay</p>
            <p className="text-xs text-[#666666]">Employee Portal</p>
          </div>
        </div>

        <div className="mx-3 mt-3 rounded-lg bg-white/5 border border-white/8 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{session.name}</p>
              <p className="text-xs text-[#666666] truncate">{session.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/employee/payments', label: 'Payments', icon: CreditCard },
            { href: '/employee/payslips', label: 'Payslips', icon: FileText },
            { href: '/employee/wallet', label: 'Wallet', icon: Wallet },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#999999] hover:bg-white/5 hover:text-white border border-transparent transition-all">
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mx-3 mb-3 rounded-lg border border-[#6c44fc]/20 bg-[#6c44fc]/8 p-2.5">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-[#6c44fc]" />
            <p className="text-xs text-white">Arcium Privacy Active</p>
          </div>
        </div>

        <div className="border-t border-white/8 p-3">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#999999] hover:bg-red-500/10 hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
