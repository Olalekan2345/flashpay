'use client'
import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import {
  Calendar, Zap, Clock, Play, Pause, Bot,
  CheckCircle2, XCircle, AlertCircle, Shield, Users
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Schedule {
  id: string
  active: boolean
  ai_enabled: boolean
  last_run_at: string | null
  last_run_status: string | null
  last_ai_reason: string | null
}

interface Employee {
  id: string
  full_name: string
  job_role: string
  pay_frequency: string
  next_pay_date: string | null
  status: string
  wallet_address: string | null
}

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  hourly: 'Daily',
}

const FREQ_ORDER = ['weekly', 'biweekly', 'monthly', 'hourly']

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [schedRes, empRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/employees'),
      ])
      const schedData = await schedRes.json()
      const empData = await empRes.json()

      const schedules: Schedule[] = schedData.schedules ?? []
      setSchedule(schedules[0] ?? null)
      setEmployees((empData.employees ?? []).filter((e: Employee) => e.status === 'active'))
    } catch {
      toast.error('Failed to load schedule data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const enableAutoPayroll = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Auto Payroll',
          frequency: 'monthly',
          pay_day: 1,
          ai_enabled: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSchedule(data.schedule)
      toast.success('Auto-payroll enabled — AI agent is active')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to enable')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async () => {
    if (!schedule) return
    setSaving(true)
    try {
      await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !schedule.active }),
      })
      setSchedule(s => s ? { ...s, active: !s.active } : s)
      toast.success(schedule.active ? 'Auto-payroll paused' : 'Auto-payroll activated')
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  const toggleAI = async () => {
    if (!schedule) return
    setSaving(true)
    try {
      await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_enabled: !schedule.ai_enabled }),
      })
      setSchedule(s => s ? { ...s, ai_enabled: !s.ai_enabled } : s)
      toast.success(schedule.ai_enabled ? 'AI agent disabled' : 'AI agent enabled')
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  const statusIcon = (status: string | null) => {
    if (status === 'success') return <CheckCircle2 className="h-4 w-4 text-[#95ffdd]" />
    if (status === 'skipped') return <AlertCircle className="h-4 w-4 text-amber-400" />
    if (status === 'error') return <XCircle className="h-4 w-4 text-red-400" />
    return null
  }

  // Group active employees by frequency
  const grouped = FREQ_ORDER.reduce<Record<string, Employee[]>>((acc, freq) => {
    const group = employees.filter(e => e.pay_frequency === freq)
    if (group.length > 0) acc[freq] = group
    return acc
  }, {})

  return (
    <div className="fade-in">
      <Header title="Payroll Schedule" subtitle="AI-powered automatic salary payments" />
      <div className="p-6 space-y-6">

        {/* Auto-payroll control card */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${schedule?.active ? 'bg-[#6c44fc]/15 border-[#6c44fc]/25' : 'bg-white/5 border-white/8'}`}>
                <Bot className={`h-5 w-5 ${schedule?.active ? 'text-[#6c44fc]' : 'text-[#666666]'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-white">Claude AI Payroll Agent</h3>
                  {schedule?.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />Active
                    </span>
                  ) : schedule ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-xs text-[#666666]">Paused</span>
                  ) : null}
                </div>
                <p className="text-xs text-[#999999] mt-1 max-w-lg">
                  Runs daily at 9AM UTC. Pays each employee on their own schedule — weekly employees every week, monthly employees every month — based on their <span className="text-white">next pay date</span>.
                </p>
                {schedule?.last_run_at && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#666666]">
                    {statusIcon(schedule.last_run_status)}
                    <span>Last run: {formatDate(schedule.last_run_at)}</span>
                    {schedule.last_run_status && (
                      <span className={`capitalize ${schedule.last_run_status === 'success' ? 'text-[#95ffdd]' : schedule.last_run_status === 'skipped' ? 'text-amber-400' : 'text-red-400'}`}>
                        ({schedule.last_run_status})
                      </span>
                    )}
                  </div>
                )}
                {schedule?.last_ai_reason && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <Shield className="h-3 w-3 text-[#6c44fc] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#666666] italic">"{schedule.last_ai_reason}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!schedule ? (
                <Button onClick={enableAutoPayroll} loading={saving}>
                  <Zap className="h-4 w-4" /> Enable Auto-Payroll
                </Button>
              ) : (
                <>
                  <button
                    onClick={toggleAI}
                    disabled={saving}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                      schedule.ai_enabled
                        ? 'bg-[#6c44fc]/10 border-[#6c44fc]/20 text-[#6c44fc] hover:bg-[#6c44fc]/15'
                        : 'bg-white/5 border-white/8 text-[#666666] hover:bg-white/8'
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5" />
                    AI {schedule.ai_enabled ? 'On' : 'Off'}
                  </button>
                  <button
                    onClick={toggleActive}
                    disabled={saving}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      schedule.active
                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
                        : 'bg-[#95ffdd]/10 text-[#95ffdd] hover:bg-[#95ffdd]/15'
                    }`}
                  >
                    {schedule.active ? <><Pause className="h-3.5 w-3.5" />Pause</> : <><Play className="h-3.5 w-3.5" />Activate</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Employee payment schedule by frequency */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-32 rounded-xl bg-[#141414] shimmer" />)}
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-xl border border-white/8 bg-[#141414] p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-[#333333] mb-3" />
            <p className="text-sm text-[#666666]">No active employees yet</p>
            <p className="text-xs text-[#444444] mt-1">Add employees to set up their payment schedules</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white">Employee Payment Schedules</h2>
            {Object.entries(grouped).map(([freq, emps]) => (
              <div key={freq} className="rounded-xl border border-white/8 bg-[#141414]">
                <div className="flex items-center gap-3 border-b border-white/8 px-6 py-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#6c44fc]/15 border border-[#6c44fc]/20">
                    <Clock className="h-3.5 w-3.5 text-[#6c44fc]" />
                  </div>
                  <span className="text-sm font-semibold text-white">{FREQ_LABELS[freq] ?? freq}</span>
                  <span className="text-xs text-[#666666]">{emps.length} employee{emps.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {emps.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white shrink-0">
                          {emp.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{emp.full_name}</p>
                          <p className="text-xs text-[#666666]">{emp.job_role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {!emp.wallet_address && (
                          <span className="text-xs text-amber-400">No wallet</span>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-[#666666]">Next payment</p>
                          <p className="text-sm font-medium text-[#95ffdd]">
                            {emp.next_pay_date ? formatDate(emp.next_pay_date) : '—'}
                          </p>
                        </div>
                        {schedule?.active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd]">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />Auto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-xs text-[#666666]">Manual</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">How It Works</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, color: 'text-[#5de2da]', bg: 'bg-[#5de2da]/10 border-[#5de2da]/20', title: 'Per-Employee Schedule', desc: 'Each employee has their own pay frequency set when added. Weekly, biweekly, or monthly.' },
              { icon: Bot, color: 'text-[#6c44fc]', bg: 'bg-[#6c44fc]/10 border-[#6c44fc]/20', title: 'AI Reviews Daily', desc: 'Claude checks who is due for payment, verifies your balance, and approves or skips with a reason.' },
              { icon: Zap, color: 'text-[#95ffdd]', bg: 'bg-[#95ffdd]/10 border-[#95ffdd]/20', title: 'Auto Pay & Update', desc: 'Payment fires on Solana. Next pay date is automatically advanced to the next period.' },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={i} className="rounded-lg bg-white/4 border border-white/6 p-4">
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${bg} mb-3`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-sm font-semibold text-white mb-1">{title}</p>
                <p className="text-xs text-[#666666]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
