'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { toast } from 'sonner'
import {
  ArrowUpFromLine, TrendingUp, Zap, ExternalLink,
  CheckCircle2, AlertTriangle, ExternalLink as LinkIcon, Inbox
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/solana'

interface TreasuryData {
  balance: number
  total_paid_this_month: number
  next_payout_total: number
  active_employees: number
  transactions: Array<{
    id: string
    employee_name: string
    amount: number
    tx_signature: string
    paid_at: string
  }>
}

export default function TreasuryPage() {
  const [data, setData] = useState<TreasuryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/treasury')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => toast.error('Failed to load treasury'))
      .finally(() => setLoading(false))
  }, [])

  const utilization = data ? (data.next_payout_total / (data.balance || 1)) * 100 : 0
  const isLow = data ? data.balance > 0 && data.balance < data.next_payout_total * 1.2 : false

  return (
    <div className="fade-in">
      <Header title="Treasury" subtitle="Your wallet balance powers payroll" />
      <div className="p-6 space-y-6">

        {/* Main balance card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#6c44fc]/8 to-[#141414] p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-[#999999]">Wallet USDC Balance</p>
              {loading ? (
                <div className="mt-2 h-10 w-48 rounded-lg shimmer" />
              ) : (
                <p className="mt-2 text-5xl font-bold text-white">
                  {data ? formatCurrency(data.balance) : '—'}
                </p>
              )}
              <p className="mt-2 text-sm text-[#666666]">Solana Devnet · Live on-chain balance</p>
            </div>

            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#6c44fc]/25 bg-[#6c44fc]/10 px-4 py-2.5 text-sm font-medium text-[#6c44fc] hover:bg-[#6c44fc]/15 transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
              Get Devnet USDC → faucet.circle.com
            </a>
          </div>

          {/* Utilization bar */}
          {data && data.next_payout_total > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#666666]">Balance vs next payroll estimate</span>
                <span className={`text-xs font-medium ${isLow ? 'text-amber-400' : 'text-[#95ffdd]'}`}>
                  {Math.min(utilization, 100).toFixed(0)}% utilized
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    utilization > 90 ? 'bg-red-500' : utilization > 70 ? 'bg-amber-500' : 'bg-[#95ffdd]'
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        {!loading && data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Paid This Month', value: formatCurrency(data.total_paid_this_month), icon: CheckCircle2, color: 'text-[#95ffdd]', bg: 'bg-[#95ffdd]/8 border-[#95ffdd]/20' },
              { label: 'Next Payroll Est.', value: formatCurrency(data.next_payout_total), icon: Zap, color: 'text-[#6c44fc]', bg: 'bg-[#6c44fc]/8 border-[#6c44fc]/20' },
              { label: 'Active Workers', value: `${data.active_employees} employees`, icon: TrendingUp, color: 'text-[#5de2da]', bg: 'bg-[#5de2da]/8 border-[#5de2da]/20' },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <div key={i} className={`rounded-xl border ${bg} p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <p className="text-xs text-[#999999]">{label}</p>
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Low balance warning */}
        {isLow && data && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Balance may be insufficient for next payroll</p>
              <p className="text-xs text-[#999999] mt-1">
                Current balance {formatCurrency(data.balance)} may not cover
                the next payroll run of {formatCurrency(data.next_payout_total)}.
                Get more devnet USDC from{' '}
                <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
                  className="text-[#6c44fc] hover:underline">faucet.circle.com</a>.
              </p>
            </div>
          </div>
        )}

        {/* Payroll transaction history */}
        <div className="rounded-xl border border-white/8 bg-[#141414]">
          <div className="border-b border-white/8 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">Payroll Transactions</h2>
          </div>
          {loading ? (
            <div className="py-8 text-center text-sm text-[#666666]">Loading…</div>
          ) : (data?.transactions?.length || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Inbox className="h-8 w-8 text-[#333333]" />
              <p className="text-sm text-[#666666]">No transactions yet. Run payroll to see history here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {data?.transactions?.map((tx, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c44fc]/15">
                      <ArrowUpFromLine className="h-4 w-4 text-[#6c44fc]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.employee_name}</p>
                      <p className="text-xs text-[#666666]">{formatDateTime(tx.paid_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {tx.tx_signature && (
                      <a href={getExplorerUrl(tx.tx_signature)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#6c44fc] hover:text-[#7c54ff]">
                        <ExternalLink className="h-3 w-3" />Solscan
                      </a>
                    )}
                    <span className="text-sm font-semibold text-red-400">
                      -{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
