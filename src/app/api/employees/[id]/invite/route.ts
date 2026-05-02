import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendInviteEmail } from '@/lib/email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const employee = await db.getEmployee(id)
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const employer = await db.getEmployer(employee.employer_id)

    if (process.env.BREVO_API_KEY) {
      await sendInviteEmail({
        employeeName: employee.full_name,
        employeeEmail: employee.email,
        companyName: employer?.company_name || 'Your employer',
        jobRole: employee.job_role,
        inviteToken: employee.invite_token!,
      })
    } else {
      console.log(`[FlashPay] Invite link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${employee.invite_token}`)
    }

    return NextResponse.json({ success: true, message: 'Invite sent' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to resend invite' }, { status: 500 })
  }
}
