import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionCookie } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const employee = await db.getEmployeeByInviteToken(token)
    if (!employee) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    const employer = await db.getEmployer(employee.employer_id)

    return NextResponse.json({
      employee: {
        id: employee.id,
        full_name: employee.full_name,
        email: employee.email,
        job_role: employee.job_role,
        country: employee.country,
        pay_frequency: employee.pay_frequency,
        status: employee.status,
      },
      employer: employer ? { company_name: employer.company_name } : null,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, wallet_address } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const employee = await db.getEmployeeByInviteToken(token)
    if (!employee) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })
    }

    await db.updateEmployee(employee.id, {
      status: 'active',
      wallet_address: wallet_address || employee.wallet_address,
    })

    const session = {
      id: employee.id,
      email: employee.email,
      name: employee.full_name,
      role: 'employee' as const,
    }

    const response = NextResponse.json({ success: true, redirect: '/employee' })
    response.cookies.set('flashpay_session', await createSessionCookie(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Onboarding failed' }, { status: 500 })
  }
}
