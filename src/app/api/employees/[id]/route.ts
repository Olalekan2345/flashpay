import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { arciumEncryptSalary, createSalaryToken } from '@/lib/arcium'
import { getNextPayDate } from '@/lib/utils'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const { id } = await params
    const employee = await db.getEmployee(id)
    if (!employee || employee.employer_id !== employer.id) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const body = await req.json()
    const { salary_amount, job_role, pay_frequency } = body

    const updates: Record<string, unknown> = {}

    if (job_role?.trim()) updates.job_role = job_role.trim()
    if (pay_frequency) {
      updates.pay_frequency = pay_frequency
      updates.next_pay_date = getNextPayDate(pay_frequency)
    }

    if (typeof salary_amount === 'number' && salary_amount > 0) {
      const encrypted = arciumEncryptSalary(salary_amount, employer.id, id)
      updates.salary_encrypted = JSON.stringify(encrypted)
      updates.salary_token = createSalaryToken(salary_amount, id)
    }

    const updated = await db.updateEmployee(id, updates)
    const { salary_token: _, ...safe } = updated
    return NextResponse.json({ success: true, employee: safe })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const { id } = await params
    const employee = await db.getEmployee(id)
    if (!employee || employee.employer_id !== employer.id) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    await db.deleteEmployee(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to remove employee' }, { status: 500 })
  }
}
