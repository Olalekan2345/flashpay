import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionCookie } from '@/lib/auth'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, signature, message, full_name, company_name } = await req.json()

    if (!wallet_address || !signature || !message) {
      return NextResponse.json({ error: 'Wallet address, signature, and message required' }, { status: 400 })
    }

    try {
      const pubkey = new PublicKey(wallet_address)
      const sigBytes = Buffer.from(signature, 'hex')
      const msgBytes = Buffer.from(message, 'hex')
      const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes())
      if (!valid) throw new Error('Signature verification failed')

      const decoded = new TextDecoder().decode(msgBytes)
      if (!decoded.startsWith('Sign in to FlashPay Private')) {
        throw new Error('Invalid message prefix')
      }
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const existingEmployee = await db.getEmployeeByWallet(wallet_address)
    if (existingEmployee) {
      return NextResponse.json({
        error: 'This wallet is registered as an employee. Ask your employer to remove you before signing in as an employer.',
      }, { status: 403 })
    }

    let employer = await db.getEmployerByWallet(wallet_address)

    if (!employer) {
      if (!full_name?.trim() || !company_name?.trim()) {
        return NextResponse.json({ error: 'Full name and company name required for new accounts' }, { status: 400 })
      }

      employer = await db.createEmployer({
        name: full_name.trim(),
        email: `${wallet_address.slice(0, 8).toLowerCase()}@wallet.flashpay`,
        password_hash: '',
        company_name: company_name.trim(),
        company_logo: null,
        wallet_address,
        treasury_balance: 0,
      })
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
    console.error('Wallet login error:', err)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
