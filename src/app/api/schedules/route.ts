import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

function computeFirstRunAt(frequency: string, payDay: number): string {
  const now = new Date()
  const next = new Date(now)

  if (frequency === 'monthly') {
    // If pay day this month has passed, schedule next month
    if (now.getDate() >= payDay) {
      next.setMonth(next.getMonth() + 1)
    }
    next.setDate(payDay)
  } else if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14)
  } else {
    next.setDate(next.getDate() + 7)
  }

  next.setHours(9, 0, 0, 0)
  return next.toISOString()
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'employer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const employer = await db.getEmployerByEmail(session.email)
  if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedules = await db.getSchedules(employer.id)
  return NextResponse.json({ schedules })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'employer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const employer = await db.getEmployerByEmail(session.email)
  if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, frequency, pay_day, ai_enabled } = await req.json()

  if (!name?.trim() || !frequency || !pay_day) {
    return NextResponse.json({ error: 'Name, frequency and pay day are required' }, { status: 400 })
  }

  // next_run_at is set to tomorrow — actual timing is driven by employee next_pay_date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  const schedule = await db.createSchedule({
    employer_id: employer.id,
    name: name.trim(),
    frequency,
    pay_day: Number(pay_day),
    active: true,
    ai_enabled: ai_enabled ?? true,
    next_run_at: tomorrow.toISOString(),
    last_run_at: null,
    last_run_status: null,
    last_ai_reason: null,
  })

  return NextResponse.json({ schedule })
}
