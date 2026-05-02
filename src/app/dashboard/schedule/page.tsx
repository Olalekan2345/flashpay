'use client'
import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Calendar, Zap, Clock, Settings, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

const schedules = [
  { id: '1', name: 'Monthly Payroll', frequency: 'monthly', next_run: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(), active: true, employees: 4 },
  { id: '2', name: 'Weekly Freelance', frequency: 'weekly', next_run: new Date(Date.now() + 7 * 86400000).toISOString(), active: true, employees: 1 },
]

export default function SchedulePage() {
  const [scheduleList, setScheduleList] = useState(schedules)

  const toggleSchedule = (id: string) => {
    setScheduleList(prev => prev.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ))
    const s = scheduleList.find(s => s.id === id)
    if (s) toast.success(`${s.name} ${s.active ? 'paused' : 'activated'}`)
  }

  return (
    <div className="fade-in">
      <Header title="Payroll Schedule" subtitle="Automate recurring salary runs" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#999999]">Set up automatic payroll runs so you never miss a pay date.</p>
          <Button onClick={() => toast.success('Schedule creation coming soon!')}>
            <Calendar className="h-4 w-4" />New Schedule
          </Button>
        </div>

        <div className="grid gap-4">
          {scheduleList.map(schedule => (
            <div key={schedule.id} className="rounded-xl border border-white/8 bg-[#141414] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${schedule.active ? 'bg-[#6c44fc]/15 border-[#6c44fc]/25' : 'bg-white/5 border-white/8'}`}>
                    <Calendar className={`h-5 w-5 ${schedule.active ? 'text-[#6c44fc]' : 'text-[#666666]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{schedule.name}</h3>
                      {schedule.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2 py-0.5 text-xs text-[#95ffdd]">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-xs text-[#666666]">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-[#666666]">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{schedule.frequency}</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-[#5de2da]" />Next: {formatDate(schedule.next_run)}</span>
                      <span>{schedule.employees} employee{schedule.employees > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-[#666666] hover:bg-white/8 hover:text-white transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
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

        <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Payroll Schedule Options</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { freq: 'Monthly', desc: 'Run on the 1st of each month. Best for salaried full-time employees.' },
              { freq: 'Weekly', desc: 'Run every 7 days. Ideal for hourly contractors and frequent freelancers.' },
              { freq: 'One-time', desc: 'Manual single payment. Perfect for project milestones and bonuses.' },
            ].map(({ freq, desc }, i) => (
              <div key={i} className="rounded-lg bg-white/4 border border-white/6 p-4">
                <p className="text-sm font-semibold text-white mb-1">{freq}</p>
                <p className="text-xs text-[#666666]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
