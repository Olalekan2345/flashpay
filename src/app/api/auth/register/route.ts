import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionCookie, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, company_name, password } = await req.json()

    if (!name || !email || !company_name || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await db.getEmployerByEmail(email.toLowerCase().trim())
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const employer = await db.createEmployer({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: hashPassword(password),
      company_name: company_name.trim(),
      company_logo: null,
      wallet_address: null,
      treasury_balance: 0,
    })

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
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
