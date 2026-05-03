import { redirect } from 'next/navigation'
import { Header } from '@/components/dashboard/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ArciumStatusBanner } from '@/components/dashboard/ArciumBadge'
import { ConfidentialSalaryBadge } from '@/components/dashboard/ArciumBadge'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getUSDCBalance } from '@/lib/solana'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Wallet, Users, TrendingUp, CreditCard, Zap,
  AlertTriangle, ArrowUpRight, Shield, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

function getSalaryFromToken(token: string): number {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return JSON.parse(decoded).amount || 0
  } catch { return 0 }
}

export default async function DashboardOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const employer = await db.getEmployerByEmail(session.email)
  if (!employer) redirect('/login')

  const employees = await db.getEmployees(employer.id)
  const payrollRecords = await db.getPayrollRecords(employer.id)

  const activeEmployees = employees.filter(e => e.status === 'active')
  const pendingEmployees = employees.filter(e => e.status === 'pending_onboarding')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const completedRecords = payrollRecords.filter(r => r.status === 'completed' && r.paid_at)

  const paidThisMonth = completedRecords
    .filter(r => new Date(r.paid_at!) >= monthStart)
    .reduce((sum, r) => sum + r.amount, 0)

  const paidLastMonth = completedRecords
    .filter(r => {
      const d = new Date(r.paid_at!)
      return d >= lastMonthStart && d < monthStart
    })
    .reduce((sum, r) => sum + r.amount, 0)

  // % change in payroll spend month-over-month
  const payrollTrend = paidLastMonth === 0
    ? null
    : Math.round(((paidThisMonth - paidLastMonth) / paidLastMonth) * 100)

  // Active employee count change vs last month (employees added this month)
  const employeesAddedThisMonth = employees.filter(
    e => new Date(e.created_at) >= monthStart
  ).length

  const nextPayoutTotal = activeEmployees.reduce((sum, e) => sum + getSalaryFromToken(e.salary_token), 0)

  const recentPayments = payrollRecords
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime())
    .slice(0, 5)

  // Use real on-chain balance if wallet connected, else fall back to DB value
  const realBalance = employer.wallet_address
    ? await getUSDCBalance(employer.wallet_address)
    : employer.treasury_balance

  // Only warn when wallet is connected, there are active employees to pay,
  // and the real on-chain balance is actually insufficient
  const treasuryWarning =
    !!employer.wallet_address &&
    nextPayoutTotal > 0 &&
    realBalance < nextPayoutTotal

  const initials = session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="fade-in">
      <Header
        title="Overview"
        subtitle={`${employer.company_name} Payroll Dashboard`}
        userName={session.name}
        userInitials={initials}
      />

      <div className="p-6 space-y-6">
        <ArciumStatusBanner />

        {/* Treasury Warning */}
        {treasuryWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Low Treasury Balance</p>
              <p className="text-xs text-[#999999] mt-0.5">
                Your wallet holds {formatCurrency(realBalance)} USDC but the next payroll run needs {formatCurrency(nextPayoutTotal)}.
                {' '}<Link href="/dashboard/treasury" className="text-amber-400 hover:underline">Add funds →</Link>
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Treasury Balance"
            value={formatCurrency(realBalance)}
            subtitle="Available for payroll"
            icon={Wallet}
            iconColor="text-[#95ffdd]"
            iconBg="bg-[#95ffdd]/10 border border-[#95ffdd]/20"
          />
          <StatsCard
            title="Active Employees"
            value={String(activeEmployees.length)}
            subtitle={`${pendingEmployees.length} pending onboarding`}
            icon={Users}
            iconColor="text-[#5de2da]"
            iconBg="bg-[#5de2da]/10 border border-[#5de2da]/20"
            trend={employeesAddedThisMonth > 0 ? { value: employeesAddedThisMonth, positive: true, label: `added this month` } : undefined}
          />
          <StatsCard
            title="Paid This Month"
            value={formatCurrency(paidThisMonth)}
            subtitle={`${completedRecords.filter(r => new Date(r.paid_at!) >= monthStart).length} transactions`}
            icon={CreditCard}
            iconColor="text-[#6c44fc]"
            iconBg="bg-[#6c44fc]/15 border border-[#6c44fc]/20"
            trend={payrollTrend !== null ? { value: Math.abs(payrollTrend), positive: payrollTrend >= 0, label: 'vs last month' } : undefined}
          />
          <StatsCard
            title="Next Payout"
            value={formatCurrency(nextPayoutTotal)}
            subtitle="Aggregate (private computation)"
            icon={TrendingUp}
            iconColor="text-[#6c44fc]"
            iconBg="bg-[#6c44fc]/15 border border-[#6c44fc]/20"
            badge={<Shield className="h-4 w-4 text-[#6c44fc]" />}
          />
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Payments */}
          <div className="lg:col-span-2 rounded-xl border border-white/8 bg-[#141414]">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <h2 className="text-sm font-semibold text-white">Recent Payments</h2>
              <Link href="/dashboard/payroll" className="flex items-center gap-1 text-xs text-[#6c44fc] hover:text-[#7c54ff]">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentPayments.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-[#666666]">No payments yet. Run your first payroll.</div>
              )}
              {recentPayments.map(record => (
                <div key={record.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white shrink-0">
                      {record.employee_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{record.employee_name}</p>
                      <p className="text-xs text-[#666666]">{record.employee_role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ConfidentialSalaryBadge />
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#95ffdd]">{formatCurrency(record.amount)}</p>
                      <p className="text-xs text-[#666666]">{record.paid_at ? formatDate(record.paid_at) : '—'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3 text-[#95ffdd]" />
                      <span className="text-xs text-[#95ffdd] font-medium">Paid</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions + Solana stats */}
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-[#141414] p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link href="/dashboard/payroll" className="flex items-center gap-3 rounded-lg bg-[#6c44fc]/12 border border-[#6c44fc]/20 px-4 py-3 hover:bg-[#6c44fc]/20 transition-colors">
                  <Zap className="h-4 w-4 text-[#6c44fc]" />
                  <span className="text-sm font-medium text-white">Run Bulk Payroll</span>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#6c44fc]" />
                </Link>
                <Link href="/dashboard/employees" className="flex items-center gap-3 rounded-lg bg-white/4 border border-white/8 px-4 py-3 hover:bg-white/6 transition-colors">
                  <Users className="h-4 w-4 text-[#999999]" />
                  <span className="text-sm font-medium text-white/80">Add Employee</span>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#666666]" />
                </Link>
                <Link href="/dashboard/treasury" className="flex items-center gap-3 rounded-lg bg-white/4 border border-white/8 px-4 py-3 hover:bg-white/6 transition-colors">
                  <Wallet className="h-4 w-4 text-[#999999]" />
                  <span className="text-sm font-medium text-white/80">Treasury</span>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#666666]" />
                </Link>
                <Link href="/dashboard/reports" className="flex items-center gap-3 rounded-lg bg-white/4 border border-white/8 px-4 py-3 hover:bg-white/6 transition-colors">
                  <CreditCard className="h-4 w-4 text-[#999999]" />
                  <span className="text-sm font-medium text-white/80">Download Report</span>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[#666666]" />
                </Link>
              </div>
            </div>

            {/* Solana Network */}
            <div className="rounded-xl border border-[#5de2da]/20 bg-[#5de2da]/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#5de2da]" />
                  <h3 className="text-sm font-semibold text-[#5de2da]">Solana Devnet</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />
                  <span className="text-xs text-[#95ffdd]">Live</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Avg settlement', value: '~400ms' },
                  { label: 'Avg fee', value: '$0.00025' },
                  { label: 'Network TPS', value: '65,000+' },
                  { label: 'Currency', value: 'USDC (devnet)' },
                ].map(({ label, value }, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[#666666]">{label}</span>
                    <span className="text-white/80 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Status */}
        <div className="rounded-xl border border-white/8 bg-[#141414]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">Team Overview</h2>
            <Link href="/dashboard/employees" className="flex items-center gap-1 text-xs text-[#6c44fc] hover:text-[#7c54ff]">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Next Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#666666]">No employees yet. Add your first team member.</td>
                  </tr>
                )}
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white shrink-0">
                          {emp.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{emp.full_name}</p>
                          <p className="text-xs text-[#666666]">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-white/80">{emp.job_role}</td>
                    <td className="px-6 py-3.5 text-sm text-[#999999]">{emp.country}</td>
                    <td className="px-6 py-3.5"><ConfidentialSalaryBadge /></td>
                    <td className="px-6 py-3.5 text-sm text-[#999999]">
                      {emp.next_pay_date ? formatDate(emp.next_pay_date) : '—'}
                    </td>
                    <td className="px-6 py-3.5">
                      {emp.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd] font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd]" />Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs text-amber-400 font-medium">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />Onboarding
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
