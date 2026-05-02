import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'employer' | 'employee'
  company_name?: string
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('flashpay_session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function createSessionCookie(user: SessionUser): Promise<string> {
  return new SignJWT(user as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}

export async function requireEmployerAuth(): Promise<SessionUser> {
  const session = await requireAuth()
  if (session.role !== 'employer') throw new Error('FORBIDDEN: Employer access required')
  return session
}

export function hashPassword(password: string): string {
  let hash = 0
  const input = password + 'flashpay_salt_2024'
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
