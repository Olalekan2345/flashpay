import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const records = await db.getPayrollRecords(employer.id)
    const sorted = records.sort((a, b) =>
      new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime()
    )

    return NextResponse.json({ records: sorted })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch payroll records' }, { status: 500 })
  }
}
