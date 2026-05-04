import { NextRequest, NextResponse } from 'next/server'
import { getSession, createSessionCookie } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, company_name } = await req.json()

    if (!name?.trim() || !email?.trim() || !company_name?.trim()) {
      return NextResponse.json({ error: 'Name, email and company name are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    // Check email not already taken by another account
    const newEmail = email.toLowerCase().trim()
    if (newEmail !== employer.email) {
      const existing = await db.getEmployerByEmail(newEmail)
      if (existing) {
        return NextResponse.json({ error: 'That email is already in use' }, { status: 409 })
      }
    }

    await db.updateEmployer(employer.id, {
      name: name.trim(),
      email: newEmail,
      company_name: company_name.trim(),
    })

    // Refresh the session cookie with updated info
    const newSession = {
      id: employer.id,
      email: newEmail,
      name: name.trim(),
      role: 'employer' as const,
      company_name: company_name.trim(),
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('flashpay_session', await createSessionCookie(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Update profile error:', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
