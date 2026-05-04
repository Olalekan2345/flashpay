'use client'
import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Calendar, Zap, Clock, Play, Pause, Plus, Trash2,
  Bot, CheckCircle2, XCircle, AlertCircle, Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Schedule {
  id: string
  name: string
  frequency: 'weekly' | 'biweekly' | 'monthly'
  pay_day: number
  active: boolean
  ai_enabled: boolean
  next_run_at: string
  last_run_at: string | null
  last_run_status: string | null
  last_ai_reason: string | null
}

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', frequency: 'monthly', pay_day: '1', ai_enabled: true })

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/schedules')
      const data = await res.json()
      setSchedules(data.schedules ?? [])
    } catch {
      toast.error('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  const toggleActive = async (s: Schedule) => {
    try {
      await fetch(`/api/schedules/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !s.active }),
      })
      setSchedules(prev => prev.map(x => x.id === s.id ? { ...x, active: !x.active } : x))
      toast.success(`${s.name} ${s.active ? 'paused' : 'activated'}`)
    } catch { toast.error('Failed to update schedule') }
  }

  const deleteSchedule = async (s: Schedule) => {
    if (!confirm(`Delete "${s.name}"?`)) return
    try {
      await fetch(`/api/schedules/${s.id}`, { method: 'DELETE' })
      setSchedules(prev => prev.filter(x => x.id !== s.id))
      toast.success('Schedule deleted')
    } catch { toast.error('Failed to delete schedule') }
  }

  const createSchedule = async () => {
    if (!form.name.trim()) return toast.error('Schedule name is required')
    setCreating(true)
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSchedules(prev => [...prev, data.schedule])
      setShowCreate(false)
      setForm({ name: '', frequency: 'monthly', pay_day: '1', ai_enabled: true })
      toast.success('Schedule created — AI agent is active')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create schedule')
    } finally {
      setCreating(false)
    }
  }

  const statusIcon = (status: string | null) => {
    if (status === 'success') return <CheckCircle2 className="h-3.5 w-3.5 text-[#95ffdd]" />
    if (status === 'skipped') return <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
    if (status === 'error') return <XCircle className="h-3.5 w-3.5 text-red-400" />
    return null
  }

  return (
    <div className="fade-in">
      <Header title="Payroll Schedule" subtitle="AI-powered automatic salary payments" />
      <div className="p-6 space-y-6">

        {/* AI Agent Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-[#6c44fc]/25 bg-[#6c44fc]/8 px-4 py-4">
          <Bot className="h-5 w-5 text-[#6c44fc] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Claude AI Payroll Agent</p>
            <p className="text-xs text-[#999999] mt-0.5">
              Runs daily at 9:00 AM UTC. Reviews your treasury balance, active employees, and schedule — then decides whether to execute payroll automatically. You receive an email after every run.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#999999]">
            {schedules.length === 0
              ? 'No schedules yet. Create one to enable auto-payroll.'
              : `${schedules.filter(s => s.active).length} active schedule${schedules.filter(s => s.active).length !== 1 ? 's' : ''}`}
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> New Schedule
          </Button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="rounded-xl border border-[#6c44fc]/25 bg-[#141414] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Create Auto-Payroll Schedule</h3>
            <Input
              label="Schedule Name"
              placeholder="e.g. Monthly Full-time Payroll"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#999999] mb-1.5">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6c44fc]/50"
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              {form.frequency === 'monthly' && (
                <Input
                  label="Pay Day (day of month)"
                  type="number"
                  placeholder="1"
                  value={form.pay_day}
                  onChange={e => setForm(f => ({ ...f, pay_day: e.target.value }))}
                />
              )}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm(f => ({ ...f, ai_enabled: !f.ai_enabled }))}
                className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${form.ai_enabled ? 'bg-[#6c44fc]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.ai_enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Enable AI agent</p>
                <p className="text-xs text-[#666666]">Claude reviews conditions before each run</p>
              </div>
            </label>
            <div className="flex gap-2 pt-2">
              <Button onClick={createSchedule} loading={creating} className="flex-1">
                <Bot className="h-4 w-4" /> Create Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Schedule list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-[#141414] shimmer" />)}
          </div>
        ) : schedules.length === 0 && !showCreate ? (
          <div className="rounded-xl border border-white/8 bg-[#141414] p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-[#333333] mb-3" />
            <p className="text-sm text-[#666666]">No schedules yet</p>
            <p className="text-xs text-[#444444] mt-1">Create a schedule to automate payroll with AI</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {schedules.map(schedule => (
              <div key={schedule.id} className="rounded-xl border border-white/8 bg-[#141414] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${schedule.active ? 'bg-[#6c44fc]/15 border-[#6c44fc]/25' : 'bg-white/5 border-white/8'}`}>
                      <Calendar className={`h-5 w-5 ${schedule.active ? 'text-[#6c44fc]' : 'text-[#666666]'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white">{schedule.name}</h3>
                        {schedule.active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd]">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-xs text-[#666666]">Paused</span>
                        )}
                        {schedule.ai_enabled && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#6c44fc]/10 border border-[#6c44fc]/20 px-2 py-0.5 text-xs text-[#6c44fc]">
                            <Bot className="h-3 w-3" />AI
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{FREQ_LABELS[schedule.frequency]}</span>
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-[#5de2da]" />Next: {formatDate(schedule.next_run_at)}</span>
                        {schedule.last_run_at && (
                          <span className="flex items-center gap-1">
                            {statusIcon(schedule.last_run_status)}
                            Last run: {formatDate(schedule.last_run_at)}
                          </span>
                        )}
                      </div>
                      {schedule.last_ai_reason && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Shield className="h-3 w-3 text-[#6c44fc] mt-0.5 shrink-0" />
                          <p className="text-xs text-[#666666] italic">"{schedule.last_ai_reason}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => deleteSchedule(schedule)}
                      className="rounded-lg p-2 text-[#666666] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(schedule)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        schedule.active
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
                          : 'bg-[#95ffdd]/10 text-[#95ffdd] hover:bg-[#95ffdd]/15'
                      }`}
                    >
                      {schedule.active ? <><Pause className="h-3.5 w-3.5" />Pause</> : <><Play className="h-3.5 w-3.5" />Activate</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">How the AI Agent Works</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, color: 'text-[#5de2da]', bg: 'bg-[#5de2da]/10 border-[#5de2da]/20', title: 'Daily Check', desc: 'Agent runs at 9AM UTC every day and checks which schedules are due.' },
              { icon: Bot, color: 'text-[#6c44fc]', bg: 'bg-[#6c44fc]/10 border-[#6c44fc]/20', title: 'AI Decision', desc: 'Claude reviews your balance, employees, and conditions — approves or skips with a reason.' },
              { icon: Zap, color: 'text-[#95ffdd]', bg: 'bg-[#95ffdd]/10 border-[#95ffdd]/20', title: 'Auto Execute', desc: 'Payroll fires on Solana and you receive an email summary with the AI\'s reasoning.' },
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
