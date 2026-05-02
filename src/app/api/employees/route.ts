import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { arciumEncryptSalary, createSalaryToken } from '@/lib/arcium'
import { generateInviteToken, getNextPayDate } from '@/lib/utils'
import { sendInviteEmail } from '@/lib/email'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const employees = await db.getEmployees(employer.id)
    const safeEmployees = employees.map(({ salary_token: _, ...emp }) => emp)

    return NextResponse.json({ employees: safeEmployees })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const body = await req.json()
    const { full_name, email, country, job_role, wallet_address, pay_frequency, salary_amount } = body

    if (!full_name || !email || !country || !job_role || !salary_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof salary_amount !== 'number' || salary_amount <= 0) {
      return NextResponse.json({ error: 'Invalid salary amount' }, { status: 400 })
    }

    const tempId = 'worker_' + Date.now()
    const encrypted = arciumEncryptSalary(salary_amount, employer.id, tempId)
    const salaryToken = createSalaryToken(salary_amount, tempId)
    const inviteToken = generateInviteToken()
    const nextPayDate = getNextPayDate(pay_frequency || 'monthly')

    const employee = await db.createEmployee({
      employer_id: employer.id,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      country,
      job_role: job_role.trim(),
      wallet_address: wallet_address?.trim() || null,
      pay_frequency: pay_frequency || 'monthly',
      salary_encrypted: JSON.stringify(encrypted),
      salary_token: salaryToken,
      status: 'pending_onboarding',
      invite_token: inviteToken,
      invite_expires_at: null,
      next_pay_date: nextPayDate,
    })

    let emailError: string | null = null
    if (process.env.BREVO_API_KEY) {
      try {
        await sendInviteEmail({
          employeeName: full_name.trim(),
          employeeEmail: email.toLowerCase().trim(),
          companyName: employer.company_name,
          jobRole: job_role.trim(),
          inviteToken,
        })
      } catch (err) {
        emailError = err instanceof Error ? err.message : 'Unknown email error'
        console.error('[FlashPay] Invite email failed:', emailError)
      }
    }
    console.log(`[FlashPay] Invite link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inviteToken}`)

    const { salary_token: _, ...safeEmployee } = employee
    return NextResponse.json({
      success: true,
      employee: safeEmployee,
      email_sent: !emailError,
      email_error: emailError,
    }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}
