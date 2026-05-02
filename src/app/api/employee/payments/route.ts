import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employee = await db.getEmployeeByEmail(session.email)
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const payments = (await db.getEmployeePayroll(employee.id))
      .filter(r => r.status === 'completed')
      .sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime())

    return NextResponse.json({ payments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
