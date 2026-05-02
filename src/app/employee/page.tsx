import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ArciumBadge, ConfidentialSalaryBadge } from '@/components/dashboard/ArciumBadge'
import { Header } from '@/components/dashboard/Header'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CheckCircle2, Zap, Clock, Shield, ExternalLink, Wallet } from 'lucide-react'
import { getExplorerUrl } from '@/lib/solana'
import Link from 'next/link'

function getSalaryFromToken(token: string): number {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return JSON.parse(decoded).amount || 0
  } catch { return 0 }
}

export default async function EmployeeDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const employee = await db.getEmployeeByEmail(session.email)
  if (!employee) redirect('/login')

  const paymentHistory = await db.getEmployeePayroll(employee.id)
  const recentPayments = paymentHistory
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime())
    .slice(0, 3)

  const totalReceived = paymentHistory.filter(r => r.status === 'completed').reduce((s, r) => s + r.amount, 0)
  const mySalary = getSalaryFromToken(employee.salary_token)

  const initials = session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="fade-in min-h-screen bg-black">
      <Header title="My Dashboard" subtitle="Your payroll overview" userName={session.name} userInitials={initials} />
      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#6c44fc]/8 to-[#141414] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#999999]">Welcome back</p>
              <h2 className="text-2xl font-bold text-white mt-1">{employee.full_name}</h2>
              <p className="text-[#999999] text-sm mt-0.5">{employee.job_role} · {employee.country}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ArciumBadge size="sm" />
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                employee.status === 'active'
                  ? 'bg-[#95ffdd]/10 border border-[#95ffdd]/20 text-[#95ffdd]'
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
              }`}>
                <div className={`h-1.5 w-1.5 rounded-full ${employee.status === 'active' ? 'bg-[#95ffdd]' : 'bg-amber-400'} animate-pulse`} />
                {employee.status === 'active' ? 'Active' : 'Onboarding'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
            <p className="text-xs text-[#999999] mb-2">My Salary</p>
            <ConfidentialSalaryBadge />
            <p className="mt-2 text-xs text-[#666666]">Protected by Arcium MPC — only visible to you</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
            <p className="text-xs text-[#999999] mb-2">Total Received</p>
            <p className="text-xl font-bold text-[#95ffdd]">{formatCurrency(totalReceived)}</p>
            <p className="text-xs text-[#666666] mt-1">{paymentHistory.length} payment{paymentHistory.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-[#6c44fc]" />
              <p className="text-xs text-[#999999]">Next Pay Date</p>
            </div>
            <p className="text-lg font-bold text-white">
              {employee.next_pay_date ? formatDate(employee.next_pay_date) : '—'}
            </p>
            <p className="text-xs text-[#666666] mt-1 capitalize">{employee.pay_frequency} cadence</p>
          </div>
        </div>

        {/* My Salary reveal */}
        <div className="rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#6c44fc]" />
              <h3 className="text-sm font-semibold text-white">Your Confidential Salary</h3>
            </div>
            <ArciumBadge size="sm" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-black/30">
            <div>
              <p className="text-xs text-[#666666] mb-1">Gross Amount per period</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(mySalary)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#666666] mb-1">Frequency</p>
              <p className="text-sm font-medium text-white/80 capitalize">{employee.pay_frequency}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#666666]">
            This salary amount is stored encrypted via Arcium MPC and is only visible to you and your employer.
            It is never exposed in blockchain transactions.
          </p>
        </div>

        {/* Wallet */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-[#999999]" />
            <h3 className="text-sm font-semibold text-white">Wallet</h3>
          </div>
          {employee.wallet_address ? (
            <div className="flex items-center justify-between rounded-lg bg-white/4 border border-white/8 px-4 py-3">
              <span className="font-mono text-sm text-white/80 truncate max-w-xs">{employee.wallet_address}</span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd]" />
                <span className="text-xs text-[#95ffdd]">Connected</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-500/8 border border-amber-500/20 px-4 py-3">
              <p className="text-sm text-amber-300">No wallet connected — payments are queued until you connect.</p>
              <Link href={`/invite/${employee.invite_token}`} className="mt-2 text-xs text-[#6c44fc] hover:underline">Connect wallet →</Link>
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="rounded-xl border border-white/8 bg-[#141414]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <h3 className="text-sm font-semibold text-white">Recent Payments</h3>
            <Link href="/employee/payments" className="text-xs text-[#6c44fc] hover:text-[#7c54ff]">View all →</Link>
          </div>
          {recentPayments.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#666666]">No payments received yet.</div>
          ) : (
            <div className="divide-y divide-white/4">
              {recentPayments.map(r => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Salary Payment</p>
                    <p className="text-xs text-[#666666]">{r.paid_at ? formatDate(r.paid_at) : '—'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ConfidentialSalaryBadge />
                    <p className="text-sm font-bold text-[#95ffdd]">{formatCurrency(r.amount)}</p>
                    <a href={getExplorerUrl(r.tx_signature ?? '')} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#6c44fc] hover:text-[#7c54ff]">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd]">
                      <CheckCircle2 className="h-3 w-3" />Received
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solana speed note */}
        <div className="flex items-center gap-3 rounded-xl border border-[#5de2da]/20 bg-[#5de2da]/5 px-4 py-3">
          <Zap className="h-4 w-4 text-[#5de2da] shrink-0" />
          <p className="text-xs text-[#999999]">
            Your payments are sent via <span className="text-[#5de2da] font-medium">Solana</span> — settling in ~400ms with near-zero fees.
            Every payment includes an Arcium cryptographic proof confirming the correct amount was paid.
          </p>
        </div>
      </div>
    </div>
  )
}
