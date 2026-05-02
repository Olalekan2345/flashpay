import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionCookie, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const employer = await db.getEmployerByEmail(email.toLowerCase().trim())
    if (!employer || hashPassword(password) !== employer.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const session = {
      id: employer.id,
      email: employer.email,
      name: employer.name,
      role: 'employer' as const,
      company_name: employer.company_name,
    }

    const response = NextResponse.json({
      success: true,
      user: { id: employer.id, name: employer.name, company_name: employer.company_name },
      redirect: '/dashboard',
    })

    response.cookies.set('flashpay_session', await createSessionCookie(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
