import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/dashboard/Header'
import { ConfidentialSalaryBadge } from '@/components/dashboard/ArciumBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/solana'
import { CheckCircle2, ExternalLink, Shield, Download } from 'lucide-react'

export default async function EmployeePaymentsPage() {
  const session = await getSession()
  if (!session) return null

  const employee = await db.getEmployeeByEmail(session.email)
  if (!employee) return <div className="p-8 text-[#999999]">Not found.</div>

  const payments = (await db.getEmployeePayroll(employee.id))
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime())

  const totalReceived = payments.reduce((s, r) => s + r.amount, 0)
  const initials = session.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="fade-in">
      <Header title="Payments" subtitle="Your complete payment history" userName={session.name} userInitials={initials} />
      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
            <p className="text-xs text-[#999999] mb-1">Total Received</p>
            <p className="text-xl font-bold text-[#95ffdd]">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#141414] p-5">
            <p className="text-xs text-[#999999] mb-1">Payments</p>
            <p className="text-xl font-bold text-white">{payments.length}</p>
          </div>
          <div className="rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="h-3 w-3 text-[#6c44fc]" />
              <p className="text-xs text-[#999999]">Privacy</p>
            </div>
            <p className="text-sm font-semibold text-[#6c44fc]">Arcium MPC</p>
          </div>
        </div>

        {/* Payment list */}
        <div className="rounded-xl border border-white/8 bg-[#141414] overflow-hidden">
          <div className="border-b border-white/8 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">All Payments</h2>
          </div>
          {payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#666666]">No payments yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Privacy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Tx</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {payments.map(r => (
                  <tr key={r.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3.5 text-sm text-white/80">
                      {r.paid_at ? formatDate(r.paid_at) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-[#666666]">
                      {formatDate(r.pay_period_start)} – {formatDate(r.pay_period_end)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-bold text-[#95ffdd]">{formatCurrency(r.amount)}</span>
                    </td>
                    <td className="px-6 py-3.5"><ConfidentialSalaryBadge /></td>
                    <td className="px-6 py-3.5">
                      <a
                        href={getExplorerUrl(r.tx_signature ?? '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-[#6c44fc] hover:text-[#7c54ff]"
                      >
                        {(r.tx_signature ?? '').slice(0, 12)}…<ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd] font-medium">
                        <CheckCircle2 className="h-3 w-3" />Received
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="flex items-center gap-1 text-xs text-[#666666] hover:text-white ml-auto transition-colors">
                        <Download className="h-3.5 w-3.5" />PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-[#444444] text-center">
          All payments are verified by Arcium zero-knowledge proofs · Settled on Solana Devnet
        </p>
      </div>
    </div>
  )
}
