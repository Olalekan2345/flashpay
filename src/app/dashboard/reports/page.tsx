'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { ArciumBadge } from '@/components/dashboard/ArciumBadge'
import { Download, BarChart3, TrendingUp, Users, DollarSign, Shield, FileText, Inbox } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface ReportData {
  total_paid_this_month: number
  total_paid_all_time: number
  total_employees: number
  active_employees: number
  monthly_breakdown: Array<{ month: string; total: number; count: number }>
  top_roles: Array<{ role: string; count: number }>
  recent_payments: Array<{ employee_name: string; paid_at: string; tx_signature: string; amount: number }>
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/payroll').then(r => r.json()),
      fetch('/api/employees').then(r => r.json()),
    ]).then(([payData, empData]) => {
      const records: Array<{ employee_name: string; employee_role: string; paid_at: string; tx_signature: string; amount: number; status: string }> = payData.records || []
      const employees: Array<{ job_role: string; status: string }> = empData.employees || []

      const completed = records.filter(r => r.status === 'completed')

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const totalThisMonth = completed
        .filter(r => new Date(r.paid_at) >= monthStart)
        .reduce((s, r) => s + r.amount, 0)
      const totalAllTime = completed.reduce((s, r) => s + r.amount, 0)

      const byMonth: Record<string, { total: number; count: number }> = {}
      for (const r of completed) {
        const d = new Date(r.paid_at)
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
        if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 }
        byMonth[key].total += r.amount
        byMonth[key].count += 1
      }
      const monthly_breakdown = Object.entries(byMonth)
        .map(([month, v]) => ({ month, ...v }))
        .slice(-6)

      const roleCounts: Record<string, number> = {}
      for (const e of employees) {
        roleCounts[e.job_role] = (roleCounts[e.job_role] || 0) + 1
      }
      const top_roles = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)

      setData({
        total_paid_this_month: totalThisMonth,
        total_paid_all_time: totalAllTime,
        total_employees: employees.length,
        active_employees: employees.filter(e => e.status === 'active').length,
        monthly_breakdown,
        top_roles,
        recent_payments: completed.slice(0, 5),
      })
    }).catch(() => toast.error('Failed to load report data'))
      .finally(() => setLoading(false))
  }, [])

  const downloadCSV = () => {
    if (!data) return
    const rows = [
      ['FlashPay Private — Payroll Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Summary'],
      [`Total Paid This Month,${data.total_paid_this_month} USDC`],
      [`Total Paid All Time,${data.total_paid_all_time} USDC`],
      [`Active Employees,${data.active_employees}`],
      [''],
      ['Note: Individual salary amounts are CONFIDENTIAL and protected by Arcium MPC.'],
      [''],
      ['Monthly Breakdown'],
      ['Month,Total Payout (USDC),Payments'],
      ...data.monthly_breakdown.map(m => `${m.month},${m.total},${m.count}`),
      [''],
      ['Recent Payments'],
      ['Employee,Amount (USDC),Date,Tx Signature'],
      ...data.recent_payments.map(p =>
        `${p.employee_name},${p.amount},${formatDate(p.paid_at)},${p.tx_signature}`
      ),
    ]
    const csv = rows.map(r => Array.isArray(r) ? r.join('') : r).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flashpay-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast.success('Report downloaded!')
  }

  const maxMonthly = Math.max(...(data?.monthly_breakdown?.map(m => m.total) || [1]), 1)
  const isEmpty = !loading && data?.total_paid_all_time === 0

  return (
    <div className="fade-in">
      <Header title="Reports" subtitle="Payroll analytics and insights" />
      <div className="p-6 space-y-6">

        {/* Privacy notice */}
        <div className="flex items-start gap-3 rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 p-4">
          <Shield className="h-5 w-5 text-[#6c44fc] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Privacy-Preserving Analytics</p>
            <p className="text-xs text-[#999999] mt-1">
              All aggregate statistics are computed via Arcium's confidential compute layer.
              Individual salary amounts are never revealed — only totals and counts.
            </p>
          </div>
          <ArciumBadge size="sm" />
        </div>

        {/* Download */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={downloadCSV} disabled={loading || isEmpty}>
            <Download className="h-4 w-4" />
            Download CSV Report
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-[#141414] p-5 h-24 shimmer" />
            ))
          ) : [
            { label: 'Paid This Month', value: formatCurrency(data?.total_paid_this_month ?? 0), icon: DollarSign, color: 'text-[#95ffdd]' },
            { label: 'Paid All Time', value: formatCurrency(data?.total_paid_all_time ?? 0), icon: TrendingUp, color: 'text-[#6c44fc]' },
            { label: 'Active Employees', value: String(data?.active_employees ?? 0), icon: Users, color: 'text-[#5de2da]' },
            { label: 'Avg Salary', value: 'Confidential', icon: Shield, color: 'text-[#6c44fc]' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-[#141414] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${color}`} />
                <p className="text-xs text-[#999999]">{label}</p>
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              {value === 'Confidential' && <ArciumBadge size="sm" className="mt-1" />}
            </div>
          ))}
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-white/8 bg-[#141414] py-20 flex flex-col items-center gap-3">
            <Inbox className="h-10 w-10 text-[#333333]" />
            <p className="text-[#666666] text-sm">No payroll data yet. Run your first payroll to see analytics here.</p>
          </div>
        ) : (
          <>
            {/* Monthly chart */}
            {data && data.monthly_breakdown.length > 0 && (
              <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#999999]" />
                    <h2 className="text-sm font-semibold text-white">Monthly Payroll Volume</h2>
                  </div>
                  <ArciumBadge size="sm" />
                </div>
                <div className="flex items-end gap-4 h-48">
                  {data.monthly_breakdown.map((m, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-xs text-[#999999]">{formatCurrency(m.total).split(' ')[0]}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#6c44fc] to-[#5de2da] transition-all duration-500"
                        style={{ height: `${Math.max((m.total / maxMonthly) * 160, 4)}px` }}
                      />
                      <span className="text-xs text-[#666666] text-center whitespace-nowrap">{m.month.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role breakdown + Recent payments */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Team Roles</h2>
                {data && data.top_roles.length > 0 ? (
                  <div className="space-y-3">
                    {data.top_roles.map(({ role, count }, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-white/80">{role}</span>
                        <span className="text-xs font-medium text-[#999999]">{count} employee{count > 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#666666]">No employees yet.</p>
                )}
              </div>

              <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Recent Payments</h2>
                {data && data.recent_payments.length > 0 ? (
                  <div className="space-y-2">
                    {data.recent_payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/3 px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-[#666666]" />
                          <div>
                            <p className="text-sm text-white/80">{p.employee_name}</p>
                            <p className="text-xs text-[#666666]">{formatDate(p.paid_at)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#95ffdd]">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#666666]">No payments yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
