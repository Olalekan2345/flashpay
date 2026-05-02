'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { PayrollRunModal } from '@/components/payroll/PayrollRunModal'
import { ConfidentialSalaryBadge } from '@/components/dashboard/ArciumBadge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Zap, Users, CheckCircle2, ExternalLink, Download, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/solana'

interface Employee {
  id: string
  full_name: string
  job_role: string
  pay_frequency: string
  status: string
  next_pay_date: string
}

interface PayrollRecord {
  id: string
  employee_id: string
  employee_name: string
  employee_role: string
  amount: number
  currency: string
  tx_signature: string
  status: string
  paid_at: string
  arcium_proof: string
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [singlePay, setSinglePay] = useState<Employee | null>(null)
  const [tab, setTab] = useState<'run' | 'history'>('run')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/employees').then(r => r.json()),
      fetch('/api/payroll').then(r => r.json()),
    ]).then(([empData, payData]) => {
      setEmployees(empData.employees || [])
      setRecords(payData.records || [])
    }).catch(() => toast.error('Failed to load payroll data'))
      .finally(() => setLoading(false))
  }, [])

  const refreshRecords = () => {
    fetch('/api/payroll').then(r => r.json()).then(data => setRecords(data.records || []))
  }

  const activeEmployees = employees.filter(e => e.status === 'active')
  const filteredRecords = records.filter(r =>
    r.employee_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in">
      <Header title="Payroll" subtitle="Run and track salary payments" />
      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-[#141414] border border-white/8 p-1 w-fit">
          {(['run', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-[#6c44fc] text-white shadow-[0_0_12px_rgba(108,68,252,0.3)]' : 'text-[#999999] hover:text-white'
              }`}
            >
              {t === 'run' ? 'Run Payroll' : 'Payment History'}
            </button>
          ))}
        </div>

        {tab === 'run' && (
          <div className="space-y-4">
            {/* Bulk pay card */}
            <div className="rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/8 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Bulk Payroll Run</h2>
                  <p className="text-sm text-[#999999] mt-1">
                    Pay all {activeEmployees.length} active employees simultaneously via Solana USDC
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-[#666666]">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{activeEmployees.length} employees</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-[#5de2da]" />~400ms settlement</span>
                    <ConfidentialSalaryBadge />
                  </div>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => setBulkOpen(true)}
                  disabled={activeEmployees.length === 0}
                >
                  <Zap className="h-4 w-4" />
                  Pay All Employees
                </Button>
              </div>
            </div>

            {/* Employee payroll list */}
            <div className="rounded-xl border border-white/8 bg-[#141414]">
              <div className="border-b border-white/8 px-6 py-4">
                <h3 className="text-sm font-semibold text-white">Individual Payments</h3>
              </div>
              {loading ? (
                <div className="py-12 text-center text-sm text-[#666666]">Loading…</div>
              ) : activeEmployees.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#666666]">No active employees to pay.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Next Pay</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {activeEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white">
                              {emp.full_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{emp.full_name}</p>
                              <p className="text-xs text-[#666666]">{emp.job_role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm capitalize text-white/80">{emp.pay_frequency}</td>
                        <td className="px-6 py-3.5"><ConfidentialSalaryBadge /></td>
                        <td className="px-6 py-3.5 text-sm text-[#999999]">
                          {emp.next_pay_date ? formatDate(emp.next_pay_date) : '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Button size="sm" onClick={() => setSinglePay(emp)}>
                            <Zap className="h-3.5 w-3.5" />Pay Now
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                <input
                  className="w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#6c44fc]/50"
                  placeholder="Search payments…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" />Export CSV
              </Button>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#141414] overflow-hidden">
              {loading ? (
                <div className="py-12 text-center text-sm text-[#666666]">Loading…</div>
              ) : filteredRecords.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#666666]">No payment records yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Tx Hash</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Privacy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {filteredRecords.map(r => (
                      <tr key={r.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-white">{r.employee_name}</p>
                            <p className="text-xs text-[#666666]">{r.employee_role}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-semibold text-[#95ffdd]">{formatCurrency(r.amount)}</span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-[#999999]">{r.paid_at ? formatDate(r.paid_at) : '—'}</td>
                        <td className="px-6 py-3.5">
                          <a
                            href={getExplorerUrl(r.tx_signature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-xs text-[#6c44fc] hover:text-[#7c54ff]"
                          >
                            {r.tx_signature.slice(0, 16)}…
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-6 py-3.5">
                          <ConfidentialSalaryBadge />
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd] font-medium">
                            <CheckCircle2 className="h-3 w-3" />Paid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <PayrollRunModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        mode="bulk"
        employeeCount={activeEmployees.length}
        onSuccess={() => { refreshRecords(); setTab('history') }}
      />

      {singlePay && (
        <PayrollRunModal
          open={true}
          onClose={() => setSinglePay(null)}
          mode="single"
          employee={singlePay}
          onSuccess={() => { refreshRecords(); setSinglePay(null) }}
        />
      )}
    </div>
  )
}
