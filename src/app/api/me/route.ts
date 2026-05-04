import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ name: 'Admin', initials: 'AD' })

  const initials = session.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return NextResponse.json({
    name: session.name,
    initials,
    email: session.email,
    company_name: session.company_name,
  })
}
