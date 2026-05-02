import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { wallet_address } = await req.json()
    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const employer = await db.getEmployerByWallet(wallet_address)
    return NextResponse.json({ exists: !!employer })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
